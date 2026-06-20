import {
  getDefaultTennisSeasonScheduleRepository,
  getDefaultTennisTourRepository,
  getDefaultTennisTournamentRepository,
  getDefaultTennisTournamentVenueRepository,
  type TennisSeasonScheduleRepository,
  type TennisTourRepository,
  type TennisTournamentRepository,
  type TennisTournamentVenueRepository,
} from "@/persistence/repositories";
import { TennisError, TennisErrorCodes } from "./errors";
import { processTennisSchedulersNow } from "./scheduling";
import type {
  TennisSchedulingInput,
  TennisTourInput,
  TennisTournamentInput,
  TennisToursOutput,
} from "./types";

export class TennisTourStore {
  constructor(private readonly repository: TennisTourRepository) {}

  async list() {
    return this.repository.list();
  }

  async getByAbbreviation(abbreviation: string) {
    const tour = await this.repository.getByAbbreviation(abbreviation);
    if (!tour) {
      throw new TennisError(
        TennisErrorCodes.TOUR_NOT_FOUND,
        `Tennis tour not found: ${abbreviation}`,
      );
    }
    return tour;
  }

  async get(id: string) {
    const tour = await this.repository.get(id);
    if (!tour) {
      throw new TennisError(
        TennisErrorCodes.TOUR_NOT_FOUND,
        `Tennis tour not found: ${id}`,
      );
    }
    return tour;
  }
}

export class TennisTournamentStore {
  constructor(
    private readonly repository: TennisTournamentRepository,
    private readonly venueRepository: TennisTournamentVenueRepository,
  ) {}

  async listByTour(tourId: string) {
    return this.repository.listByTour(tourId);
  }

  async get(id: string) {
    const tournament = await this.repository.get(id);
    if (!tournament) {
      throw new TennisError(
        TennisErrorCodes.TOURNAMENT_NOT_FOUND,
        `Tennis tournament not found: ${id}`,
      );
    }
    return tournament;
  }

  async getBySlug(tourId: string, slug: string) {
    const tournament = await this.repository.getBySlug(tourId, slug);
    if (!tournament) {
      throw new TennisError(
        TennisErrorCodes.TOURNAMENT_NOT_FOUND,
        `Tennis tournament not found: ${slug}`,
      );
    }
    return tournament;
  }

  async listVenues(tournamentId: string) {
    await this.get(tournamentId);
    return this.venueRepository.listByTournament(tournamentId);
  }
}

export class TennisSeasonScheduleStore {
  constructor(private readonly repository: TennisSeasonScheduleRepository) {}

  async listByTour(tourId: string, seasonYear?: number) {
    return this.repository.listByTour(tourId, seasonYear);
  }
}

const globalForTennis = globalThis as typeof globalThis & {
  __tennisTourStore?: TennisTourStore;
  __tennisTournamentStore?: TennisTournamentStore;
  __tennisSeasonScheduleStore?: TennisSeasonScheduleStore;
};

export function getTennisTourStore(): TennisTourStore {
  if (!globalForTennis.__tennisTourStore) {
    globalForTennis.__tennisTourStore = new TennisTourStore(
      getDefaultTennisTourRepository(),
    );
  }
  return globalForTennis.__tennisTourStore;
}

export function getTennisTournamentStore(): TennisTournamentStore {
  if (!globalForTennis.__tennisTournamentStore) {
    globalForTennis.__tennisTournamentStore = new TennisTournamentStore(
      getDefaultTennisTournamentRepository(),
      getDefaultTennisTournamentVenueRepository(),
    );
  }
  return globalForTennis.__tennisTournamentStore;
}

export function getTennisSeasonScheduleStore(): TennisSeasonScheduleStore {
  if (!globalForTennis.__tennisSeasonScheduleStore) {
    globalForTennis.__tennisSeasonScheduleStore = new TennisSeasonScheduleStore(
      getDefaultTennisSeasonScheduleRepository(),
    );
  }
  return globalForTennis.__tennisSeasonScheduleStore;
}

export function resetTennisStores(
  repositories?: {
    tourRepository?: TennisTourRepository;
    tournamentRepository?: TennisTournamentRepository;
    tournamentVenueRepository?: TennisTournamentVenueRepository;
    seasonScheduleRepository?: TennisSeasonScheduleRepository;
  },
): void {
  globalForTennis.__tennisTourStore = new TennisTourStore(
    repositories?.tourRepository ?? getDefaultTennisTourRepository(),
  );
  globalForTennis.__tennisTournamentStore = new TennisTournamentStore(
    repositories?.tournamentRepository ?? getDefaultTennisTournamentRepository(),
    repositories?.tournamentVenueRepository ??
      getDefaultTennisTournamentVenueRepository(),
  );
  globalForTennis.__tennisSeasonScheduleStore = new TennisSeasonScheduleStore(
    repositories?.seasonScheduleRepository ??
      getDefaultTennisSeasonScheduleRepository(),
  );
}

export async function executeTennisTour(
  input: TennisTourInput,
): Promise<TennisToursOutput> {
  const tourStore = getTennisTourStore();
  const tournamentStore = getTennisTournamentStore();
  const scheduleStore = getTennisSeasonScheduleStore();

  switch (input.action) {
    case "list":
      return tourStore.list();

    case "get": {
      if (input.id) {
        return tourStore.get(input.id);
      }
      if (input.abbreviation) {
        return tourStore.getByAbbreviation(input.abbreviation);
      }
      throw new TennisError(
        TennisErrorCodes.MISSING_ID,
        "id or abbreviation is required",
      );
    }

    case "listTournaments": {
      const tour = input.tourId
        ? await tourStore.get(input.tourId)
        : await tourStore.getByAbbreviation(input.abbreviation ?? "ATP");
      return tournamentStore.listByTour(tour.id);
    }

    case "listSeasonSchedules": {
      const tour = input.tourId
        ? await tourStore.get(input.tourId)
        : await tourStore.getByAbbreviation(input.abbreviation ?? "ATP");
      return scheduleStore.listByTour(tour.id, input.seasonYear);
    }

    default: {
      const unknownAction = (input as { action: string }).action;
      throw new TennisError(
        TennisErrorCodes.INVALID_ACTION,
        `Unknown action: ${unknownAction}`,
      );
    }
  }
}

export async function executeTennisTournament(
  input: TennisTournamentInput,
): Promise<TennisToursOutput> {
  const tourStore = getTennisTourStore();
  const tournamentStore = getTennisTournamentStore();

  switch (input.action) {
    case "get": {
      if (input.id) {
        return tournamentStore.get(input.id);
      }
      if (input.slug) {
        const tour = await tourStore.getByAbbreviation(
          input.tourAbbreviation ?? "ATP",
        );
        return tournamentStore.getBySlug(tour.id, input.slug);
      }
      throw new TennisError(
        TennisErrorCodes.MISSING_ID,
        "id or slug is required",
      );
    }

    case "listByTour": {
      const tour = input.tourId
        ? await tourStore.get(input.tourId)
        : await tourStore.getByAbbreviation(input.abbreviation ?? "ATP");
      return tournamentStore.listByTour(tour.id);
    }

    case "listVenues":
      return tournamentStore.listVenues(input.tournamentId);

    default: {
      const unknownAction = (input as { action: string }).action;
      throw new TennisError(
        TennisErrorCodes.INVALID_ACTION,
        `Unknown action: ${unknownAction}`,
      );
    }
  }
}

export async function executeTennisScheduling(
  input: TennisSchedulingInput,
): Promise<TennisToursOutput> {
  if (input.action === "processNow") {
    const { getWorldClockService } = await import("@/modules/world-clock");
    const isoUtc =
      input.isoUtc ?? getWorldClockService().getCurrentOutput().isoUtc;
    const results = await processTennisSchedulersNow(isoUtc);
    return { processed: true, results };
  }

  throw new TennisError(TennisErrorCodes.INVALID_ACTION, "Unknown scheduling action");
}

export * from "./types";
export * from "./errors";
export { loadAtpTourRuntimeConfig, loadWtaTourRuntimeConfig } from "./config";
export { registerTennisClockHandlers } from "./register";
export { setSchedulingRepositoriesForTests } from "./scheduling";
