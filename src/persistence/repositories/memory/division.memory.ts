import type { Division } from "@/modules/divisions/types";
import type { DivisionRepository } from "../types";

export class MemoryDivisionRepository implements DivisionRepository {
  private readonly divisions = new Map<string, Division>();

  async list(): Promise<Division[]> {
    return [...this.divisions.values()].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }

  async listByConference(conferenceId: string): Promise<Division[]> {
    return [...this.divisions.values()]
      .filter((division) => division.conferenceId === conferenceId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async countByConference(conferenceId: string): Promise<number> {
    return [...this.divisions.values()].filter(
      (division) => division.conferenceId === conferenceId,
    ).length;
  }

  async get(id: string): Promise<Division | null> {
    return this.divisions.get(id) ?? null;
  }

  async getByAbbreviation(
    conferenceId: string,
    abbreviation: string,
  ): Promise<Division | null> {
    const normalized = abbreviation.trim().toUpperCase();
    return (
      [...this.divisions.values()].find(
        (division) =>
          division.conferenceId === conferenceId &&
          division.abbreviation === normalized,
      ) ?? null
    );
  }

  async create(division: Division): Promise<Division> {
    this.divisions.set(division.id, division);
    return division;
  }

  async delete(id: string): Promise<boolean> {
    return this.divisions.delete(id);
  }

  async clear(): Promise<void> {
    this.divisions.clear();
  }
}
