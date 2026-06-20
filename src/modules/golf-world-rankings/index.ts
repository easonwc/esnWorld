import { GolferError, getGolferStore } from "@/modules/golfers";
import {
  getDefaultGolfWorldRankingRepository,
  type GolfWorldRankingRepository,
} from "@/persistence/repositories";
import {
  GolfWorldRankingError,
  GolfWorldRankingErrorCodes,
} from "./errors";
import {
  buildGolfWorldRanking,
  validateAsOfDate,
  validateGolferId,
  validateId,
  validateRankingSystem,
} from "./transform";
import type {
  GolfWorldRanking,
  GolfWorldRankingInput,
  GolfWorldRankingOutput,
  GolfWorldRankingSystem,
  GolfWorldRankingUpsertInput,
} from "./types";

export class GolfWorldRankingStore {
  constructor(
    private readonly repository: GolfWorldRankingRepository,
  ) {}

  async listBySystemDate(
    rankingSystem: GolfWorldRankingSystem,
    asOfDate: string,
  ): Promise<GolfWorldRanking[]> {
    return this.repository.listBySystemDate(
      validateRankingSystem(rankingSystem),
      validateAsOfDate(asOfDate),
    );
  }

  async countBySystemDate(
    rankingSystem: GolfWorldRankingSystem,
    asOfDate: string,
  ): Promise<number> {
    return this.repository.countBySystemDate(
      validateRankingSystem(rankingSystem),
      validateAsOfDate(asOfDate),
    );
  }

  async get(id: string): Promise<GolfWorldRanking> {
    const ranking = await this.repository.get(validateId(id));

    if (!ranking) {
      throw new GolfWorldRankingError(
        GolfWorldRankingErrorCodes.RANKING_NOT_FOUND,
        `World ranking not found: ${id}`,
      );
    }

    return ranking;
  }

  async getByGolferSystemDate(input: {
    golferId: string;
    rankingSystem: GolfWorldRankingSystem;
    asOfDate: string;
  }): Promise<GolfWorldRanking> {
    const ranking = await this.repository.getByGolferSystemDate(
      validateGolferId(input.golferId),
      validateRankingSystem(input.rankingSystem),
      validateAsOfDate(input.asOfDate),
    );

    if (!ranking) {
      throw new GolfWorldRankingError(
        GolfWorldRankingErrorCodes.RANKING_NOT_FOUND,
        `World ranking not found for golfer ${input.golferId}`,
      );
    }

    return ranking;
  }

  async upsert(input: GolfWorldRankingUpsertInput): Promise<GolfWorldRanking> {
    const golferId = validateGolferId(input.golferId);
    const rankingSystem = validateRankingSystem(input.rankingSystem);
    const asOfDate = validateAsOfDate(input.asOfDate);

    let golfer;
    try {
      golfer = await getGolferStore().get(golferId);
    } catch (error) {
      if (error instanceof GolferError) {
        throw new GolfWorldRankingError(
          GolfWorldRankingErrorCodes.GOLFER_NOT_FOUND,
          error.message,
        );
      }
      throw error;
    }

    if (rankingSystem === "owgr" && golfer.humanGender !== "male") {
      throw new GolfWorldRankingError(
        GolfWorldRankingErrorCodes.GOLFER_NOT_ELIGIBLE,
        "OWGR rankings require a male golfer",
      );
    }

    if (rankingSystem === "rolex" && golfer.humanGender !== "female") {
      throw new GolfWorldRankingError(
        GolfWorldRankingErrorCodes.GOLFER_NOT_ELIGIBLE,
        "Rolex rankings require a female golfer",
      );
    }

    const existing = await this.repository.getByGolferSystemDate(
      golferId,
      rankingSystem,
      asOfDate,
    );
    const ranking = buildGolfWorldRanking(
      input,
      existing?.id ?? crypto.randomUUID(),
    );

    if (existing) {
      return this.repository.update(ranking);
    }

    return this.repository.create(ranking);
  }

  async replaceSnapshot(input: {
    rankingSystem: GolfWorldRankingSystem;
    asOfDate: string;
    entries: readonly GolfWorldRankingUpsertInput[];
  }): Promise<GolfWorldRanking[]> {
    const rankingSystem = validateRankingSystem(input.rankingSystem);
    const asOfDate = validateAsOfDate(input.asOfDate);

    await this.repository.deleteBySystemDate(rankingSystem, asOfDate);

    const created: GolfWorldRanking[] = [];
    for (const entry of input.entries) {
      created.push(await this.upsert(entry));
    }

    return created;
  }

  async clear(): Promise<void> {
    await this.repository.clear();
  }
}

const globalForWorldRankings = globalThis as typeof globalThis & {
  __golfWorldRankingStore?: GolfWorldRankingStore;
};

export function getGolfWorldRankingStore(): GolfWorldRankingStore {
  if (!globalForWorldRankings.__golfWorldRankingStore) {
    globalForWorldRankings.__golfWorldRankingStore = new GolfWorldRankingStore(
      getDefaultGolfWorldRankingRepository(),
    );
  }
  return globalForWorldRankings.__golfWorldRankingStore;
}

export function resetGolfWorldRankingStore(
  repository?: GolfWorldRankingRepository,
): GolfWorldRankingStore {
  const store = new GolfWorldRankingStore(
    repository ?? getDefaultGolfWorldRankingRepository(),
  );
  globalForWorldRankings.__golfWorldRankingStore = store;
  return store;
}

export async function executeGolfWorldRanking(
  input: GolfWorldRankingInput,
): Promise<GolfWorldRankingOutput> {
  const store = getGolfWorldRankingStore();

  switch (input.action) {
    case "get":
      return store.get(validateId(input.id));

    case "getByGolfer":
      return store.getByGolferSystemDate(input);

    case "listBySystemDate":
      return store.listBySystemDate(input.rankingSystem, input.asOfDate);

    default: {
      const unknownAction = (input as { action: string }).action;
      throw new GolfWorldRankingError(
        GolfWorldRankingErrorCodes.INVALID_ACTION,
        `Unknown action: ${unknownAction}`,
      );
    }
  }
}

export * from "./types";
export * from "./errors";
export {
  bootstrapRankingPointsFromSkill,
  buildGolfWorldRanking,
  validateAsOfDate,
  validateGolferId,
  validateId,
  validateOverallSkill,
  validateRank,
  validateRankingPoints,
  validateRankingSystem,
  worldRankingAsOfDateFromIsoUtc,
} from "./transform";
