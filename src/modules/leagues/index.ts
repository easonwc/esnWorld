import {
  getDefaultConferenceRepository,
  getDefaultLeagueRepository,
  type LeagueRepository,
} from "@/persistence/repositories";
import { LeagueError, LeagueErrorCodes } from "./errors";
import { buildLeague, validateId } from "./transform";
import type { League, LeagueInput, LeagueOutput } from "./types";

export class LeagueStore {
  constructor(private readonly repository: LeagueRepository) {}

  async list(): Promise<League[]> {
    return this.repository.list();
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

    default: {
      const unknownAction = (input as { action: string }).action;
      throw new LeagueError(
        LeagueErrorCodes.INVALID_ACTION,
        `Unknown action: ${unknownAction}`,
      );
    }
  }
}

export async function listLeagues(): Promise<League[]> {
  return getLeagueStore().list();
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
