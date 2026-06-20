import {
  assertNoVenueScheduleConflict,
} from "@/modules/events/transform";
import type { EventRecord } from "@/modules/events/types";
import { EventError } from "@/modules/events/errors";
import { getVenueStore } from "@/modules/venues";
import { getDb } from "@/persistence/db";
import {
  getDefaultEventRepository,
  getDefaultGolfSeasonScheduleRepository,
  getDefaultGolfTourRepository,
  getDefaultGolfTourSchedulerStateRepository,
  getDefaultGolfTournamentRepository,
  getDefaultGolfTournamentVenueRepository,
  getDefaultLocationRepository,
  getDefaultVenueResourceRepository,
  type EventRepository,
  type GolfSeasonScheduleRepository,
  type GolfTourRepository,
  type GolfTourSchedulerStateRepository,
  type GolfTournamentRepository,
  type GolfTournamentVenueRepository,
  type LocationRepository,
  type VenueResourceRepository,
} from "@/persistence/repositories";
import {
  isPgaTourEnabled,
  loadPgaTourScheduleReleaseConfig,
} from "@/persistence/seed/golf-config";
import { GolfError, GolfErrorCodes } from "./errors";
import { buildTournamentEventTree } from "./materialize";
import {
  computeReleaseInstantUtc,
  findCrossedReleaseYears,
  seasonYearForRelease,
} from "./release";
import type {
  GolfSchedulingProcessResult,
  GolfSeasonSchedule,
  GolfTournament,
  GolfTournamentVenue,
} from "./types";

const PGA_TOUR_ABBREVIATION = "PGA";

export interface SchedulingRepositories {
  eventRepository: EventRepository;
  tourRepository: GolfTourRepository;
  tournamentRepository: GolfTournamentRepository;
  tournamentVenueRepository: GolfTournamentVenueRepository;
  seasonScheduleRepository: GolfSeasonScheduleRepository;
  schedulerStateRepository: GolfTourSchedulerStateRepository;
  locationRepository: LocationRepository;
  venueResourceRepository: VenueResourceRepository;
}

let schedulingRepositoriesOverride: SchedulingRepositories | null = null;

export function setSchedulingRepositoriesForTests(
  repositories: SchedulingRepositories | null,
): void {
  schedulingRepositoriesOverride = repositories;
}

function getSchedulingRepositories(): SchedulingRepositories {
  if (schedulingRepositoriesOverride) {
    return schedulingRepositoriesOverride;
  }

  return {
    eventRepository: getDefaultEventRepository(),
    tourRepository: getDefaultGolfTourRepository(),
    tournamentRepository: getDefaultGolfTournamentRepository(),
    tournamentVenueRepository: getDefaultGolfTournamentVenueRepository(),
    seasonScheduleRepository: getDefaultGolfSeasonScheduleRepository(),
    schedulerStateRepository: getDefaultGolfTourSchedulerStateRepository(),
    locationRepository: getDefaultLocationRepository(),
    venueResourceRepository: getDefaultVenueResourceRepository(),
  };
}

function pickVenueLink(
  tournament: GolfTournament,
  venueLinks: readonly GolfTournamentVenue[],
  seasonYear: number,
): GolfTournamentVenue {
  if (venueLinks.length === 0) {
    throw new GolfError(
      GolfErrorCodes.VENUE_POOL_EMPTY,
      `No venues configured for tournament ${tournament.slug}`,
    );
  }

  const sorted = [...venueLinks].sort(
    (left, right) => left.rotationOrder - right.rotationOrder,
  );

  if (tournament.venueMode === "fixed") {
    return sorted.find((link) => link.isDefault) ?? sorted[0]!;
  }

  const epoch = tournament.rotationEpochYear ?? seasonYear;
  const index =
    ((seasonYear - epoch) % sorted.length + sorted.length) % sorted.length;
  return sorted[index]!;
}

async function validatePlannedEvents(
  planned: readonly EventRecord[],
  repositories: SchedulingRepositories,
): Promise<void> {
  const existing = await repositories.eventRepository.list();
  const combined = [...existing, ...planned];
  const eventsById = new Map(combined.map((event) => [event.id, event]));

  for (let index = 0; index < planned.length; index += 1) {
    const event = planned[index]!;
    const priorPlanned = planned.slice(0, index);
    const venue = await getVenueStore().get(event.venueId);
    const eventsAtVenue = [
      ...existing.filter((candidate) => candidate.venueId === event.venueId),
      ...priorPlanned.filter((candidate) => candidate.venueId === event.venueId),
    ];

    try {
      assertNoVenueScheduleConflict(
        event,
        eventsAtVenue,
        eventsById,
        venue.schedulingMode,
      );
    } catch (error) {
      if (error instanceof EventError) {
        throw new GolfError(
          GolfErrorCodes.SCHEDULE_BATCH_FAILED,
          `Schedule validation failed for "${event.name}": ${error.message}`,
          error,
        );
      }
      throw error;
    }
  }
}

async function persistSeasonBatch(input: {
  events: readonly EventRecord[];
  schedules: readonly GolfSeasonSchedule[];
  tourAbbreviation: string;
  processedIsoUtc: string;
  seasonYear: number;
  repositories: SchedulingRepositories;
}): Promise<void> {
  const { repositories } = input;
  const createdEventIds: string[] = [];

  try {
    if (process.env.VITEST !== "true") {
      const db = getDb();
      db.transaction(() => {
        for (const event of input.events) {
          void repositories.eventRepository.create(event);
          createdEventIds.push(event.id);
        }
        for (const schedule of input.schedules) {
          void repositories.seasonScheduleRepository.create(schedule);
        }
      })();
    } else {
      for (const event of input.events) {
        await repositories.eventRepository.create(event);
        createdEventIds.push(event.id);
      }
      for (const schedule of input.schedules) {
        await repositories.seasonScheduleRepository.create(schedule);
      }
    }

    await repositories.schedulerStateRepository.upsert({
      tourAbbreviation: input.tourAbbreviation,
      lastProcessedIsoUtc: input.processedIsoUtc,
      lastScheduledSeasonYear: input.seasonYear,
    });
  } catch (error) {
    for (const eventId of createdEventIds) {
      await repositories.eventRepository.delete(eventId);
    }
    throw error;
  }
}

export async function schedulePgaTourSeason(
  seasonYear: number,
  scheduledAtIsoUtc: string,
  repositories: SchedulingRepositories = getSchedulingRepositories(),
): Promise<void> {
  if (!isPgaTourEnabled()) {
    throw new GolfError(
      GolfErrorCodes.TOUR_DISABLED,
      "PGA Tour scheduling is disabled (PGA_TOUR_ENABLED=false)",
    );
  }

  const tourRepository = repositories.tourRepository;
  const tournamentRepository = repositories.tournamentRepository;
  const tournamentVenueRepository = repositories.tournamentVenueRepository;
  const scheduleRepository = repositories.seasonScheduleRepository;
  const schedulerStateRepository = repositories.schedulerStateRepository;
  const locationRepository = repositories.locationRepository;
  const venueResourceRepository = repositories.venueResourceRepository;

  const tour = await tourRepository.getByAbbreviation(PGA_TOUR_ABBREVIATION);
  if (!tour) {
    throw new GolfError(
      GolfErrorCodes.TOUR_NOT_FOUND,
      "PGA Tour catalog not found — enable PGA_TOUR_SEED_ON_STARTUP",
    );
  }

  const schedulerState = await schedulerStateRepository.get(PGA_TOUR_ABBREVIATION);
  if (
    schedulerState?.lastScheduledSeasonYear !== null &&
    schedulerState?.lastScheduledSeasonYear !== undefined &&
    schedulerState.lastScheduledSeasonYear >= seasonYear
  ) {
    return;
  }

  const tournaments = await tournamentRepository.listByTour(tour.id);
  const plannedEvents: EventRecord[] = [];
  const schedules: GolfSeasonSchedule[] = [];

  for (const tournament of tournaments) {
    const existingSchedule = await scheduleRepository.getByTourTournamentSeason(
      tour.id,
      tournament.id,
      seasonYear,
    );
    if (existingSchedule) {
      continue;
    }

    const venueLinks = await tournamentVenueRepository.listByTournament(
      tournament.id,
    );
    const venueLink = pickVenueLink(tournament, venueLinks, seasonYear);
    const venue = await getVenueStore().get(venueLink.venueId);
    const location = await locationRepository.get(venue.locationId);
    if (!location) {
      throw new GolfError(
        GolfErrorCodes.VENUE_NOT_FOUND,
        `Location missing for venue ${venue.name}`,
      );
    }

    const teeGroups = await venueResourceRepository.listByVenue(venue.id);
    const tree = buildTournamentEventTree({
      tournament,
      seasonYear,
      venueId: venue.id,
      timezone: location.timezone,
      teeGroups,
    });

    plannedEvents.push(...tree);
    schedules.push({
      id: crypto.randomUUID(),
      tourId: tour.id,
      tournamentId: tournament.id,
      seasonYear,
      venueId: venue.id,
      rootEventId: tree[0]!.id,
      scheduledAtIsoUtc,
    });
  }

  if (schedules.length === 0) {
    await schedulerStateRepository.upsert({
      tourAbbreviation: PGA_TOUR_ABBREVIATION,
      lastProcessedIsoUtc: scheduledAtIsoUtc,
      lastScheduledSeasonYear: seasonYear,
    });
    return;
  }

  try {
    await validatePlannedEvents(plannedEvents, repositories);
    await persistSeasonBatch({
      events: plannedEvents,
      schedules,
      tourAbbreviation: PGA_TOUR_ABBREVIATION,
      processedIsoUtc: scheduledAtIsoUtc,
      seasonYear,
      repositories,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown scheduling failure";
    const cause =
      error instanceof GolfError && error.cause instanceof Error
        ? error.cause.message
        : error instanceof EventError
          ? error.message
          : undefined;

    console.error(
      `[pga tour schedule] FAILED season ${seasonYear}: ${message}${cause ? ` — cause: ${cause}` : ""}`,
    );
    throw error;
  }

  console.info(
    `[pga tour schedule] scheduled ${seasonYear} season: ${schedules.length} tournaments, ${plannedEvents.length} events`,
  );
}

export async function processPgaTourClockTransition(
  beforeIsoUtc: string,
  afterIsoUtc: string,
): Promise<GolfSchedulingProcessResult> {
  if (!isPgaTourEnabled()) {
    return {
      tourAbbreviation: PGA_TOUR_ABBREVIATION,
      scheduled: false,
    };
  }

  const repositories = getSchedulingRepositories();
  const releaseConfig = loadPgaTourScheduleReleaseConfig();
  const crossedYears = findCrossedReleaseYears(
    beforeIsoUtc,
    afterIsoUtc,
    releaseConfig,
  );

  if (crossedYears.length === 0) {
    await repositories.schedulerStateRepository.upsert({
      tourAbbreviation: PGA_TOUR_ABBREVIATION,
      lastProcessedIsoUtc: afterIsoUtc,
      lastScheduledSeasonYear:
        (await repositories.schedulerStateRepository.get(
          PGA_TOUR_ABBREVIATION,
        ))?.lastScheduledSeasonYear ?? null,
    });
    return {
      tourAbbreviation: PGA_TOUR_ABBREVIATION,
      scheduled: false,
    };
  }

  try {
    for (const releaseYear of crossedYears) {
      const seasonYear = seasonYearForRelease(releaseYear);
      await schedulePgaTourSeason(seasonYear, afterIsoUtc, repositories);
    }

    return {
      tourAbbreviation: PGA_TOUR_ABBREVIATION,
      scheduled: true,
      seasonYear: seasonYearForRelease(crossedYears[crossedYears.length - 1]!),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scheduling failed";
    const cause =
      error instanceof GolfError && error.cause instanceof Error
        ? error.cause.message
        : undefined;

    return {
      tourAbbreviation: PGA_TOUR_ABBREVIATION,
      scheduled: false,
      error: message,
      cause,
    };
  }
}

export async function processGolfSchedulers(
  beforeIsoUtc: string,
  afterIsoUtc: string,
): Promise<GolfSchedulingProcessResult[]> {
  const results: GolfSchedulingProcessResult[] = [];
  results.push(await processPgaTourClockTransition(beforeIsoUtc, afterIsoUtc));
  return results;
}

export async function processGolfSchedulersNow(
  isoUtc: string,
): Promise<GolfSchedulingProcessResult[]> {
  if (!isPgaTourEnabled()) {
    return [
      {
        tourAbbreviation: PGA_TOUR_ABBREVIATION,
        scheduled: false,
      },
    ];
  }

  const repositories = getSchedulingRepositories();
  const releaseConfig = loadPgaTourScheduleReleaseConfig();
  const nowMs = Date.parse(isoUtc);
  let seasonYear: number | null = null;

  const calendarYear = new Date(nowMs).getUTCFullYear();
  for (let releaseYear = calendarYear; releaseYear >= calendarYear - 2; releaseYear -= 1) {
    const releaseMs = Date.parse(computeReleaseInstantUtc(releaseYear, releaseConfig));
    if (nowMs >= releaseMs) {
      seasonYear = seasonYearForRelease(releaseYear);
      break;
    }
  }

  if (seasonYear === null) {
    return [
      {
        tourAbbreviation: PGA_TOUR_ABBREVIATION,
        scheduled: false,
      },
    ];
  }

  try {
    await schedulePgaTourSeason(seasonYear, isoUtc, repositories);
    return [
      {
        tourAbbreviation: PGA_TOUR_ABBREVIATION,
        scheduled: true,
        seasonYear,
      },
    ];
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scheduling failed";
    const cause =
      error instanceof GolfError && error.cause instanceof Error
        ? error.cause.message
        : undefined;

    return [
      {
        tourAbbreviation: PGA_TOUR_ABBREVIATION,
        scheduled: false,
        seasonYear,
        error: message,
        cause,
      },
    ];
  }
}
