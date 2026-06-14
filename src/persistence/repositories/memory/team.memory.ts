import type { Team } from "@/modules/teams/types";
import type { TeamRepository } from "../types";

export class MemoryTeamRepository implements TeamRepository {
  private readonly teams = new Map<string, Team>();

  async list(): Promise<Team[]> {
    return [...this.teams.values()].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
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
