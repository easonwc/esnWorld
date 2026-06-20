import { GolferError, getGolferStore } from "@/modules/golfers";
import {
  getDefaultGolfTourWinRepository,
  getDefaultGolfTourRepository,
  type GolfTourWinRepository,
  type GolfTourRepository,
} from "@/persistence/repositories";
import { priorSeasonYearForExemptions } from "./eligibility";
import { GolfTourWinError, GolfTourWinErrorCodes } from "./errors";
import {
  buildGolfTourWin,
  validateGolferId,
  validateId,
  validateSeasonYear,
  validateTourId,
} from "./transform";
import type {
  GolfTourWin,
  GolfTourWinInput,
  GolfTourWinOutput,
} from "./types";

export class GolfTourWinStore {
  constructor(
    private readonly repository: GolfTourWinRepository,
    private readonly tourRepository: GolfTourRepository = getDefaultGolfTourRepository(),
  ) {}

  async listByTourSeason(
    tourId: string,
    seasonYear: number,
  ): Promise<GolfTourWin[]> {
    return this.repository.listByTourSeason(
      validateTourId(tourId),
      validateSeasonYear(seasonYear),
    );
  }

  async listDistinctGolfersByTourSeason(
    tourId: string,
    seasonYear: number,
  ): Promise<string[]> {
    return this.repository.listDistinctGolfersByTourSeason(
      validateTourId(tourId),
      validateSeasonYear(seasonYear),
    );
  }

  async countDistinctGolfersByTourSeason(
    tourId: string,
    seasonYear: number,
  ): Promise<number> {
    return this.repository.countDistinctGolfersByTourSeason(
      validateTourId(tourId),
      validateSeasonYear(seasonYear),
    );
  }

  async countPriorSeasonWinners(
    tourId: string,
    seasonYear: number,
  ): Promise<number> {
    return this.countDistinctGolfersByTourSeason(
      tourId,
      priorSeasonYearForExemptions(validateSeasonYear(seasonYear)),
    );
  }

  async listPriorSeasonWinners(
    tourId: string,
    seasonYear: number,
  ): Promise<GolfTourWin[]> {
    const priorSeasonYear = priorSeasonYearForExemptions(
      validateSeasonYear(seasonYear),
    );
    const wins = await this.listByTourSeason(tourId, priorSeasonYear);
    const seen = new Set<string>();
    return wins.filter((win) => {
      if (seen.has(win.golferId)) {
        return false;
      }
      seen.add(win.golferId);
      return true;
    });
  }

  async get(id: string): Promise<GolfTourWin> {
    const win = await this.repository.get(validateId(id));

    if (!win) {
      throw new GolfTourWinError(
        GolfTourWinErrorCodes.WIN_NOT_FOUND,
        `Tour win not found: ${id}`,
      );
    }

    return win;
  }

  async create(input: {
    golferId: unknown;
    tourId: unknown;
    seasonYear: unknown;
    tournamentId?: unknown;
  }): Promise<GolfTourWin> {
    const golferId = validateGolferId(input.golferId);
    const tourId = validateTourId(input.tourId);
    const seasonYear = validateSeasonYear(input.seasonYear);

    let golfer;
    try {
      golfer = await getGolferStore().get(golferId);
    } catch (error) {
      if (error instanceof GolferError) {
        throw new GolfTourWinError(
          GolfTourWinErrorCodes.GOLFER_NOT_FOUND,
          error.message,
        );
      }
      throw error;
    }

    const tour = await this.tourRepository.get(tourId);
    if (!tour) {
      throw new GolfTourWinError(
        GolfTourWinErrorCodes.TOUR_NOT_FOUND,
        `Golf tour not found: ${tourId}`,
      );
    }

    if (tour.abbreviation === "PGA" && golfer.humanGender !== "male") {
      throw new GolfTourWinError(
        GolfTourWinErrorCodes.GOLFER_NOT_ELIGIBLE,
        "PGA Tour wins require a male golfer",
      );
    }

    const win = buildGolfTourWin(input, crypto.randomUUID());
    return this.repository.create(win);
  }

  async delete(id: string): Promise<{ deleted: true; id: string }> {
    validateId(id);

    const win = await this.repository.get(id);
    if (!win) {
      throw new GolfTourWinError(
        GolfTourWinErrorCodes.WIN_NOT_FOUND,
        `Tour win not found: ${id}`,
      );
    }

    await this.repository.delete(id);
    return { deleted: true, id };
  }

  async clear(): Promise<void> {
    await this.repository.clear();
  }
}

const globalForTourWins = globalThis as typeof globalThis & {
  __golfTourWinStore?: GolfTourWinStore;
};

export function getGolfTourWinStore(): GolfTourWinStore {
  if (!globalForTourWins.__golfTourWinStore) {
    globalForTourWins.__golfTourWinStore = new GolfTourWinStore(
      getDefaultGolfTourWinRepository(),
    );
  }
  return globalForTourWins.__golfTourWinStore;
}

export function resetGolfTourWinStore(
  repository?: GolfTourWinRepository,
  tourRepository?: GolfTourRepository,
): GolfTourWinStore {
  const store = new GolfTourWinStore(
    repository ?? getDefaultGolfTourWinRepository(),
    tourRepository ?? getDefaultGolfTourRepository(),
  );
  globalForTourWins.__golfTourWinStore = store;
  return store;
}

export async function executeGolfTourWin(
  input: GolfTourWinInput,
): Promise<GolfTourWinOutput> {
  const store = getGolfTourWinStore();

  switch (input.action) {
    case "create":
      return store.create(input);

    case "get":
      return store.get(validateId(input.id));

    case "listByTourSeason":
      return store.listByTourSeason(input.tourId, input.seasonYear);

    case "delete":
      return store.delete(validateId(input.id));

    default: {
      const unknownAction = (input as { action: string }).action;
      throw new GolfTourWinError(
        GolfTourWinErrorCodes.INVALID_ACTION,
        `Unknown action: ${unknownAction}`,
      );
    }
  }
}

export * from "./types";
export * from "./errors";
export * from "./eligibility";
export {
  buildGolfTourWin,
  validateGolferId,
  validateId,
  validateSeasonYear,
  validateTourId,
  validateTournamentId,
} from "./transform";
