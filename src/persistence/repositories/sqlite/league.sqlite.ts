import type { League } from "@/modules/leagues/types";
import type { LeagueRepository } from "../types";
import type { Database } from "better-sqlite3";

type LeagueRow = {
  id: string;
  name: string;
  abbreviation: string;
  logo: string;
};

function rowToLeague(row: LeagueRow): League {
  return {
    id: row.id,
    name: row.name,
    abbreviation: row.abbreviation,
    logo: row.logo,
  };
}

const LEAGUE_SELECT = "SELECT id, name, abbreviation, logo FROM leagues";

export class SqliteLeagueRepository implements LeagueRepository {
  constructor(private readonly db: Database) {}

  async list(): Promise<League[]> {
    const rows = this.db
      .prepare(`${LEAGUE_SELECT} ORDER BY name ASC`)
      .all() as LeagueRow[];
    return rows.map(rowToLeague);
  }

  async get(id: string): Promise<League | null> {
    const row = this.db
      .prepare(`${LEAGUE_SELECT} WHERE id = ?`)
      .get(id) as LeagueRow | undefined;
    return row ? rowToLeague(row) : null;
  }

  async getByName(name: string): Promise<League | null> {
    const row = this.db
      .prepare(`${LEAGUE_SELECT} WHERE lower(name) = lower(?)`)
      .get(name) as LeagueRow | undefined;
    return row ? rowToLeague(row) : null;
  }

  async getByAbbreviation(abbreviation: string): Promise<League | null> {
    const row = this.db
      .prepare(`${LEAGUE_SELECT} WHERE upper(abbreviation) = upper(?)`)
      .get(abbreviation) as LeagueRow | undefined;
    return row ? rowToLeague(row) : null;
  }

  async create(league: League): Promise<League> {
    this.db
      .prepare(
        "INSERT INTO leagues (id, name, abbreviation, logo) VALUES (?, ?, ?, ?)",
      )
      .run(league.id, league.name, league.abbreviation, league.logo);
    return league;
  }

  async updateLogo(id: string, logo: string): Promise<void> {
    this.db
      .prepare("UPDATE leagues SET logo = ? WHERE id = ?")
      .run(logo, id);
  }

  async delete(id: string): Promise<boolean> {
    const result = this.db.prepare("DELETE FROM leagues WHERE id = ?").run(id);
    return result.changes > 0;
  }

  async clear(): Promise<void> {
    this.db.prepare("DELETE FROM leagues").run();
  }
}
