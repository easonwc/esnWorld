import {
  GolfTourMembershipError,
  GolfTourMembershipErrorCodes,
} from "./errors";
import type {
  GolfTourMembership,
  GolfTourMembershipStatus,
} from "./types";

export function validateId(id: unknown): string {
  if (typeof id !== "string" || id.trim().length === 0) {
    throw new GolfTourMembershipError(
      GolfTourMembershipErrorCodes.MISSING_ID,
      "id is required",
    );
  }

  return id.trim();
}

export function validateGolferId(golferId: unknown): string {
  if (typeof golferId !== "string" || golferId.trim().length === 0) {
    throw new GolfTourMembershipError(
      GolfTourMembershipErrorCodes.INVALID_GOLFER_ID,
      "golferId is required",
    );
  }

  return golferId.trim();
}

export function validateTourId(tourId: unknown): string {
  if (typeof tourId !== "string" || tourId.trim().length === 0) {
    throw new GolfTourMembershipError(
      GolfTourMembershipErrorCodes.INVALID_TOUR_ID,
      "tourId is required",
    );
  }

  return tourId.trim();
}

export function validateSeasonYear(seasonYear: unknown): number {
  if (
    typeof seasonYear !== "number" ||
    !Number.isFinite(seasonYear) ||
    !Number.isInteger(seasonYear) ||
    seasonYear < 1900 ||
    seasonYear > 3000
  ) {
    throw new GolfTourMembershipError(
      GolfTourMembershipErrorCodes.INVALID_SEASON_YEAR,
      "seasonYear must be an integer between 1900 and 3000",
    );
  }

  return seasonYear;
}

export function validateStatus(
  status: unknown,
): GolfTourMembershipStatus {
  if (status === undefined) {
    return "member";
  }

  if (status !== "member" && status !== "inactive") {
    throw new GolfTourMembershipError(
      GolfTourMembershipErrorCodes.INVALID_STATUS,
      "status must be member or inactive",
    );
  }

  return status;
}

export function validateOverallSkill(overallSkill: unknown): number {
  if (
    typeof overallSkill !== "number" ||
    !Number.isFinite(overallSkill) ||
    overallSkill < 0 ||
    overallSkill > 100
  ) {
    throw new GolfTourMembershipError(
      GolfTourMembershipErrorCodes.INVALID_OVERALL_SKILL,
      "overallSkill must be a number between 0 and 100",
    );
  }

  return Math.round(overallSkill * 1000) / 1000;
}

export function buildGolfTourMembership(
  input: {
    golferId: unknown;
    tourId: unknown;
    seasonYear: unknown;
    status?: unknown;
    overallSkill: unknown;
  },
  id: string,
): GolfTourMembership {
  return {
    id,
    golferId: validateGolferId(input.golferId),
    tourId: validateTourId(input.tourId),
    seasonYear: validateSeasonYear(input.seasonYear),
    status: validateStatus(input.status),
    overallSkill: validateOverallSkill(input.overallSkill),
  };
}
