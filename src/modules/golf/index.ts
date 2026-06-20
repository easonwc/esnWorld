import {
  getDefaultGolfSeasonScheduleRepository,
  getDefaultGolfTourRepository,
  getDefaultGolfTournamentRepository,
  getDefaultGolfTournamentVenueRepository,
  type GolfSeasonScheduleRepository,
  type GolfTourRepository,
  type GolfTournamentRepository,
  type GolfTournamentVenueRepository,
} from "@/persistence/repositories";
import { GolfError, GolfErrorCodes } from "./errors";
import { processGolfSchedulersNow } from "./scheduling";
import type {
  GolfSchedulingInput,
  GolfTourInput,
  GolfTournamentInput,
  GolfToursOutput,
} from "./types";

export class GolfTourStore {
  constructor(private readonly repository: GolfTourRepository) {}

  async list() {
    return this.repository.list();
  }

  async getByAbbreviation(abbreviation: string) {
    const tour = await this.repository.getByAbbreviation(abbreviation);
    if (!tour) {
      throw new GolfError(
        GolfErrorCodes.TOUR_NOT_FOUND,
        `Golf tour not found: ${abbreviation}`,
      );
    }
    return tour;
  }

  async get(id: string) {
    const tour = await this.repository.get(id);
    if (!tour) {
      throw new GolfError(
        GolfErrorCodes.TOUR_NOT_FOUND,
        `Golf tour not found: ${id}`,
      );
    }
    return tour;
  }
}

export class GolfTournamentStore {
  constructor(
    private readonly repository: GolfTournamentRepository,
    private readonly venueRepository: GolfTournamentVenueRepository,
  ) {}

  async listByTour(tourId: string) {
    return this.repository.listByTour(tourId);
  }

  async get(id: string) {
    const tournament = await this.repository.get(id);
    if (!tournament) {
      throw new GolfError(
        GolfErrorCodes.TOURNAMENT_NOT_FOUND,
        `Golf tournament not found: ${id}`,
      );
    }
    return tournament;
  }

  async getBySlug(tourId: string, slug: string) {
    const tournament = await this.repository.getBySlug(tourId, slug);
    if (!tournament) {
      throw new GolfError(
        GolfErrorCodes.TOURNAMENT_NOT_FOUND,
        `Golf tournament not found: ${slug}`,
      );
    }
    return tournament;
  }

  async listVenues(tournamentId: string) {
    await this.get(tournamentId);
    return this.venueRepository.listByTournament(tournamentId);
  }
}

export class GolfSeasonScheduleStore {
  constructor(private readonly repository: GolfSeasonScheduleRepository) {}

  async listByTour(tourId: string, seasonYear?: number) {
    return this.repository.listByTour(tourId, seasonYear);
  }
}

const globalForGolf = globalThis as typeof globalThis & {
  __golfTourStore?: GolfTourStore;
  __golfTournamentStore?: GolfTournamentStore;
  __golfSeasonScheduleStore?: GolfSeasonScheduleStore;
};

export function getGolfTourStore(): GolfTourStore {
  if (!globalForGolf.__golfTourStore) {
    globalForGolf.__golfTourStore = new GolfTourStore(getDefaultGolfTourRepository());
  }
  return globalForGolf.__golfTourStore;
}

export function getGolfTournamentStore(): GolfTournamentStore {
  if (!globalForGolf.__golfTournamentStore) {
    globalForGolf.__golfTournamentStore = new GolfTournamentStore(
      getDefaultGolfTournamentRepository(),
      getDefaultGolfTournamentVenueRepository(),
    );
  }
  return globalForGolf.__golfTournamentStore;
}

export function getGolfSeasonScheduleStore(): GolfSeasonScheduleStore {
  if (!globalForGolf.__golfSeasonScheduleStore) {
    globalForGolf.__golfSeasonScheduleStore = new GolfSeasonScheduleStore(
      getDefaultGolfSeasonScheduleRepository(),
    );
  }
  return globalForGolf.__golfSeasonScheduleStore;
}

export function resetGolfStores(
  repositories?: {
    tourRepository?: GolfTourRepository;
    tournamentRepository?: GolfTournamentRepository;
    tournamentVenueRepository?: GolfTournamentVenueRepository;
    seasonScheduleRepository?: GolfSeasonScheduleRepository;
  },
): void {
  globalForGolf.__golfTourStore = new GolfTourStore(
    repositories?.tourRepository ?? getDefaultGolfTourRepository(),
  );
  globalForGolf.__golfTournamentStore = new GolfTournamentStore(
    repositories?.tournamentRepository ?? getDefaultGolfTournamentRepository(),
    repositories?.tournamentVenueRepository ??
      getDefaultGolfTournamentVenueRepository(),
  );
  globalForGolf.__golfSeasonScheduleStore = new GolfSeasonScheduleStore(
    repositories?.seasonScheduleRepository ??
      getDefaultGolfSeasonScheduleRepository(),
  );
}

export async function executeGolfTour(input: GolfTourInput): Promise<GolfToursOutput> {
  const tourStore = getGolfTourStore();
  const tournamentStore = getGolfTournamentStore();
  const scheduleStore = getGolfSeasonScheduleStore();

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
      throw new GolfError(
        GolfErrorCodes.MISSING_ID,
        "id or abbreviation is required",
      );
    }

    case "listTournaments": {
      const tour = input.tourId
        ? await tourStore.get(input.tourId)
        : await tourStore.getByAbbreviation(input.abbreviation ?? "PGA");
      return tournamentStore.listByTour(tour.id);
    }

    case "listSeasonSchedules": {
      const tour = input.tourId
        ? await tourStore.get(input.tourId)
        : await tourStore.getByAbbreviation(input.abbreviation ?? "PGA");
      return scheduleStore.listByTour(tour.id, input.seasonYear);
    }

    default: {
      const unknownAction = (input as { action: string }).action;
      throw new GolfError(
        GolfErrorCodes.INVALID_ACTION,
        `Unknown action: ${unknownAction}`,
      );
    }
  }
}

export async function executeGolfTournament(
  input: GolfTournamentInput,
): Promise<GolfToursOutput> {
  const tourStore = getGolfTourStore();
  const tournamentStore = getGolfTournamentStore();

  switch (input.action) {
    case "get": {
      if (input.id) {
        return tournamentStore.get(input.id);
      }
      if (input.slug) {
        const tour = await tourStore.getByAbbreviation(
          input.tourAbbreviation ?? "PGA",
        );
        return tournamentStore.getBySlug(tour.id, input.slug);
      }
      throw new GolfError(
        GolfErrorCodes.MISSING_ID,
        "id or slug is required",
      );
    }

    case "listByTour": {
      const tour = input.tourId
        ? await tourStore.get(input.tourId)
        : await tourStore.getByAbbreviation(input.abbreviation ?? "PGA");
      return tournamentStore.listByTour(tour.id);
    }

    case "listVenues":
      return tournamentStore.listVenues(input.tournamentId);

    default: {
      const unknownAction = (input as { action: string }).action;
      throw new GolfError(
        GolfErrorCodes.INVALID_ACTION,
        `Unknown action: ${unknownAction}`,
      );
    }
  }
}

export async function executeGolfScheduling(
  input: GolfSchedulingInput,
): Promise<GolfToursOutput> {
  if (input.action === "processNow") {
    const { getWorldClockService } = await import("@/modules/world-clock");
    const isoUtc =
      input.isoUtc ?? getWorldClockService().getCurrentOutput().isoUtc;
    const results = await processGolfSchedulersNow(isoUtc);
    return { processed: true, results };
  }

  throw new GolfError(GolfErrorCodes.INVALID_ACTION, "Unknown scheduling action");
}

export * from "./types";
export * from "./errors";
export { loadPgaTourRuntimeConfig } from "./config";
export { registerGolfClockHandlers } from "./register";
export { setSchedulingRepositoriesForTests } from "./scheduling";
