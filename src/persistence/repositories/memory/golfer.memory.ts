import type { Golfer } from "@/modules/golfers/types";
import { GolferError, GolferErrorCodes } from "@/modules/golfers/errors";
import type { GolferRepository } from "../types";
import { paginateArray, type ListOptions } from "@/lib/pagination";

export class MemoryGolferRepository implements GolferRepository {
  private readonly golfers = new Map<string, Golfer>();

  async list(options?: ListOptions): Promise<Golfer[]> {
    const sorted = [...this.golfers.values()].sort((a, b) => {
      const byFamily = a.humanDisplayName.localeCompare(b.humanDisplayName);
      if (byFamily !== 0) {
        return byFamily;
      }
      return a.humanId.localeCompare(b.humanId);
    });
    return options ? paginateArray(sorted, options) : sorted;
  }

  async count(): Promise<number> {
    return this.golfers.size;
  }

  async get(id: string): Promise<Golfer | null> {
    return this.golfers.get(id) ?? null;
  }

  async getByHumanId(humanId: string): Promise<Golfer | null> {
    return (
      [...this.golfers.values()].find((golfer) => golfer.humanId === humanId) ??
      null
    );
  }

  async create(golfer: Golfer): Promise<Golfer> {
    if ([...this.golfers.values()].some((entry) => entry.humanId === golfer.humanId)) {
      throw new GolferError(
        GolferErrorCodes.GOLFER_ALREADY_EXISTS,
        `Golfer profile already exists for human: ${golfer.humanId}`,
      );
    }

    this.golfers.set(golfer.id, golfer);
    return golfer;
  }

  async delete(id: string): Promise<boolean> {
    return this.golfers.delete(id);
  }

  async clear(): Promise<void> {
    this.golfers.clear();
  }
}
