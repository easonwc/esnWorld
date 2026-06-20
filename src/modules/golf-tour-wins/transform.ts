import { GolfTourWinError, GolfTourWinErrorCodes } from "./errors";
import type { GolfTourWin } from "./types";

export function validateId(id: unknown): string {
  if (typeof id !== "string" || id.trim().length === 0) {
    throw new GolfTourWinError(
      GolfTourWinErrorCodes.MISSING_ID,
      "id is required",
    );
  }

  return id.trim();
}

export function validateGolferId(golferId: unknown): string {
  if (typeof golferId !== "string" || golferId.trim().length === 0) {
    throw new GolfTourWinError(
      GolfTourWinErrorCodes.INVALID_GOLFER_ID,
      "golferId is required",
    );
  }

  return golferId.trim();
}

export function validateTourId(tourId: unknown): string {
  if (typeof tourId !== "string" || tourId.trim().length === 0) {
    throw new GolfTourWinError(
      GolfTourWinErrorCodes.INVALID_TOUR_ID,
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
    throw new GolfTourWinError(
      GolfTourWinErrorCodes.INVALID_SEASON_YEAR,
      "seasonYear must be an integer between 1900 and 3000",
    );
  }

  return seasonYear;
}

export function validateTournamentId(
  tournamentId: unknown,
): string | null {
  if (tournamentId === undefined || tournamentId === null) {
    return null;
  }

  if (typeof tournamentId !== "string" || tournamentId.trim().length === 0) {
    throw new GolfTourWinError(
      GolfTourWinErrorCodes.INVALID_TOURNAMENT_ID,
      "tournamentId must be a non-empty string when provided",
    );
  }

  return tournamentId.trim();
}

export function buildGolfTourWin(
  input: {
    golferId: unknown;
    tourId: unknown;
    seasonYear: unknown;
    tournamentId?: unknown;
  },
  id: string,
): GolfTourWin {
  return {
    id,
    golferId: validateGolferId(input.golferId),
    tourId: validateTourId(input.tourId),
    seasonYear: validateSeasonYear(input.seasonYear),
    tournamentId: validateTournamentId(input.tournamentId),
  };
}
