import { GolferError, getGolferStore } from "@/modules/golfers";
import {
  getDefaultGolfTourMembershipRepository,
  getDefaultGolfTourRepository,
  type GolfTourMembershipRepository,
  type GolfTourRepository,
} from "@/persistence/repositories";
import {
  GolfTourMembershipError,
  GolfTourMembershipErrorCodes,
} from "./errors";
import {
  buildGolfTourMembership,
  validateGolferId,
  validateId,
  validateSeasonYear,
  validateTourId,
} from "./transform";
import type {
  GolfTourMembership,
  GolfTourMembershipInput,
  GolfTourMembershipOutput,
} from "./types";

export class GolfTourMembershipStore {
  constructor(
    private readonly repository: GolfTourMembershipRepository,
    private readonly tourRepository: GolfTourRepository = getDefaultGolfTourRepository(),
  ) {}

  async listByTourSeason(
    tourId: string,
    seasonYear: number,
  ): Promise<GolfTourMembership[]> {
    return this.repository.listByTourSeason(
      validateTourId(tourId),
      validateSeasonYear(seasonYear),
    );
  }

  async countByTourSeason(tourId: string, seasonYear: number): Promise<number> {
    return this.repository.countByTourSeason(
      validateTourId(tourId),
      validateSeasonYear(seasonYear),
    );
  }

  async get(id: string): Promise<GolfTourMembership> {
    const membership = await this.repository.get(validateId(id));

    if (!membership) {
      throw new GolfTourMembershipError(
        GolfTourMembershipErrorCodes.MEMBERSHIP_NOT_FOUND,
        `Tour membership not found: ${id}`,
      );
    }

    return membership;
  }

  async create(input: {
    golferId: unknown;
    tourId: unknown;
    seasonYear: unknown;
    status?: unknown;
    overallSkill: unknown;
  }): Promise<GolfTourMembership> {
    const golferId = validateGolferId(input.golferId);
    const tourId = validateTourId(input.tourId);
    const seasonYear = validateSeasonYear(input.seasonYear);

    let golfer;
    try {
      golfer = await getGolferStore().get(golferId);
    } catch (error) {
      if (error instanceof GolferError) {
        throw new GolfTourMembershipError(
          GolfTourMembershipErrorCodes.GOLFER_NOT_FOUND,
          error.message,
        );
      }
      throw error;
    }

    const tour = await this.tourRepository.get(tourId);
    if (!tour) {
      throw new GolfTourMembershipError(
        GolfTourMembershipErrorCodes.TOUR_NOT_FOUND,
        `Golf tour not found: ${tourId}`,
      );
    }

    if (tour.abbreviation === "PGA" && golfer.humanGender !== "male") {
      throw new GolfTourMembershipError(
        GolfTourMembershipErrorCodes.GOLFER_NOT_ELIGIBLE,
        "PGA Tour membership requires a male golfer",
      );
    }

    const existing = await this.repository.getByGolferTourSeason(
      golferId,
      tourId,
      seasonYear,
    );
    if (existing) {
      throw new GolfTourMembershipError(
        GolfTourMembershipErrorCodes.MEMBERSHIP_ALREADY_EXISTS,
        `Tour membership already exists for golfer ${golferId} on tour ${tourId} in ${seasonYear}`,
      );
    }

    const membership = buildGolfTourMembership(input, crypto.randomUUID());
    return this.repository.create(membership);
  }

  async delete(id: string): Promise<{ deleted: true; id: string }> {
    validateId(id);

    const membership = await this.repository.get(id);
    if (!membership) {
      throw new GolfTourMembershipError(
        GolfTourMembershipErrorCodes.MEMBERSHIP_NOT_FOUND,
        `Tour membership not found: ${id}`,
      );
    }

    await this.repository.delete(id);
    return { deleted: true, id };
  }

  async clear(): Promise<void> {
    await this.repository.clear();
  }
}

const globalForMemberships = globalThis as typeof globalThis & {
  __golfTourMembershipStore?: GolfTourMembershipStore;
};

export function getGolfTourMembershipStore(): GolfTourMembershipStore {
  if (!globalForMemberships.__golfTourMembershipStore) {
    globalForMemberships.__golfTourMembershipStore = new GolfTourMembershipStore(
      getDefaultGolfTourMembershipRepository(),
    );
  }
  return globalForMemberships.__golfTourMembershipStore;
}

export function resetGolfTourMembershipStore(
  repository?: GolfTourMembershipRepository,
  tourRepository?: GolfTourRepository,
): GolfTourMembershipStore {
  const store = new GolfTourMembershipStore(
    repository ?? getDefaultGolfTourMembershipRepository(),
    tourRepository ?? getDefaultGolfTourRepository(),
  );
  globalForMemberships.__golfTourMembershipStore = store;
  return store;
}

export async function executeGolfTourMembership(
  input: GolfTourMembershipInput,
): Promise<GolfTourMembershipOutput> {
  const store = getGolfTourMembershipStore();

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
      throw new GolfTourMembershipError(
        GolfTourMembershipErrorCodes.INVALID_ACTION,
        `Unknown action: ${unknownAction}`,
      );
    }
  }
}

export * from "./types";
export * from "./errors";
export {
  buildGolfTourMembership,
  validateGolferId,
  validateId,
  validateOverallSkill,
  validateSeasonYear,
  validateStatus,
  validateTourId,
} from "./transform";
