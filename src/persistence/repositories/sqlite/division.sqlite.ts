import type { Division } from "@/modules/divisions/types";
import { DivisionError, DivisionErrorCodes } from "@/modules/divisions/errors";
import type { Database } from "better-sqlite3";
import { SqliteError } from "better-sqlite3";
import type { DivisionRepository } from "../types";

type DivisionRow = {
  id: string;
  conference_id: string;
  conference_name: string;
  conference_abbreviation: string;
  league_id: string;
  league_name: string;
  name: string;
  abbreviation: string;
};

function rowToDivision(row: DivisionRow): Division {
  return {
    id: row.id,
    conferenceId: row.conference_id,
    conferenceName: row.conference_name,
    conferenceAbbreviation: row.conference_abbreviation,
    leagueId: row.league_id,
    leagueName: row.league_name,
    name: row.name,
    abbreviation: row.abbreviation,
  };
}

const DIVISION_SELECT = `
  SELECT
    d.id,
    d.conference_id,
    c.name AS conference_name,
    c.abbreviation AS conference_abbreviation,
    c.league_id,
    l.name AS league_name,
    d.name,
    d.abbreviation
  FROM divisions d
  INNER JOIN conferences c ON c.id = d.conference_id
  INNER JOIN leagues l ON l.id = c.league_id
`;

export class SqliteDivisionRepository implements DivisionRepository {
  constructor(private readonly db: Database) {}

  async list(): Promise<Division[]> {
    const rows = this.db
      .prepare(`${DIVISION_SELECT} ORDER BY d.name ASC`)
      .all() as DivisionRow[];
    return rows.map(rowToDivision);
  }

  async listByConference(conferenceId: string): Promise<Division[]> {
    const rows = this.db
      .prepare(
        `${DIVISION_SELECT} WHERE d.conference_id = ? ORDER BY d.name ASC`,
      )
      .all(conferenceId) as DivisionRow[];
    return rows.map(rowToDivision);
  }

  async countByConference(conferenceId: string): Promise<number> {
    const row = this.db
      .prepare("SELECT COUNT(*) AS count FROM divisions WHERE conference_id = ?")
      .get(conferenceId) as { count: number };
    return row.count;
  }

  async get(id: string): Promise<Division | null> {
    const row = this.db
      .prepare(`${DIVISION_SELECT} WHERE d.id = ?`)
      .get(id) as DivisionRow | undefined;
    return row ? rowToDivision(row) : null;
  }

  async getByAbbreviation(
    conferenceId: string,
    abbreviation: string,
  ): Promise<Division | null> {
    const row = this.db
      .prepare(
        `${DIVISION_SELECT} WHERE d.conference_id = ? AND upper(d.abbreviation) = upper(?)`,
      )
      .get(conferenceId, abbreviation) as DivisionRow | undefined;
    return row ? rowToDivision(row) : null;
  }

  async create(division: Division): Promise<Division> {
    try {
      this.db
        .prepare(
          `INSERT INTO divisions (id, conference_id, name, abbreviation)
           VALUES (?, ?, ?, ?)`,
        )
        .run(
          division.id,
          division.conferenceId,
          division.name,
          division.abbreviation,
        );
    } catch (error) {
      if (error instanceof SqliteError && error.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
        throw new DivisionError(
          DivisionErrorCodes.CONFERENCE_NOT_FOUND,
          `Conference not found: ${division.conferenceId}`,
        );
      }
      throw error;
    }

    return (await this.get(division.id)) ?? division;
  }

  async delete(id: string): Promise<boolean> {
    const result = this.db.prepare("DELETE FROM divisions WHERE id = ?").run(id);
    return result.changes > 0;
  }

  async clear(): Promise<void> {
    this.db.prepare("DELETE FROM divisions").run();
  }
}
