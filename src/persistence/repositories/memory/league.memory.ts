import type { League } from "@/modules/leagues/types";
import type { LeagueRepository } from "../types";

export class MemoryLeagueRepository implements LeagueRepository {
  private readonly leagues = new Map<string, League>();

  async list(): Promise<League[]> {
    return [...this.leagues.values()].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }

  async get(id: string): Promise<League | null> {
    return this.leagues.get(id) ?? null;
  }

  async getByName(name: string): Promise<League | null> {
    const normalized = name.trim().toLowerCase();
    return (
      [...this.leagues.values()].find(
        (league) => league.name.toLowerCase() === normalized,
      ) ?? null
    );
  }

  async getByAbbreviation(abbreviation: string): Promise<League | null> {
    const normalized = abbreviation.trim().toUpperCase();
    return (
      [...this.leagues.values()].find(
        (league) => league.abbreviation === normalized,
      ) ?? null
    );
  }

  async create(league: League): Promise<League> {
    this.leagues.set(league.id, league);
    return league;
  }

  async updateLogo(id: string, logo: string): Promise<void> {
    const league = this.leagues.get(id);
    if (!league) {
      return;
    }

    this.leagues.set(id, { ...league, logo });
  }

  async delete(id: string): Promise<boolean> {
    return this.leagues.delete(id);
  }

  async clear(): Promise<void> {
    this.leagues.clear();
  }
}
