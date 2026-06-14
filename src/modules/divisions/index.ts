import { getConferenceStore, ConferenceError } from "@/modules/conferences";
import {
  getDefaultDivisionRepository,
  getDefaultTeamRepository,
  type DivisionRepository,
} from "@/persistence/repositories";
import { DivisionError, DivisionErrorCodes } from "./errors";
import {
  buildDivision,
  validateConferenceId,
  validateId,
} from "./transform";
import type { Division, DivisionInput, DivisionOutput } from "./types";

export class DivisionStore {
  constructor(private readonly repository: DivisionRepository) {}

  async list(): Promise<Division[]> {
    return this.repository.list();
  }

  async listByConference(conferenceId: string): Promise<Division[]> {
    const id = validateConferenceId(conferenceId);
    await getConferenceStore().get(id);
    return this.repository.listByConference(id);
  }

  async countByConference(conferenceId: string): Promise<number> {
    return this.repository.countByConference(conferenceId);
  }

  async get(id: string): Promise<Division> {
    const division = await this.repository.get(id);

    if (!division) {
      throw new DivisionError(
        DivisionErrorCodes.DIVISION_NOT_FOUND,
        `Division not found: ${id}`,
      );
    }

    return division;
  }

  async getByAbbreviation(
    conferenceId: string,
    abbreviation: string,
  ): Promise<Division | null> {
    return this.repository.getByAbbreviation(conferenceId, abbreviation);
  }

  async create(input: {
    conferenceId: unknown;
    name: unknown;
    abbreviation: unknown;
  }): Promise<Division> {
    const conferenceId = validateConferenceId(input.conferenceId);

    let conference;
    try {
      conference = await getConferenceStore().get(conferenceId);
    } catch (error) {
      if (error instanceof ConferenceError) {
        throw new DivisionError(
          DivisionErrorCodes.CONFERENCE_NOT_FOUND,
          error.message,
        );
      }
      throw error;
    }

    const division = buildDivision(input, crypto.randomUUID(), {
      name: conference.name,
      abbreviation: conference.abbreviation,
      leagueId: conference.leagueId,
      leagueName: conference.leagueName,
    });
    return this.repository.create(division);
  }

  async delete(id: string): Promise<{ deleted: true; id: string }> {
    validateId(id);

    const division = await this.repository.get(id);
    if (!division) {
      throw new DivisionError(
        DivisionErrorCodes.DIVISION_NOT_FOUND,
        `Division not found: ${id}`,
      );
    }

    const teamCount = await getDefaultTeamRepository().countByDivision(id);
    if (teamCount > 0) {
      throw new DivisionError(
        DivisionErrorCodes.DIVISION_HAS_TEAMS,
        `Cannot delete division with ${teamCount} team(s). Delete teams first.`,
      );
    }

    await this.repository.delete(id);
    return { deleted: true, id };
  }

  async clear(): Promise<void> {
    await this.repository.clear();
  }
}

const globalForDivisions = globalThis as typeof globalThis & {
  __divisionStore?: DivisionStore;
};

export function getDivisionStore(): DivisionStore {
  if (!globalForDivisions.__divisionStore) {
    globalForDivisions.__divisionStore = new DivisionStore(
      getDefaultDivisionRepository(),
    );
  }
  return globalForDivisions.__divisionStore;
}

export function resetDivisionStore(
  repository?: DivisionRepository,
): DivisionStore {
  const store = new DivisionStore(repository ?? getDefaultDivisionRepository());
  globalForDivisions.__divisionStore = store;
  return store;
}

export async function executeDivision(
  input: DivisionInput,
): Promise<DivisionOutput> {
  const store = getDivisionStore();

  switch (input.action) {
    case "create":
      return store.create(input);

    case "get":
      return store.get(validateId(input.id));

    case "delete":
      return store.delete(validateId(input.id));

    case "listByConference":
      return store.listByConference(validateConferenceId(input.conferenceId));

    default: {
      const unknownAction = (input as { action: string }).action;
      throw new DivisionError(
        DivisionErrorCodes.INVALID_ACTION,
        `Unknown action: ${unknownAction}`,
      );
    }
  }
}

export async function listDivisions(): Promise<Division[]> {
  return getDivisionStore().list();
}

export * from "./types";
export * from "./errors";
export {
  buildDivision,
  validateAbbreviation,
  validateConferenceId,
  validateId,
  validateName,
} from "./transform";
