import type { Team } from "@/modules/teams/types";
import type { TeamRepository } from "../types";
import { paginateArray, type ListOptions } from "@/lib/pagination";

export class MemoryTeamRepository implements TeamRepository {
  private readonly teams = new Map<string, Team>();

  async list(options?: ListOptions): Promise<Team[]> {
    const sorted = [...this.teams.values()].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    return options ? paginateArray(sorted, options) : sorted;
  }

  async count(): Promise<number> {
    return this.teams.size;
  }

  async listByDivision(divisionId: string): Promise<Team[]> {
    return [...this.teams.values()]
      .filter((team) => team.divisionId === divisionId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async listByLeague(leagueId: string): Promise<Team[]> {
    return [...this.teams.values()]
      .filter((team) => team.leagueId === leagueId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async listAbbreviationsByLeague(leagueId: string): Promise<ReadonlySet<string>> {
    return new Set(
      [...this.teams.values()]
        .filter((team) => team.leagueId === leagueId)
        .map((team) => team.abbreviation),
    );
  }

  async countByDivision(divisionId: string): Promise<number> {
    return [...this.teams.values()].filter(
      (team) => team.divisionId === divisionId,
    ).length;
  }

  async countByVenue(venueId: string): Promise<number> {
    return [...this.teams.values()].filter((team) => team.venueId === venueId)
      .length;
  }

  async get(id: string): Promise<Team | null> {
    return this.teams.get(id) ?? null;
  }

  async getByAbbreviation(
    leagueId: string,
    abbreviation: string,
  ): Promise<Team | null> {
    const normalized = abbreviation.trim().toUpperCase();
    return (
      [...this.teams.values()].find(
        (team) =>
          team.leagueId === leagueId && team.abbreviation === normalized,
      ) ?? null
    );
  }

  async create(team: Team): Promise<Team> {
    this.teams.set(team.id, team);
    return team;
  }

  async updateLogo(id: string, logo: string): Promise<void> {
    const team = this.teams.get(id);
    if (team) {
      this.teams.set(id, { ...team, logo });
    }
  }

  async delete(id: string): Promise<boolean> {
    return this.teams.delete(id);
  }

  async clear(): Promise<void> {
    this.teams.clear();
  }
}
