import { HumanError, getHumanStore } from "@/modules/humans";
import {
  getDefaultTennisPlayerRepository,
  type TennisPlayerRepository,
} from "@/persistence/repositories";
import type { ListOptions } from "@/lib/pagination";
import { TennisPlayerError, TennisPlayerErrorCodes } from "./errors";
import { buildTennisPlayer, validateHumanId, validateId } from "./transform";
import type {
  TennisPlayer,
  TennisPlayerInput,
  TennisPlayerOutput,
} from "./types";

export class TennisPlayerStore {
  constructor(private readonly repository: TennisPlayerRepository) {}

  async list(options?: ListOptions): Promise<TennisPlayer[]> {
    return this.repository.list(options);
  }

  async count(): Promise<number> {
    return this.repository.count();
  }

  async get(id: string): Promise<TennisPlayer> {
    const player = await this.repository.get(id);

    if (!player) {
      throw new TennisPlayerError(
        TennisPlayerErrorCodes.TENNIS_PLAYER_NOT_FOUND,
        `Tennis player not found: ${id}`,
      );
    }

    return player;
  }

  async getByHumanId(humanId: string): Promise<TennisPlayer> {
    const player = await this.repository.getByHumanId(humanId);

    if (!player) {
      throw new TennisPlayerError(
        TennisPlayerErrorCodes.TENNIS_PLAYER_NOT_FOUND,
        `Tennis player not found for human: ${humanId}`,
      );
    }

    return player;
  }

  async create(input: {
    humanId: unknown;
    playsLeftHanded?: unknown;
    backhandStyle?: unknown;
    turnedProYear?: unknown;
    serve: unknown;
    return: unknown;
    baseline: unknown;
    net: unknown;
    surfacePreference?: unknown;
  }): Promise<TennisPlayer> {
    const humanId = validateHumanId(input.humanId);

    let human;
    try {
      human = await getHumanStore().get(humanId);
    } catch (error) {
      if (error instanceof HumanError) {
        throw new TennisPlayerError(
          TennisPlayerErrorCodes.HUMAN_NOT_FOUND,
          error.message,
        );
      }
      throw error;
    }

    const existing = await this.repository.getByHumanId(humanId);
    if (existing) {
      throw new TennisPlayerError(
        TennisPlayerErrorCodes.TENNIS_PLAYER_ALREADY_EXISTS,
        `Tennis player profile already exists for human: ${humanId}`,
      );
    }

    const playerId = crypto.randomUUID();
    const player = buildTennisPlayer(input, playerId, human);

    return this.repository.create(player);
  }

  async delete(id: string): Promise<{ deleted: true; id: string }> {
    validateId(id);

    const player = await this.repository.get(id);
    if (!player) {
      throw new TennisPlayerError(
        TennisPlayerErrorCodes.TENNIS_PLAYER_NOT_FOUND,
        `Tennis player not found: ${id}`,
      );
    }

    await this.repository.delete(id);
    return { deleted: true, id };
  }

  async clear(): Promise<void> {
    await this.repository.clear();
  }
}

const globalForTennisPlayers = globalThis as typeof globalThis & {
  __tennisPlayerStore?: TennisPlayerStore;
};

export function getTennisPlayerStore(): TennisPlayerStore {
  if (!globalForTennisPlayers.__tennisPlayerStore) {
    globalForTennisPlayers.__tennisPlayerStore = new TennisPlayerStore(
      getDefaultTennisPlayerRepository(),
    );
  }
  return globalForTennisPlayers.__tennisPlayerStore;
}

export function resetTennisPlayerStore(
  repository?: TennisPlayerRepository,
): TennisPlayerStore {
  const store = new TennisPlayerStore(
    repository ?? getDefaultTennisPlayerRepository(),
  );
  globalForTennisPlayers.__tennisPlayerStore = store;
  return store;
}

export async function executeTennisPlayer(
  input: TennisPlayerInput,
): Promise<TennisPlayerOutput> {
  const store = getTennisPlayerStore();

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
      throw new TennisPlayerError(
        TennisPlayerErrorCodes.INVALID_ACTION,
        `Unknown action: ${unknownAction}`,
      );
    }
  }
}

export async function listTennisPlayers(
  options?: ListOptions,
): Promise<TennisPlayer[]> {
  return getTennisPlayerStore().list(options);
}

export async function countTennisPlayers(): Promise<number> {
  return getTennisPlayerStore().count();
}

export * from "./types";
export * from "./errors";
export {
  buildTennisPlayer,
  toCompletePlayer,
  validateBackhandStyle,
  validateHumanId,
  validateId,
  validatePlaysLeftHanded,
  validateTennisPlayerSkills,
  validateTurnedProYear,
} from "./transform";
