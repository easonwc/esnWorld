import { LeagueError, LeagueErrorCodes } from "./errors";
import type { League } from "./types";

export function validateName(name: unknown): string {
  if (typeof name !== "string" || name.trim().length === 0) {
    throw new LeagueError(
      LeagueErrorCodes.INVALID_NAME,
      "name must be a non-empty string",
    );
  }

  if (name.trim().length > 100) {
    throw new LeagueError(
      LeagueErrorCodes.INVALID_NAME,
      "name must be 100 characters or fewer",
    );
  }

  return name.trim();
}

export function validateAbbreviation(abbreviation: unknown): string {
  if (typeof abbreviation !== "string" || abbreviation.trim().length === 0) {
    throw new LeagueError(
      LeagueErrorCodes.INVALID_ABBREVIATION,
      "abbreviation is required",
    );
  }

  const normalized = abbreviation.trim().toUpperCase();

  if (!/^[A-Z0-9]{2,10}$/.test(normalized)) {
    throw new LeagueError(
      LeagueErrorCodes.INVALID_ABBREVIATION,
      "abbreviation must be 2–10 uppercase letters or digits",
    );
  }

  return normalized;
}

export function validateId(id: unknown): string {
  if (typeof id !== "string" || id.trim().length === 0) {
    throw new LeagueError(
      LeagueErrorCodes.MISSING_ID,
      "id is required",
    );
  }

  return id.trim();
}

export function validateLogo(logo: unknown): string {
  if (logo === undefined || logo === null || logo === "") {
    return "";
  }

  if (typeof logo !== "string") {
    throw new LeagueError(
      LeagueErrorCodes.INVALID_LOGO,
      "logo must be a string",
    );
  }

  const normalized = logo.trim();

  if (normalized.length > 128) {
    throw new LeagueError(
      LeagueErrorCodes.INVALID_LOGO,
      "logo must be 128 characters or fewer",
    );
  }

  return normalized;
}

export function buildLeague(
  input: {
    name: unknown;
    abbreviation: unknown;
    logo?: unknown;
  },
  id: string,
): League {
  return {
    id,
    name: validateName(input.name),
    abbreviation: validateAbbreviation(input.abbreviation),
    logo: validateLogo(input.logo),
  };
}
