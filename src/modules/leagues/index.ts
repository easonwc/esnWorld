import { getConferenceStore } from "@/modules/conferences";
import { getDivisionStore } from "@/modules/divisions";
import { getTeamStore } from "@/modules/teams";
import {
  getDefaultConferenceRepository,
  getDefaultLeagueRepository,
  type LeagueRepository,
} from "@/persistence/repositories";
import type { ListOptions } from "@/lib/pagination";
import { LeagueError, LeagueErrorCodes } from "./errors";
import { buildLeague, validateId } from "./transform";
import type { League, LeagueInput, LeagueOutput } from "./types";

export class LeagueStore {
  constructor(private readonly repository: LeagueRepository) {}

  async list(options?: ListOptions): Promise<League[]> {
    return this.repository.list(options);
  }

  async count(): Promise<number> {
    return this.repository.count();
  }

  async get(id: string): Promise<League> {
    const league = await this.repository.get(id);

    if (!league) {
      throw new LeagueError(
        LeagueErrorCodes.LEAGUE_NOT_FOUND,
        `League not found: ${id}`,
      );
    }

    return league;
  }

  async getByName(name: string): Promise<League | null> {
    return this.repository.getByName(name);
  }

  async getByAbbreviation(abbreviation: string): Promise<League | null> {
    return this.repository.getByAbbreviation(abbreviation);
  }

  async create(input: {
    name: unknown;
    abbreviation: unknown;
  }): Promise<League> {
    const id = crypto.randomUUID();
    const league = buildLeague(input, id);
    return this.repository.create(league);
  }

  async delete(id: string): Promise<{ deleted: true; id: string }> {
    validateId(id);

    const league = await this.repository.get(id);
    if (!league) {
      throw new LeagueError(
        LeagueErrorCodes.LEAGUE_NOT_FOUND,
        `League not found: ${id}`,
      );
    }

    const conferenceCount = await getDefaultConferenceRepository().countByLeague(id);
    if (conferenceCount > 0) {
      throw new LeagueError(
        LeagueErrorCodes.LEAGUE_HAS_TEAMS,
        `Cannot delete league with ${conferenceCount} conference(s). Delete conferences first.`,
      );
    }

    await this.repository.delete(id);
    return { deleted: true, id };
  }

  async clear(): Promise<void> {
    await this.repository.clear();
  }
}

const globalForLeagues = globalThis as typeof globalThis & {
  __leagueStore?: LeagueStore;
};

export function getLeagueStore(): LeagueStore {
  if (!globalForLeagues.__leagueStore) {
    globalForLeagues.__leagueStore = new LeagueStore(
      getDefaultLeagueRepository(),
    );
  }
  return globalForLeagues.__leagueStore;
}

export function resetLeagueStore(
  repository?: LeagueRepository,
): LeagueStore {
  const store = new LeagueStore(repository ?? getDefaultLeagueRepository());
  globalForLeagues.__leagueStore = store;
  return store;
}

export async function executeLeague(
  input: LeagueInput,
): Promise<LeagueOutput> {
  const store = getLeagueStore();

  switch (input.action) {
    case "create":
      return store.create(input);

    case "get":
      return store.get(validateId(input.id));

    case "delete":
      return store.delete(validateId(input.id));

    case "listConferences": {
      const leagueId = validateId(input.leagueId);
      await store.get(leagueId);
      return getConferenceStore().listByLeague(leagueId);
    }

    case "listDivisions": {
      const leagueId = validateId(input.leagueId);
      await store.get(leagueId);
      return getDivisionStore().listByLeague(leagueId);
    }

    case "listTeams": {
      const leagueId = validateId(input.leagueId);
      await store.get(leagueId);
      return getTeamStore().listByLeague(leagueId);
    }

    default: {
      const unknownAction = (input as { action: string }).action;
      throw new LeagueError(
        LeagueErrorCodes.INVALID_ACTION,
        `Unknown action: ${unknownAction}`,
      );
    }
  }
}

export async function listLeagues(options?: ListOptions): Promise<League[]> {
  return getLeagueStore().list(options);
}

export async function countLeagues(): Promise<number> {
  return getLeagueStore().count();
}

export * from "./types";
export * from "./errors";
export {
  buildLeague,
  validateAbbreviation,
  validateId,
  validateLogo,
  validateName,
} from "./transform";
