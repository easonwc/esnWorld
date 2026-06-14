import { DivisionError, DivisionErrorCodes } from "./errors";
import type { Division } from "./types";

export function validateName(name: unknown): string {
  if (typeof name !== "string" || name.trim().length === 0) {
    throw new DivisionError(
      DivisionErrorCodes.INVALID_NAME,
      "name must be a non-empty string",
    );
  }

  if (name.trim().length > 100) {
    throw new DivisionError(
      DivisionErrorCodes.INVALID_NAME,
      "name must be 100 characters or fewer",
    );
  }

  return name.trim();
}

export function validateAbbreviation(abbreviation: unknown): string {
  if (typeof abbreviation !== "string" || abbreviation.trim().length === 0) {
    throw new DivisionError(
      DivisionErrorCodes.INVALID_ABBREVIATION,
      "abbreviation is required",
    );
  }

  const normalized = abbreviation.trim().toUpperCase();

  if (!/^[A-Z0-9_]{2,12}$/.test(normalized)) {
    throw new DivisionError(
      DivisionErrorCodes.INVALID_ABBREVIATION,
      "abbreviation must be 2–12 uppercase letters, digits, or underscores",
    );
  }

  return normalized;
}

export function validateConferenceId(conferenceId: unknown): string {
  if (typeof conferenceId !== "string" || conferenceId.trim().length === 0) {
    throw new DivisionError(
      DivisionErrorCodes.INVALID_CONFERENCE_ID,
      "conferenceId is required",
    );
  }

  return conferenceId.trim();
}

export function validateLeagueId(leagueId: unknown): string {
  if (typeof leagueId !== "string" || leagueId.trim().length === 0) {
    throw new DivisionError(
      DivisionErrorCodes.INVALID_LEAGUE_ID,
      "leagueId is required",
    );
  }

  return leagueId.trim();
}

export function validateId(id: unknown): string {
  if (typeof id !== "string" || id.trim().length === 0) {
    throw new DivisionError(
      DivisionErrorCodes.MISSING_ID,
      "id is required",
    );
  }

  return id.trim();
}

export function buildDivision(
  input: {
    conferenceId: unknown;
    name: unknown;
    abbreviation: unknown;
  },
  id: string,
  conference: {
    name: string;
    abbreviation: string;
    leagueId: string;
    leagueName: string;
  },
): Division {
  return {
    id,
    conferenceId: validateConferenceId(input.conferenceId),
    conferenceName: conference.name,
    conferenceAbbreviation: conference.abbreviation,
    leagueId: conference.leagueId,
    leagueName: conference.leagueName,
    name: validateName(input.name),
    abbreviation: validateAbbreviation(input.abbreviation),
  };
}
