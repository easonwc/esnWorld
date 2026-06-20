import type { Human } from "@/modules/humans/types";
import type { HumanRepository } from "../types";
import { paginateArray, type ListOptions } from "@/lib/pagination";

export class MemoryHumanRepository implements HumanRepository {
  private readonly humans = new Map<string, Human>();

  async list(options?: ListOptions): Promise<Human[]> {
    const sorted = [...this.humans.values()].sort((a, b) => {
      const byFamily = a.familyName.localeCompare(b.familyName);
      if (byFamily !== 0) {
        return byFamily;
      }
      return a.givenName.localeCompare(b.givenName);
    });
    return options ? paginateArray(sorted, options) : sorted;
  }

  async count(): Promise<number> {
    return this.humans.size;
  }

  async get(id: string): Promise<Human | null> {
    return this.humans.get(id) ?? null;
  }

  async create(human: Human): Promise<Human> {
    this.humans.set(human.id, human);
    return human;
  }

  async delete(id: string): Promise<boolean> {
    return this.humans.delete(id);
  }

  async clear(): Promise<void> {
    this.humans.clear();
  }
}
