import type { Team } from "@/modules/teams/types";
import { TeamError, TeamErrorCodes } from "@/modules/teams/errors";
import type { Database } from "better-sqlite3";
import { SqliteError } from "better-sqlite3";
import type { TeamRepository } from "../types";
import type { ListOptions } from "@/lib/pagination";
import {
  sqliteListBindings,
  sqliteListSuffix,
} from "./list-pagination";

type TeamRow = {
  id: string;
  division_id: string;
  division_name: string;
  division_abbreviation: string;
  conference_id: string;
  conference_name: string;
  conference_abbreviation: string;
  league_id: string;
  league_name: string;
  venue_id: string;
  venue_name: string;
  location_id: string;
  location_name: string;
  location_region: string | null;
  name: string;
  abbreviation: string;
  logo: string;
};

function rowToTeam(row: TeamRow): Team {
  return {
    id: row.id,
    divisionId: row.division_id,
    divisionName: row.division_name,
    divisionAbbreviation: row.division_abbreviation,
    conferenceId: row.conference_id,
    conferenceName: row.conference_name,
    conferenceAbbreviation: row.conference_abbreviation,
    leagueId: row.league_id,
    leagueName: row.league_name,
    venueId: row.venue_id,
    venueName: row.venue_name,
    locationId: row.location_id,
    locationName: row.location_name,
    locationRegion: row.location_region,
    name: row.name,
    abbreviation: row.abbreviation,
    logo: row.logo,
  };
}

const TEAM_SELECT = `
  SELECT
    t.id,
    t.division_id,
    d.name AS division_name,
    d.abbreviation AS division_abbreviation,
    d.conference_id,
    c.name AS conference_name,
    c.abbreviation AS conference_abbreviation,
    c.league_id,
    l.name AS league_name,
    t.venue_id,
    v.name AS venue_name,
    v.location_id,
    loc.name AS location_name,
    loc.region AS location_region,
    t.name,
    t.abbreviation,
    t.logo
  FROM teams t
  INNER JOIN divisions d ON d.id = t.division_id
  INNER JOIN conferences c ON c.id = d.conference_id
  INNER JOIN leagues l ON l.id = c.league_id
  INNER JOIN venues v ON v.id = t.venue_id
  INNER JOIN locations loc ON loc.id = v.location_id
`;

export class SqliteTeamRepository implements TeamRepository {
  constructor(private readonly db: Database) {}

  async list(options?: ListOptions): Promise<Team[]> {
    const rows = this.db
      .prepare(
        `${TEAM_SELECT} ORDER BY t.name ASC${sqliteListSuffix(options)}`,
      )
      .all(...sqliteListBindings(options)) as TeamRow[];
    return rows.map(rowToTeam);
  }

  async count(): Promise<number> {
    const row = this.db
      .prepare("SELECT COUNT(*) AS count FROM teams")
      .get() as { count: number };
    return row.count;
  }

  async listByDivision(divisionId: string): Promise<Team[]> {
    const rows = this.db
      .prepare(`${TEAM_SELECT} WHERE t.division_id = ? ORDER BY t.name ASC`)
      .all(divisionId) as TeamRow[];
    return rows.map(rowToTeam);
  }

  async listByLeague(leagueId: string): Promise<Team[]> {
    const rows = this.db
      .prepare(`${TEAM_SELECT} WHERE c.league_id = ? ORDER BY t.name ASC`)
      .all(leagueId) as TeamRow[];
    return rows.map(rowToTeam);
  }

  async listAbbreviationsByLeague(leagueId: string): Promise<ReadonlySet<string>> {
    const rows = this.db
      .prepare(
        "SELECT upper(abbreviation) AS abbreviation FROM teams WHERE league_id = ?",
      )
      .all(leagueId) as { abbreviation: string }[];

    return new Set(rows.map((row) => row.abbreviation));
  }

  async countByDivision(divisionId: string): Promise<number> {
    const row = this.db
      .prepare("SELECT COUNT(*) AS count FROM teams WHERE division_id = ?")
      .get(divisionId) as { count: number };
    return row.count;
  }

  async countByVenue(venueId: string): Promise<number> {
    const row = this.db
      .prepare("SELECT COUNT(*) AS count FROM teams WHERE venue_id = ?")
      .get(venueId) as { count: number };
    return row.count;
  }

  async get(id: string): Promise<Team | null> {
    const row = this.db
      .prepare(`${TEAM_SELECT} WHERE t.id = ?`)
      .get(id) as TeamRow | undefined;
    return row ? rowToTeam(row) : null;
  }

  async getByAbbreviation(
    leagueId: string,
    abbreviation: string,
  ): Promise<Team | null> {
    const row = this.db
      .prepare(
        `${TEAM_SELECT} WHERE c.league_id = ? AND upper(t.abbreviation) = upper(?)`,
      )
      .get(leagueId, abbreviation) as TeamRow | undefined;
    return row ? rowToTeam(row) : null;
  }

  async create(team: Team): Promise<Team> {
    try {
      this.db
        .prepare(
          `INSERT INTO teams (id, league_id, division_id, venue_id, name, abbreviation, logo)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          team.id,
          team.leagueId,
          team.divisionId,
          team.venueId,
          team.name,
          team.abbreviation,
          team.logo,
        );
    } catch (error) {
      if (error instanceof SqliteError && error.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
        throw new TeamError(
          TeamErrorCodes.DIVISION_NOT_FOUND,
          `Division or venue not found for team ${team.name}`,
        );
      }
      throw error;
    }

    return (await this.get(team.id)) ?? team;
  }

  async updateLogo(id: string, logo: string): Promise<void> {
    this.db.prepare("UPDATE teams SET logo = ? WHERE id = ?").run(logo, id);
  }

  async delete(id: string): Promise<boolean> {
    const result = this.db.prepare("DELETE FROM teams WHERE id = ?").run(id);
    return result.changes > 0;
  }

  async clear(): Promise<void> {
    this.db.prepare("DELETE FROM teams").run();
  }
}
