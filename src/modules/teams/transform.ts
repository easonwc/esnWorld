import { validateName } from "@/modules/locations";
import { TeamError, TeamErrorCodes } from "./errors";
import type { Team } from "./types";

export function validateId(id: unknown): string {
  if (typeof id !== "string" || id.trim().length === 0) {
    throw new TeamError(TeamErrorCodes.MISSING_ID, "id is required");
  }

  return id.trim();
}

export function validateDivisionId(divisionId: unknown): string {
  if (typeof divisionId !== "string" || divisionId.trim().length === 0) {
    throw new TeamError(
      TeamErrorCodes.INVALID_DIVISION_ID,
      "divisionId is required",
    );
  }

  return divisionId.trim();
}

export function validateVenueId(venueId: unknown): string {
  if (typeof venueId !== "string" || venueId.trim().length === 0) {
    throw new TeamError(
      TeamErrorCodes.INVALID_VENUE_ID,
      "venueId is required",
    );
  }

  return venueId.trim();
}

export function validateAbbreviation(abbreviation: unknown): string {
  if (typeof abbreviation !== "string" || abbreviation.trim().length === 0) {
    throw new TeamError(
      TeamErrorCodes.INVALID_ABBREVIATION,
      "abbreviation is required",
    );
  }

  const normalized = abbreviation.trim().toUpperCase();

  if (!/^[A-Z0-9]{2,4}$/.test(normalized)) {
    throw new TeamError(
      TeamErrorCodes.INVALID_ABBREVIATION,
      "abbreviation must be 2–4 uppercase letters or digits",
    );
  }

  return normalized;
}

export function validateLogo(logo: unknown): string {
  if (typeof logo !== "string" || logo.trim().length === 0) {
    throw new TeamError(
      TeamErrorCodes.INVALID_LOGO,
      "logo must be a non-empty string",
    );
  }

  const normalized = logo.trim();

  if (normalized.length > 128) {
    throw new TeamError(
      TeamErrorCodes.INVALID_LOGO,
      "logo must be 128 characters or fewer",
    );
  }

  return normalized;
}

function validateTeamName(name: unknown): string {
  try {
    return validateName(name);
  } catch (error) {
    if (error instanceof Error) {
      throw new TeamError(TeamErrorCodes.INVALID_NAME, error.message);
    }
    throw error;
  }
}

export function buildTeam(
  input: {
    divisionId: unknown;
    venueId: unknown;
    name: unknown;
    abbreviation: unknown;
    logo: unknown;
  },
  id: string,
  hierarchy: {
    divisionName: string;
    divisionAbbreviation: string;
    conferenceId: string;
    conferenceName: string;
    conferenceAbbreviation: string;
    leagueId: string;
    leagueName: string;
    venueName: string;
    locationId: string;
    locationName: string;
    locationRegion: string | null;
  },
): Team {
  return {
    id,
    divisionId: validateDivisionId(input.divisionId),
    divisionName: hierarchy.divisionName,
    divisionAbbreviation: hierarchy.divisionAbbreviation,
    conferenceId: hierarchy.conferenceId,
    conferenceName: hierarchy.conferenceName,
    conferenceAbbreviation: hierarchy.conferenceAbbreviation,
    leagueId: hierarchy.leagueId,
    leagueName: hierarchy.leagueName,
    venueId: validateVenueId(input.venueId),
    venueName: hierarchy.venueName,
    locationId: hierarchy.locationId,
    locationName: hierarchy.locationName,
    locationRegion: hierarchy.locationRegion,
    name: validateTeamName(input.name),
    abbreviation: validateAbbreviation(input.abbreviation),
    logo: validateLogo(input.logo),
  };
}
