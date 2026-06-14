import { validateAbbreviation as validateLeagueAbbreviation } from "@/modules/leagues/transform";
import { ConferenceError, ConferenceErrorCodes } from "./errors";
import type { Conference } from "./types";

export function validateName(name: unknown): string {
  if (typeof name !== "string" || name.trim().length === 0) {
    throw new ConferenceError(
      ConferenceErrorCodes.INVALID_NAME,
      "name must be a non-empty string",
    );
  }

  if (name.trim().length > 100) {
    throw new ConferenceError(
      ConferenceErrorCodes.INVALID_NAME,
      "name must be 100 characters or fewer",
    );
  }

  return name.trim();
}

export function validateAbbreviation(abbreviation: unknown): string {
  try {
    return validateLeagueAbbreviation(abbreviation);
  } catch {
    throw new ConferenceError(
      ConferenceErrorCodes.INVALID_ABBREVIATION,
      "abbreviation must be 2–10 uppercase letters or digits",
    );
  }
}

export function validateLeagueId(leagueId: unknown): string {
  if (typeof leagueId !== "string" || leagueId.trim().length === 0) {
    throw new ConferenceError(
      ConferenceErrorCodes.INVALID_LEAGUE_ID,
      "leagueId is required",
    );
  }

  return leagueId.trim();
}

export function validateId(id: unknown): string {
  if (typeof id !== "string" || id.trim().length === 0) {
    throw new ConferenceError(
      ConferenceErrorCodes.MISSING_ID,
      "id is required",
    );
  }

  return id.trim();
}

export function buildConference(
  input: {
    leagueId: unknown;
    name: unknown;
    abbreviation: unknown;
  },
  id: string,
  leagueName: string,
): Conference {
  return {
    id,
    leagueId: validateLeagueId(input.leagueId),
    leagueName: leagueName.trim(),
    name: validateName(input.name),
    abbreviation: validateAbbreviation(input.abbreviation),
  };
}
