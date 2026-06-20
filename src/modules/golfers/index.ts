import { HumanError, getHumanStore } from "@/modules/humans";
import {
  getDefaultGolferRepository,
  type GolferRepository,
} from "@/persistence/repositories";
import type { ListOptions } from "@/lib/pagination";
import { GolferError, GolferErrorCodes } from "./errors";
import { buildGolfer, validateHumanId, validateId } from "./transform";
import type { Golfer, GolferInput, GolferOutput } from "./types";

export class GolferStore {
  constructor(private readonly repository: GolferRepository) {}

  async list(options?: ListOptions): Promise<Golfer[]> {
    return this.repository.list(options);
  }

  async count(): Promise<number> {
    return this.repository.count();
  }

  async get(id: string): Promise<Golfer> {
    const golfer = await this.repository.get(id);

    if (!golfer) {
      throw new GolferError(
        GolferErrorCodes.GOLFER_NOT_FOUND,
        `Golfer not found: ${id}`,
      );
    }

    return golfer;
  }

  async getByHumanId(humanId: string): Promise<Golfer> {
    const golfer = await this.repository.getByHumanId(humanId);

    if (!golfer) {
      throw new GolferError(
        GolferErrorCodes.GOLFER_NOT_FOUND,
        `Golfer not found for human: ${humanId}`,
      );
    }

    return golfer;
  }

  async create(input: {
    humanId: unknown;
    playsLeftHanded?: unknown;
    turnedProYear?: unknown;
    putting: unknown;
    approach: unknown;
    shortGame: unknown;
    teeShot: unknown;
    clubs: unknown;
  }): Promise<Golfer> {
    const humanId = validateHumanId(input.humanId);

    let human;
    try {
      human = await getHumanStore().get(humanId);
    } catch (error) {
      if (error instanceof HumanError) {
        throw new GolferError(GolferErrorCodes.HUMAN_NOT_FOUND, error.message);
      }
      throw error;
    }

    const existing = await this.repository.getByHumanId(humanId);
    if (existing) {
      throw new GolferError(
        GolferErrorCodes.GOLFER_ALREADY_EXISTS,
        `Golfer profile already exists for human: ${humanId}`,
      );
    }

    const golferId = crypto.randomUUID();
    const golfer = buildGolfer(input, golferId, human);

    return this.repository.create(golfer);
  }

  async delete(id: string): Promise<{ deleted: true; id: string }> {
    validateId(id);

    const golfer = await this.repository.get(id);
    if (!golfer) {
      throw new GolferError(
        GolferErrorCodes.GOLFER_NOT_FOUND,
        `Golfer not found: ${id}`,
      );
    }

    await this.repository.delete(id);
    return { deleted: true, id };
  }

  async clear(): Promise<void> {
    await this.repository.clear();
  }
}

const globalForGolfers = globalThis as typeof globalThis & {
  __golferStore?: GolferStore;
};

export function getGolferStore(): GolferStore {
  if (!globalForGolfers.__golferStore) {
    globalForGolfers.__golferStore = new GolferStore(getDefaultGolferRepository());
  }
  return globalForGolfers.__golferStore;
}

export function resetGolferStore(repository?: GolferRepository): GolferStore {
  const store = new GolferStore(repository ?? getDefaultGolferRepository());
  globalForGolfers.__golferStore = store;
  return store;
}

export async function executeGolfer(input: GolferInput): Promise<GolferOutput> {
  const store = getGolferStore();

  switch (input.action) {
    case "create":
      return store.create(input);

    case "get":
      return store.get(validateId(input.id));

    case "getByHuman":
      return store.getByHumanId(validateHumanId(input.humanId));

    case "delete":
      return store.delete(validateId(input.id));

    default: {
      const unknownAction = (input as { action: string }).action;
      throw new GolferError(
        GolferErrorCodes.INVALID_ACTION,
        `Unknown action: ${unknownAction}`,
      );
    }
  }
}

export async function listGolfers(options?: ListOptions): Promise<Golfer[]> {
  return getGolferStore().list(options);
}

export async function countGolfers(): Promise<number> {
  return getGolferStore().count();
}

export * from "./types";
export * from "./errors";
export {
  buildGolfer,
  toCompleteGolfer,
  validateGolferSkills,
  validateHumanId,
  validateId,
  validatePlaysLeftHanded,
  validateTurnedProYear,
} from "./transform";
export {
  compareGolfersByOverallSkill,
  golferOverallSkillAverage,
  rankGolfersByOverallSkill,
} from "./skill";
