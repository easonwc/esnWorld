import type { Conference } from "@/modules/conferences/types";
import { ConferenceError, ConferenceErrorCodes } from "@/modules/conferences/errors";
import type { Database } from "better-sqlite3";
import { SqliteError } from "better-sqlite3";
import type { ConferenceRepository } from "../types";

type ConferenceRow = {
  id: string;
  league_id: string;
  league_name: string;
  name: string;
  abbreviation: string;
};

function rowToConference(row: ConferenceRow): Conference {
  return {
    id: row.id,
    leagueId: row.league_id,
    leagueName: row.league_name,
    name: row.name,
    abbreviation: row.abbreviation,
  };
}

const CONFERENCE_SELECT = `
  SELECT
    c.id,
    c.league_id,
    l.name AS league_name,
    c.name,
    c.abbreviation
  FROM conferences c
  INNER JOIN leagues l ON l.id = c.league_id
`;

export class SqliteConferenceRepository implements ConferenceRepository {
  constructor(private readonly db: Database) {}

  async list(): Promise<Conference[]> {
    const rows = this.db
      .prepare(`${CONFERENCE_SELECT} ORDER BY c.name ASC`)
      .all() as ConferenceRow[];
    return rows.map(rowToConference);
  }

  async listByLeague(leagueId: string): Promise<Conference[]> {
    const rows = this.db
      .prepare(`${CONFERENCE_SELECT} WHERE c.league_id = ? ORDER BY c.name ASC`)
      .all(leagueId) as ConferenceRow[];
    return rows.map(rowToConference);
  }

  async countByLeague(leagueId: string): Promise<number> {
    const row = this.db
      .prepare("SELECT COUNT(*) AS count FROM conferences WHERE league_id = ?")
      .get(leagueId) as { count: number };
    return row.count;
  }

  async get(id: string): Promise<Conference | null> {
    const row = this.db
      .prepare(`${CONFERENCE_SELECT} WHERE c.id = ?`)
      .get(id) as ConferenceRow | undefined;
    return row ? rowToConference(row) : null;
  }

  async getByAbbreviation(
    leagueId: string,
    abbreviation: string,
  ): Promise<Conference | null> {
    const row = this.db
      .prepare(
        `${CONFERENCE_SELECT} WHERE c.league_id = ? AND upper(c.abbreviation) = upper(?)`,
      )
      .get(leagueId, abbreviation) as ConferenceRow | undefined;
    return row ? rowToConference(row) : null;
  }

  async create(conference: Conference): Promise<Conference> {
    try {
      this.db
        .prepare(
          `INSERT INTO conferences (id, league_id, name, abbreviation)
           VALUES (?, ?, ?, ?)`,
        )
        .run(
          conference.id,
          conference.leagueId,
          conference.name,
          conference.abbreviation,
        );
    } catch (error) {
      if (error instanceof SqliteError && error.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
        throw new ConferenceError(
          ConferenceErrorCodes.LEAGUE_NOT_FOUND,
          `League not found: ${conference.leagueId}`,
        );
      }
      throw error;
    }

    return (await this.get(conference.id)) ?? conference;
  }

  async delete(id: string): Promise<boolean> {
    const result = this.db.prepare("DELETE FROM conferences WHERE id = ?").run(id);
    return result.changes > 0;
  }

  async clear(): Promise<void> {
    this.db.prepare("DELETE FROM conferences").run();
  }
}
