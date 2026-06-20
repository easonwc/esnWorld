import {
  GolfWorldRankingError,
  GolfWorldRankingErrorCodes,
} from "./errors";
import type {
  GolfWorldRanking,
  GolfWorldRankingSystem,
  GolfWorldRankingUpsertInput,
} from "./types";

const AS_OF_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function validateId(id: unknown): string {
  if (typeof id !== "string" || id.trim().length === 0) {
    throw new GolfWorldRankingError(
      GolfWorldRankingErrorCodes.MISSING_ID,
      "id is required",
    );
  }

  return id.trim();
}

export function validateGolferId(golferId: unknown): string {
  if (typeof golferId !== "string" || golferId.trim().length === 0) {
    throw new GolfWorldRankingError(
      GolfWorldRankingErrorCodes.INVALID_GOLFER_ID,
      "golferId is required",
    );
  }

  return golferId.trim();
}

export function validateRankingSystem(
  rankingSystem: unknown,
): GolfWorldRankingSystem {
  if (rankingSystem !== "owgr" && rankingSystem !== "rolex") {
    throw new GolfWorldRankingError(
      GolfWorldRankingErrorCodes.INVALID_RANKING_SYSTEM,
      "rankingSystem must be owgr or rolex",
    );
  }

  return rankingSystem;
}

export function validateAsOfDate(asOfDate: unknown): string {
  if (typeof asOfDate !== "string" || !AS_OF_DATE_PATTERN.test(asOfDate.trim())) {
    throw new GolfWorldRankingError(
      GolfWorldRankingErrorCodes.INVALID_AS_OF_DATE,
      "asOfDate must be an ISO calendar date (YYYY-MM-DD)",
    );
  }

  return asOfDate.trim();
}

export function validateRank(rank: unknown): number {
  if (
    typeof rank !== "number" ||
    !Number.isFinite(rank) ||
    !Number.isInteger(rank) ||
    rank < 1
  ) {
    throw new GolfWorldRankingError(
      GolfWorldRankingErrorCodes.INVALID_RANK,
      "rank must be a positive integer",
    );
  }

  return rank;
}

export function validateRankingPoints(rankingPoints: unknown): number {
  if (
    typeof rankingPoints !== "number" ||
    !Number.isFinite(rankingPoints) ||
    rankingPoints < 0
  ) {
    throw new GolfWorldRankingError(
      GolfWorldRankingErrorCodes.INVALID_RANKING_POINTS,
      "rankingPoints must be a non-negative number",
    );
  }

  return Math.round(rankingPoints * 1000) / 1000;
}

export function validateOverallSkill(overallSkill: unknown): number {
  if (
    typeof overallSkill !== "number" ||
    !Number.isFinite(overallSkill) ||
    overallSkill < 0 ||
    overallSkill > 100
  ) {
    throw new GolfWorldRankingError(
      GolfWorldRankingErrorCodes.INVALID_OVERALL_SKILL,
      "overallSkill must be a number between 0 and 100",
    );
  }

  return Math.round(overallSkill * 1000) / 1000;
}

export function buildGolfWorldRanking(
  input: GolfWorldRankingUpsertInput,
  id: string,
): GolfWorldRanking {
  return {
    id,
    golferId: validateGolferId(input.golferId),
    rankingSystem: validateRankingSystem(input.rankingSystem),
    asOfDate: validateAsOfDate(input.asOfDate),
    rank: validateRank(input.rank),
    rankingPoints: validateRankingPoints(input.rankingPoints),
    overallSkill: validateOverallSkill(input.overallSkill),
  };
}

/** Bootstrap OWGR points from overall skill until results-driven points exist. */
export function bootstrapRankingPointsFromSkill(overallSkill: number): number {
  return Math.round(overallSkill * 12.5 * 1000) / 1000;
}

export function worldRankingAsOfDateFromIsoUtc(isoUtc: string): string {
  return isoUtc.slice(0, 10);
}
