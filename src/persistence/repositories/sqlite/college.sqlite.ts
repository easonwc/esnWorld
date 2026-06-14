import type { College } from "@/modules/colleges/types";
import { CollegeError, CollegeErrorCodes } from "@/modules/colleges/errors";
import type { Database } from "better-sqlite3";
import { SqliteError } from "better-sqlite3";
import type { CollegeRepository } from "../types";

type CollegeRow = {
  id: string;
  location_id: string;
  location_name: string;
  location_region: string | null;
  name: string;
  attendance: number;
};

function rowToCollege(row: CollegeRow): College {
  return {
    id: row.id,
    name: row.name,
    locationId: row.location_id,
    locationName: row.location_name,
    locationRegion: row.location_region,
    attendance: row.attendance,
  };
}

const COLLEGE_SELECT = `
  SELECT
    c.id,
    c.location_id,
    l.name AS location_name,
    l.region AS location_region,
    c.name,
    c.attendance
  FROM colleges c
  INNER JOIN locations l ON l.id = c.location_id
`;

export class SqliteCollegeRepository implements CollegeRepository {
  constructor(private readonly db: Database) {}

  async list(): Promise<College[]> {
    const rows = this.db
      .prepare(`${COLLEGE_SELECT} ORDER BY c.name ASC, COALESCE(l.region, '') ASC`)
      .all() as CollegeRow[];
    return rows.map(rowToCollege);
  }

  async listByLocation(locationId: string): Promise<College[]> {
    const rows = this.db
      .prepare(
        `${COLLEGE_SELECT} WHERE c.location_id = ? ORDER BY c.name ASC`,
      )
      .all(locationId) as CollegeRow[];
    return rows.map(rowToCollege);
  }

  async countByLocation(locationId: string): Promise<number> {
    const row = this.db
      .prepare("SELECT COUNT(*) AS count FROM colleges WHERE location_id = ?")
      .get(locationId) as { count: number };
    return row.count;
  }

  async get(id: string): Promise<College | null> {
    const row = this.db
      .prepare(`${COLLEGE_SELECT} WHERE c.id = ?`)
      .get(id) as CollegeRow | undefined;
    return row ? rowToCollege(row) : null;
  }

  async create(college: College): Promise<College> {
    try {
      this.db
        .prepare(
          `INSERT INTO colleges (id, location_id, name, attendance)
           VALUES (?, ?, ?, ?)`,
        )
        .run(college.id, college.locationId, college.name, college.attendance);
    } catch (error) {
      if (error instanceof SqliteError && error.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
        throw new CollegeError(
          CollegeErrorCodes.LOCATION_NOT_FOUND,
          `Location not found: ${college.locationId}`,
        );
      }
      throw error;
    }

    return (await this.get(college.id)) ?? college;
  }

  async delete(id: string): Promise<boolean> {
    const result = this.db.prepare("DELETE FROM colleges WHERE id = ?").run(id);
    return result.changes > 0;
  }

  async clear(): Promise<void> {
    this.db.prepare("DELETE FROM colleges").run();
  }
}
