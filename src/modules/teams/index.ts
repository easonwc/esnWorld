import { getDivisionStore, DivisionError } from "@/modules/divisions";
import { getVenueStore, VenueError } from "@/modules/venues";
import { getLocationStore } from "@/modules/locations";
import {
  getDefaultTeamRepository,
  type TeamRepository,
} from "@/persistence/repositories";
import { TeamError, TeamErrorCodes } from "./errors";
import {
  buildTeam,
  validateDivisionId,
  validateId,
  validateVenueId,
} from "./transform";
import type { Team, TeamInput, TeamOutput } from "./types";

export class TeamStore {
  constructor(private readonly repository: TeamRepository) {}

  async list(): Promise<Team[]> {
    return this.repository.list();
  }

  async listByDivision(divisionId: string): Promise<Team[]> {
    const id = validateDivisionId(divisionId);
    await getDivisionStore().get(id);
    return this.repository.listByDivision(id);
  }

  async listByLeague(leagueId: string): Promise<Team[]> {
    return this.repository.listByLeague(leagueId);
  }

  async countByDivision(divisionId: string): Promise<number> {
    return this.repository.countByDivision(divisionId);
  }

  async countByVenue(venueId: string): Promise<number> {
    return this.repository.countByVenue(venueId);
  }

  async get(id: string): Promise<Team> {
    const team = await this.repository.get(id);

    if (!team) {
      throw new TeamError(
        TeamErrorCodes.TEAM_NOT_FOUND,
        `Team not found: ${id}`,
      );
    }

    return team;
  }

  async getByAbbreviation(
    leagueId: string,
    abbreviation: string,
  ): Promise<Team | null> {
    return this.repository.getByAbbreviation(leagueId, abbreviation);
  }

  async create(input: {
    divisionId: unknown;
    venueId: unknown;
    name: unknown;
    abbreviation: unknown;
    logo: unknown;
  }): Promise<Team> {
    const divisionId = validateDivisionId(input.divisionId);
    const venueId = validateVenueId(input.venueId);

    let division;
    try {
      division = await getDivisionStore().get(divisionId);
    } catch (error) {
      if (error instanceof DivisionError) {
        throw new TeamError(
          TeamErrorCodes.DIVISION_NOT_FOUND,
          error.message,
        );
      }
      throw error;
    }

    let venue;
    try {
      venue = await getVenueStore().get(venueId);
    } catch (error) {
      if (error instanceof VenueError) {
        throw new TeamError(
          TeamErrorCodes.VENUE_NOT_FOUND,
          error.message,
        );
      }
      throw error;
    }

    const location = await getLocationStore().get(venue.locationId);

    const team = buildTeam(input, crypto.randomUUID(), {
      divisionName: division.name,
      divisionAbbreviation: division.abbreviation,
      conferenceId: division.conferenceId,
      conferenceName: division.conferenceName,
      conferenceAbbreviation: division.conferenceAbbreviation,
      leagueId: division.leagueId,
      leagueName: division.leagueName,
      venueName: venue.name,
      locationId: location.id,
      locationName: location.name,
      locationRegion: location.region,
    });
    return this.repository.create(team);
  }

  async delete(id: string): Promise<{ deleted: true; id: string }> {
    validateId(id);

    const team = await this.repository.get(id);
    if (!team) {
      throw new TeamError(
        TeamErrorCodes.TEAM_NOT_FOUND,
        `Team not found: ${id}`,
      );
    }

    await this.repository.delete(id);
    return { deleted: true, id };
  }

  async clear(): Promise<void> {
    await this.repository.clear();
  }
}

const globalForTeams = globalThis as typeof globalThis & {
  __teamStore?: TeamStore;
};

export function getTeamStore(): TeamStore {
  if (!globalForTeams.__teamStore) {
    globalForTeams.__teamStore = new TeamStore(getDefaultTeamRepository());
  }
  return globalForTeams.__teamStore;
}

export function resetTeamStore(repository?: TeamRepository): TeamStore {
  const store = new TeamStore(repository ?? getDefaultTeamRepository());
  globalForTeams.__teamStore = store;
  return store;
}

export async function executeTeam(input: TeamInput): Promise<TeamOutput> {
  const store = getTeamStore();

  switch (input.action) {
    case "create":
      return store.create(input);

    case "get":
      return store.get(validateId(input.id));

    case "delete":
      return store.delete(validateId(input.id));

    case "listByDivision":
      return store.listByDivision(validateDivisionId(input.divisionId));

    case "listByLeague":
      return store.listByLeague(input.leagueId);

    default: {
      const unknownAction = (input as { action: string }).action;
      throw new TeamError(
        TeamErrorCodes.INVALID_ACTION,
        `Unknown action: ${unknownAction}`,
      );
    }
  }
}

export async function listTeams(): Promise<Team[]> {
  return getTeamStore().list();
}

export * from "./types";
export * from "./errors";
export {
  buildTeam,
  validateAbbreviation,
  validateDivisionId,
  validateId,
  validateLogo,
  validateVenueId,
} from "./transform";
