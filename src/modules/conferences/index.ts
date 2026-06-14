import { getLeagueStore, LeagueError } from "@/modules/leagues";
import {
  getDefaultConferenceRepository,
  getDefaultDivisionRepository,
  type ConferenceRepository,
} from "@/persistence/repositories";
import { ConferenceError, ConferenceErrorCodes } from "./errors";
import {
  buildConference,
  validateId,
  validateLeagueId,
} from "./transform";
import type { Conference, ConferenceInput, ConferenceOutput } from "./types";

export class ConferenceStore {
  constructor(private readonly repository: ConferenceRepository) {}

  async list(): Promise<Conference[]> {
    return this.repository.list();
  }

  async listByLeague(leagueId: string): Promise<Conference[]> {
    const id = validateLeagueId(leagueId);
    await getLeagueStore().get(id);
    return this.repository.listByLeague(id);
  }

  async countByLeague(leagueId: string): Promise<number> {
    return this.repository.countByLeague(leagueId);
  }

  async get(id: string): Promise<Conference> {
    const conference = await this.repository.get(id);

    if (!conference) {
      throw new ConferenceError(
        ConferenceErrorCodes.CONFERENCE_NOT_FOUND,
        `Conference not found: ${id}`,
      );
    }

    return conference;
  }

  async getByAbbreviation(
    leagueId: string,
    abbreviation: string,
  ): Promise<Conference | null> {
    return this.repository.getByAbbreviation(leagueId, abbreviation);
  }

  async create(input: {
    leagueId: unknown;
    name: unknown;
    abbreviation: unknown;
  }): Promise<Conference> {
    const leagueId = validateLeagueId(input.leagueId);

    let league;
    try {
      league = await getLeagueStore().get(leagueId);
    } catch (error) {
      if (error instanceof LeagueError) {
        throw new ConferenceError(
          ConferenceErrorCodes.LEAGUE_NOT_FOUND,
          error.message,
        );
      }
      throw error;
    }

    const conference = buildConference(
      input,
      crypto.randomUUID(),
      league.name,
    );
    return this.repository.create(conference);
  }

  async delete(id: string): Promise<{ deleted: true; id: string }> {
    validateId(id);

    const conference = await this.repository.get(id);
    if (!conference) {
      throw new ConferenceError(
        ConferenceErrorCodes.CONFERENCE_NOT_FOUND,
        `Conference not found: ${id}`,
      );
    }

    const divisionCount = await getDefaultDivisionRepository().countByConference(id);
    if (divisionCount > 0) {
      throw new ConferenceError(
        ConferenceErrorCodes.CONFERENCE_HAS_DIVISIONS,
        `Cannot delete conference with ${divisionCount} division(s). Delete divisions first.`,
      );
    }

    await this.repository.delete(id);
    return { deleted: true, id };
  }

  async clear(): Promise<void> {
    await this.repository.clear();
  }
}

const globalForConferences = globalThis as typeof globalThis & {
  __conferenceStore?: ConferenceStore;
};

export function getConferenceStore(): ConferenceStore {
  if (!globalForConferences.__conferenceStore) {
    globalForConferences.__conferenceStore = new ConferenceStore(
      getDefaultConferenceRepository(),
    );
  }
  return globalForConferences.__conferenceStore;
}

export function resetConferenceStore(
  repository?: ConferenceRepository,
): ConferenceStore {
  const store = new ConferenceStore(
    repository ?? getDefaultConferenceRepository(),
  );
  globalForConferences.__conferenceStore = store;
  return store;
}

export async function executeConference(
  input: ConferenceInput,
): Promise<ConferenceOutput> {
  const store = getConferenceStore();

  switch (input.action) {
    case "create":
      return store.create(input);

    case "get":
      return store.get(validateId(input.id));

    case "delete":
      return store.delete(validateId(input.id));

    case "listByLeague":
      return store.listByLeague(validateLeagueId(input.leagueId));

    default: {
      const unknownAction = (input as { action: string }).action;
      throw new ConferenceError(
        ConferenceErrorCodes.INVALID_ACTION,
        `Unknown action: ${unknownAction}`,
      );
    }
  }
}

export async function listConferences(): Promise<Conference[]> {
  return getConferenceStore().list();
}

export * from "./types";
export * from "./errors";
export {
  buildConference,
  validateAbbreviation,
  validateId,
  validateLeagueId,
  validateName,
} from "./transform";
