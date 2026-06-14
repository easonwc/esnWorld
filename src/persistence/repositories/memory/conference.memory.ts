import type { Conference } from "@/modules/conferences/types";
import type { ConferenceRepository } from "../types";

export class MemoryConferenceRepository implements ConferenceRepository {
  private readonly conferences = new Map<string, Conference>();

  async list(): Promise<Conference[]> {
    return [...this.conferences.values()].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }

  async listByLeague(leagueId: string): Promise<Conference[]> {
    return [...this.conferences.values()]
      .filter((conference) => conference.leagueId === leagueId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async countByLeague(leagueId: string): Promise<number> {
    return [...this.conferences.values()].filter(
      (conference) => conference.leagueId === leagueId,
    ).length;
  }

  async get(id: string): Promise<Conference | null> {
    return this.conferences.get(id) ?? null;
  }

  async getByAbbreviation(
    leagueId: string,
    abbreviation: string,
  ): Promise<Conference | null> {
    const normalized = abbreviation.trim().toUpperCase();
    return (
      [...this.conferences.values()].find(
        (conference) =>
          conference.leagueId === leagueId &&
          conference.abbreviation === normalized,
      ) ?? null
    );
  }

  async create(conference: Conference): Promise<Conference> {
    this.conferences.set(conference.id, conference);
    return conference;
  }

  async delete(id: string): Promise<boolean> {
    return this.conferences.delete(id);
  }

  async clear(): Promise<void> {
    this.conferences.clear();
  }
}
