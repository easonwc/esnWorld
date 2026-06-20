import {
  assertNoVenueScheduleConflict,
} from "@/modules/events/transform";
import type { EventRecord } from "@/modules/events/types";
import { EventError } from "@/modules/events/errors";
import { getVenueStore } from "@/modules/venues";
import {
  getGolfTourWinStore,
  tournamentRequiresPriorWinners,
} from "@/modules/golf-tour-wins";
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
  isDpWorldTourEnabled,
  isLpgaTourEnabled,
  isPgaTourEnabled,
  loadDpWorldTourScheduleReleaseConfig,
  loadLpgaTourScheduleReleaseConfig,
  loadPgaTourScheduleReleaseConfig,
  type GolfTourScheduleReleaseConfig,
} from "@/persistence/seed/golf-config";
import { GolfError, GolfErrorCodes } from "./errors";
import { pickAvailableVenueLink } from "./venue-pick";
import {
  computeReleaseInstantUtc,
  findCrossedReleaseYears,
  seasonYearForRelease,
} from "./release";
import type {
  GolfSchedulingProcessResult,
  GolfSeasonSchedule,
  GolfTournament,
  GolfTournamentScheduleReference,
} from "./types";

const PGA_TOUR_ABBREVIATION = "PGA";
const LPGA_TOUR_ABBREVIATION = "LPGA";
const DP_WORLD_TOUR_ABBREVIATION = "DPWT";

interface GolfTourSchedulerDefinition {
  abbreviation: string;
  label: string;
  seedEnvFlag: string;
  isEnabled: () => boolean;
  loadReleaseConfig: () => GolfTourScheduleReleaseConfig;
}

const GOLF_TOUR_SCHEDULERS: readonly GolfTourSchedulerDefinition[] = [
  {
    abbreviation: PGA_TOUR_ABBREVIATION,
    label: "pga tour",
    seedEnvFlag: "PGA_TOUR_SEED_ON_STARTUP",
    isEnabled: isPgaTourEnabled,
    loadReleaseConfig: loadPgaTourScheduleReleaseConfig,
  },
  {
    abbreviation: LPGA_TOUR_ABBREVIATION,
    label: "lpga tour",
    seedEnvFlag: "LPGA_TOUR_SEED_ON_STARTUP",
    isEnabled: isLpgaTourEnabled,
    loadReleaseConfig: loadLpgaTourScheduleReleaseConfig,
  },
  {
    abbreviation: DP_WORLD_TOUR_ABBREVIATION,
    label: "dp world tour",
    seedEnvFlag: "DP_WORLD_TOUR_SEED_ON_STARTUP",
    isEnabled: isDpWorldTourEnabled,
    loadReleaseConfig: loadDpWorldTourScheduleReleaseConfig,
  },
];

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

export async function shouldSkipTournamentWithoutPriorWinners(
  tournament: GolfTournament,
  tourId: string,
  seasonYear: number,
): Promise<boolean> {
  if (!tournamentRequiresPriorWinners(tournament)) {
    return false;
  }

  const priorWinnerCount = await getGolfTourWinStore().countPriorSeasonWinners(
    tourId,
    seasonYear,
  );
  return priorWinnerCount === 0;
}

async function resolveScheduleReference(input: {
  reference: GolfTournamentScheduleReference;
  seasonYear: number;
  repositories: SchedulingRepositories;
}): Promise<{ venueId: string; rootEventId: string }> {
  const { reference, seasonYear, repositories } = input;
  const referenceTour = await repositories.tourRepository.getByAbbreviation(
    reference.tourAbbreviation,
  );
  if (!referenceTour) {
    throw new GolfError(
      GolfErrorCodes.SCHEDULE_REFERENCE_NOT_FOUND,
      `Reference tour ${reference.tourAbbreviation} not found`,
    );
  }

  const referenceTournament = await repositories.tournamentRepository.getBySlug(
    referenceTour.id,
    reference.tournamentSlug,
  );
  if (!referenceTournament) {
    throw new GolfError(
      GolfErrorCodes.SCHEDULE_REFERENCE_NOT_FOUND,
      `Reference tournament ${reference.tournamentSlug} not found on ${reference.tourAbbreviation}`,
    );
  }

  const referenceSchedule =
    await repositories.seasonScheduleRepository.getByTourTournamentSeason(
      referenceTour.id,
      referenceTournament.id,
      seasonYear,
    );
  if (!referenceSchedule) {
    throw new GolfError(
      GolfErrorCodes.SCHEDULE_REFERENCE_NOT_FOUND,
      `Referenced schedule missing: ${reference.tourAbbreviation}/${reference.tournamentSlug} ${seasonYear}`,
    );
  }

  return {
    venueId: referenceSchedule.venueId,
    rootEventId: referenceSchedule.rootEventId,
  };
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

export async function scheduleGolfTourSeason(
  tourAbbreviation: string,
  seasonYear: number,
  scheduledAtIsoUtc: string,
  repositories: SchedulingRepositories = getSchedulingRepositories(),
  scheduler: GolfTourSchedulerDefinition = GOLF_TOUR_SCHEDULERS.find(
    (entry) => entry.abbreviation === tourAbbreviation,
  )!,
): Promise<void> {
  if (!scheduler) {
    throw new GolfError(
      GolfErrorCodes.TOUR_NOT_FOUND,
      `Unsupported golf tour scheduler: ${tourAbbreviation}`,
    );
  }

  if (!scheduler.isEnabled()) {
    throw new GolfError(
      GolfErrorCodes.TOUR_DISABLED,
      `${scheduler.abbreviation} Tour scheduling is disabled`,
    );
  }

  const tourRepository = repositories.tourRepository;
  const tournamentRepository = repositories.tournamentRepository;
  const tournamentVenueRepository = repositories.tournamentVenueRepository;
  const scheduleRepository = repositories.seasonScheduleRepository;
  const schedulerStateRepository = repositories.schedulerStateRepository;
  const locationRepository = repositories.locationRepository;
  const venueResourceRepository = repositories.venueResourceRepository;

  const tour = await tourRepository.getByAbbreviation(scheduler.abbreviation);
  if (!tour) {
    throw new GolfError(
      GolfErrorCodes.TOUR_NOT_FOUND,
      `${scheduler.abbreviation} Tour catalog not found — enable ${scheduler.seedEnvFlag}`,
    );
  }

  const schedulerState = await schedulerStateRepository.get(scheduler.abbreviation);
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
  const existingEvents = await repositories.eventRepository.list();

  for (const tournament of tournaments) {
    const existingSchedule = await scheduleRepository.getByTourTournamentSeason(
      tour.id,
      tournament.id,
      seasonYear,
    );
    if (existingSchedule) {
      continue;
    }

    if (tournament.scheduleReference) {
      const referenced = await resolveScheduleReference({
        reference: tournament.scheduleReference,
        seasonYear,
        repositories,
      });
      schedules.push({
        id: crypto.randomUUID(),
        tourId: tour.id,
        tournamentId: tournament.id,
        seasonYear,
        venueId: referenced.venueId,
        rootEventId: referenced.rootEventId,
        scheduledAtIsoUtc,
      });
      continue;
    }

    if (
      await shouldSkipTournamentWithoutPriorWinners(
        tournament,
        tour.id,
        seasonYear,
      )
    ) {
      continue;
    }

    if (!tournament.materializeOnSchedule) {
      continue;
    }

    const venueLinks = await tournamentVenueRepository.listByTournament(
      tournament.id,
    );
    const materialized = await pickAvailableVenueLink({
      tournament,
      venueLinks,
      seasonYear,
      locationRepository,
      venueResourceRepository,
      existingEvents,
      priorPlannedEvents: plannedEvents,
    });

    plannedEvents.push(...materialized.tree);
    schedules.push({
      id: crypto.randomUUID(),
      tourId: tour.id,
      tournamentId: tournament.id,
      seasonYear,
      venueId: materialized.venue.id,
      rootEventId: materialized.tree[0]!.id,
      scheduledAtIsoUtc,
    });
  }

  if (schedules.length === 0) {
    await schedulerStateRepository.upsert({
      tourAbbreviation: scheduler.abbreviation,
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
      tourAbbreviation: scheduler.abbreviation,
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
      `[${scheduler.label} schedule] FAILED season ${seasonYear}: ${message}${cause ? ` — cause: ${cause}` : ""}`,
    );
    throw error;
  }

  console.info(
    `[${scheduler.label} schedule] scheduled ${seasonYear} season: ${schedules.length} tournaments, ${plannedEvents.length} events`,
  );
}

export async function schedulePgaTourSeason(
  seasonYear: number,
  scheduledAtIsoUtc: string,
  repositories: SchedulingRepositories = getSchedulingRepositories(),
): Promise<void> {
  return scheduleGolfTourSeason(
    PGA_TOUR_ABBREVIATION,
    seasonYear,
    scheduledAtIsoUtc,
    repositories,
  );
}

export async function scheduleLpgaTourSeason(
  seasonYear: number,
  scheduledAtIsoUtc: string,
  repositories: SchedulingRepositories = getSchedulingRepositories(),
): Promise<void> {
  return scheduleGolfTourSeason(
    LPGA_TOUR_ABBREVIATION,
    seasonYear,
    scheduledAtIsoUtc,
    repositories,
  );
}

export async function scheduleDpWorldTourSeason(
  seasonYear: number,
  scheduledAtIsoUtc: string,
  repositories: SchedulingRepositories = getSchedulingRepositories(),
): Promise<void> {
  return scheduleGolfTourSeason(
    DP_WORLD_TOUR_ABBREVIATION,
    seasonYear,
    scheduledAtIsoUtc,
    repositories,
  );
}

async function processGolfTourClockTransition(
  scheduler: GolfTourSchedulerDefinition,
  beforeIsoUtc: string,
  afterIsoUtc: string,
): Promise<GolfSchedulingProcessResult> {
  if (!scheduler.isEnabled()) {
    return {
      tourAbbreviation: scheduler.abbreviation,
      scheduled: false,
    };
  }

  const repositories = getSchedulingRepositories();
  const releaseConfig = scheduler.loadReleaseConfig();
  const crossedYears = findCrossedReleaseYears(
    beforeIsoUtc,
    afterIsoUtc,
    releaseConfig,
  );

  if (crossedYears.length === 0) {
    await repositories.schedulerStateRepository.upsert({
      tourAbbreviation: scheduler.abbreviation,
      lastProcessedIsoUtc: afterIsoUtc,
      lastScheduledSeasonYear:
        (await repositories.schedulerStateRepository.get(
          scheduler.abbreviation,
        ))?.lastScheduledSeasonYear ?? null,
    });
    return {
      tourAbbreviation: scheduler.abbreviation,
      scheduled: false,
    };
  }

  try {
    for (const releaseYear of crossedYears) {
      const seasonYear = seasonYearForRelease(releaseYear);
      await scheduleGolfTourSeason(
        scheduler.abbreviation,
        seasonYear,
        afterIsoUtc,
        repositories,
        scheduler,
      );
    }

    return {
      tourAbbreviation: scheduler.abbreviation,
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
      tourAbbreviation: scheduler.abbreviation,
      scheduled: false,
      error: message,
      cause,
    };
  }
}

export async function processPgaTourClockTransition(
  beforeIsoUtc: string,
  afterIsoUtc: string,
): Promise<GolfSchedulingProcessResult> {
  return processGolfTourClockTransition(
    GOLF_TOUR_SCHEDULERS[0]!,
    beforeIsoUtc,
    afterIsoUtc,
  );
}

export async function processLpgaTourClockTransition(
  beforeIsoUtc: string,
  afterIsoUtc: string,
): Promise<GolfSchedulingProcessResult> {
  return processGolfTourClockTransition(
    GOLF_TOUR_SCHEDULERS[1]!,
    beforeIsoUtc,
    afterIsoUtc,
  );
}

export async function processGolfSchedulers(
  beforeIsoUtc: string,
  afterIsoUtc: string,
): Promise<GolfSchedulingProcessResult[]> {
  const results: GolfSchedulingProcessResult[] = [];
  for (const scheduler of GOLF_TOUR_SCHEDULERS) {
    results.push(
      await processGolfTourClockTransition(scheduler, beforeIsoUtc, afterIsoUtc),
    );
  }
  return results;
}

async function processGolfTourNow(
  scheduler: GolfTourSchedulerDefinition,
  isoUtc: string,
): Promise<GolfSchedulingProcessResult> {
  if (!scheduler.isEnabled()) {
    return {
      tourAbbreviation: scheduler.abbreviation,
      scheduled: false,
    };
  }

  const repositories = getSchedulingRepositories();
  const releaseConfig = scheduler.loadReleaseConfig();
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
    return {
      tourAbbreviation: scheduler.abbreviation,
      scheduled: false,
    };
  }

  try {
    await scheduleGolfTourSeason(
      scheduler.abbreviation,
      seasonYear,
      isoUtc,
      repositories,
      scheduler,
    );
    return {
      tourAbbreviation: scheduler.abbreviation,
      scheduled: true,
      seasonYear,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scheduling failed";
    const cause =
      error instanceof GolfError && error.cause instanceof Error
        ? error.cause.message
        : undefined;

    return {
      tourAbbreviation: scheduler.abbreviation,
      scheduled: false,
      seasonYear,
      error: message,
      cause,
    };
  }
}

export async function processGolfSchedulersNow(
  isoUtc: string,
): Promise<GolfSchedulingProcessResult[]> {
  const results: GolfSchedulingProcessResult[] = [];
  for (const scheduler of GOLF_TOUR_SCHEDULERS) {
    if (scheduler.isEnabled()) {
      results.push(await processGolfTourNow(scheduler, isoUtc));
    }
  }
  return results;
}

