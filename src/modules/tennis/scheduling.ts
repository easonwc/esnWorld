import { assertNoVenueScheduleConflict } from "@/modules/events/transform";
import type { EventRecord } from "@/modules/events/types";
import { EventError } from "@/modules/events/errors";
import { getVenueStore } from "@/modules/venues";
import { getDb } from "@/persistence/db";
import {
  getDefaultEventRepository,
  getDefaultLocationRepository,
  getDefaultTennisSeasonScheduleRepository,
  getDefaultTennisTourRepository,
  getDefaultTennisTourSchedulerStateRepository,
  getDefaultTennisTournamentRepository,
  getDefaultTennisTournamentVenueRepository,
  getDefaultVenueResourceRepository,
  type EventRepository,
  type LocationRepository,
  type TennisSeasonScheduleRepository,
  type TennisTourRepository,
  type TennisTourSchedulerStateRepository,
  type TennisTournamentRepository,
  type TennisTournamentVenueRepository,
  type VenueResourceRepository,
} from "@/persistence/repositories";
import {
  isAtpTourEnabled,
  isWtaTourEnabled,
  loadAtpTourScheduleReleaseConfig,
  loadWtaTourScheduleReleaseConfig,
  type TennisTourScheduleReleaseConfig,
} from "@/persistence/seed/tennis-config";
import { TennisError, TennisErrorCodes } from "./errors";
import {
  computeReleaseInstantUtc,
  findCrossedReleaseYears,
  seasonYearForRelease,
} from "./release";
import type {
  TennisSchedulingProcessResult,
  TennisSeasonSchedule,
  TennisTournamentScheduleReference,
} from "./types";
import { pickAvailableVenueLink } from "./venue-pick";

const ATP_TOUR_ABBREVIATION = "ATP";
const WTA_TOUR_ABBREVIATION = "WTA";

interface TennisTourSchedulerDefinition {
  abbreviation: string;
  label: string;
  seedEnvFlag: string;
  isEnabled: () => boolean;
  loadReleaseConfig: () => TennisTourScheduleReleaseConfig;
}

/** ATP must run before WTA so joint events can resolve schedule references. */
const TENNIS_TOUR_SCHEDULERS: readonly TennisTourSchedulerDefinition[] = [
  {
    abbreviation: ATP_TOUR_ABBREVIATION,
    label: "atp tour",
    seedEnvFlag: "ATP_TOUR_SEED_ON_STARTUP",
    isEnabled: isAtpTourEnabled,
    loadReleaseConfig: loadAtpTourScheduleReleaseConfig,
  },
  {
    abbreviation: WTA_TOUR_ABBREVIATION,
    label: "wta tour",
    seedEnvFlag: "WTA_TOUR_SEED_ON_STARTUP",
    isEnabled: isWtaTourEnabled,
    loadReleaseConfig: loadWtaTourScheduleReleaseConfig,
  },
];

export interface SchedulingRepositories {
  eventRepository: EventRepository;
  tourRepository: TennisTourRepository;
  tournamentRepository: TennisTournamentRepository;
  tournamentVenueRepository: TennisTournamentVenueRepository;
  seasonScheduleRepository: TennisSeasonScheduleRepository;
  schedulerStateRepository: TennisTourSchedulerStateRepository;
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
    tourRepository: getDefaultTennisTourRepository(),
    tournamentRepository: getDefaultTennisTournamentRepository(),
    tournamentVenueRepository: getDefaultTennisTournamentVenueRepository(),
    seasonScheduleRepository: getDefaultTennisSeasonScheduleRepository(),
    schedulerStateRepository: getDefaultTennisTourSchedulerStateRepository(),
    locationRepository: getDefaultLocationRepository(),
    venueResourceRepository: getDefaultVenueResourceRepository(),
  };
}

async function resolveScheduleReference(input: {
  reference: TennisTournamentScheduleReference;
  seasonYear: number;
  repositories: SchedulingRepositories;
}): Promise<{ venueId: string; rootEventId: string }> {
  const { reference, seasonYear, repositories } = input;
  const referenceTour = await repositories.tourRepository.getByAbbreviation(
    reference.tourAbbreviation,
  );
  if (!referenceTour) {
    throw new TennisError(
      TennisErrorCodes.SCHEDULE_REFERENCE_NOT_FOUND,
      `Reference tour ${reference.tourAbbreviation} not found`,
    );
  }

  const referenceTournament = await repositories.tournamentRepository.getBySlug(
    referenceTour.id,
    reference.tournamentSlug,
  );
  if (!referenceTournament) {
    throw new TennisError(
      TennisErrorCodes.SCHEDULE_REFERENCE_NOT_FOUND,
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
    throw new TennisError(
      TennisErrorCodes.SCHEDULE_REFERENCE_NOT_FOUND,
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
        throw new TennisError(
          TennisErrorCodes.SCHEDULE_BATCH_FAILED,
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
  schedules: readonly TennisSeasonSchedule[];
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

export async function scheduleTennisTourSeason(
  tourAbbreviation: string,
  seasonYear: number,
  scheduledAtIsoUtc: string,
  repositories: SchedulingRepositories = getSchedulingRepositories(),
  scheduler: TennisTourSchedulerDefinition = TENNIS_TOUR_SCHEDULERS.find(
    (entry) => entry.abbreviation === tourAbbreviation,
  )!,
): Promise<void> {
  if (!scheduler) {
    throw new TennisError(
      TennisErrorCodes.TOUR_NOT_FOUND,
      `Unsupported tennis tour scheduler: ${tourAbbreviation}`,
    );
  }

  if (!scheduler.isEnabled()) {
    throw new TennisError(
      TennisErrorCodes.TOUR_DISABLED,
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
    throw new TennisError(
      TennisErrorCodes.TOUR_NOT_FOUND,
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
  const schedules: TennisSeasonSchedule[] = [];
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
      error instanceof TennisError && error.cause instanceof Error
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

export async function scheduleAtpTourSeason(
  seasonYear: number,
  scheduledAtIsoUtc: string,
  repositories: SchedulingRepositories = getSchedulingRepositories(),
): Promise<void> {
  return scheduleTennisTourSeason(
    ATP_TOUR_ABBREVIATION,
    seasonYear,
    scheduledAtIsoUtc,
    repositories,
  );
}

export async function scheduleWtaTourSeason(
  seasonYear: number,
  scheduledAtIsoUtc: string,
  repositories: SchedulingRepositories = getSchedulingRepositories(),
): Promise<void> {
  return scheduleTennisTourSeason(
    WTA_TOUR_ABBREVIATION,
    seasonYear,
    scheduledAtIsoUtc,
    repositories,
  );
}

async function processTennisTourClockTransition(
  scheduler: TennisTourSchedulerDefinition,
  beforeIsoUtc: string,
  afterIsoUtc: string,
): Promise<TennisSchedulingProcessResult> {
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
      await scheduleTennisTourSeason(
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
      error instanceof TennisError && error.cause instanceof Error
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

export async function processAtpTourClockTransition(
  beforeIsoUtc: string,
  afterIsoUtc: string,
): Promise<TennisSchedulingProcessResult> {
  return processTennisTourClockTransition(
    TENNIS_TOUR_SCHEDULERS[0]!,
    beforeIsoUtc,
    afterIsoUtc,
  );
}

export async function processWtaTourClockTransition(
  beforeIsoUtc: string,
  afterIsoUtc: string,
): Promise<TennisSchedulingProcessResult> {
  return processTennisTourClockTransition(
    TENNIS_TOUR_SCHEDULERS[1]!,
    beforeIsoUtc,
    afterIsoUtc,
  );
}

export async function processTennisSchedulers(
  beforeIsoUtc: string,
  afterIsoUtc: string,
): Promise<TennisSchedulingProcessResult[]> {
  const results: TennisSchedulingProcessResult[] = [];
  for (const scheduler of TENNIS_TOUR_SCHEDULERS) {
    results.push(
      await processTennisTourClockTransition(scheduler, beforeIsoUtc, afterIsoUtc),
    );
  }
  return results;
}

async function processTennisTourNow(
  scheduler: TennisTourSchedulerDefinition,
  isoUtc: string,
): Promise<TennisSchedulingProcessResult> {
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
    await scheduleTennisTourSeason(
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
      error instanceof TennisError && error.cause instanceof Error
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

export async function processTennisSchedulersNow(
  isoUtc: string,
): Promise<TennisSchedulingProcessResult[]> {
  const results: TennisSchedulingProcessResult[] = [];
  for (const scheduler of TENNIS_TOUR_SCHEDULERS) {
    if (scheduler.isEnabled()) {
      results.push(await processTennisTourNow(scheduler, isoUtc));
    }
  }
  return results;
}
