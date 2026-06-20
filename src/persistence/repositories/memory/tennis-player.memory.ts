import type { TennisPlayer } from "@/modules/tennis-players/types";
import { TennisPlayerError, TennisPlayerErrorCodes } from "@/modules/tennis-players/errors";
import type { TennisPlayerRepository } from "../types";
import { paginateArray, type ListOptions } from "@/lib/pagination";

export class MemoryTennisPlayerRepository implements TennisPlayerRepository {
  private readonly players = new Map<string, TennisPlayer>();

  async list(options?: ListOptions): Promise<TennisPlayer[]> {
    const sorted = [...this.players.values()].sort((a, b) =>
      a.humanDisplayName.localeCompare(b.humanDisplayName),
    );
    return options ? paginateArray(sorted, options) : sorted;
  }

  async count(): Promise<number> {
    return this.players.size;
  }

  async get(id: string): Promise<TennisPlayer | null> {
    return this.players.get(id) ?? null;
  }

  async getByHumanId(humanId: string): Promise<TennisPlayer | null> {
    return (
      [...this.players.values()].find((player) => player.humanId === humanId) ??
      null
    );
  }

  async create(player: TennisPlayer): Promise<TennisPlayer> {
    if (
      [...this.players.values()].some((entry) => entry.humanId === player.humanId)
    ) {
      throw new TennisPlayerError(
        TennisPlayerErrorCodes.TENNIS_PLAYER_ALREADY_EXISTS,
        `Tennis player profile already exists for human: ${player.humanId}`,
      );
    }

    this.players.set(player.id, player);
    return player;
  }

  async delete(id: string): Promise<boolean> {
    return this.players.delete(id);
  }

  async clear(): Promise<void> {
    this.players.clear();
  }
}
