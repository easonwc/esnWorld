import type { Human } from "@/modules/humans/types";
import { HumanError, HumanErrorCodes } from "@/modules/humans/errors";
import type { Database } from "better-sqlite3";
import { SqliteError } from "better-sqlite3";
import type { HumanRepository } from "../types";
import type { ListOptions } from "@/lib/pagination";
import { humanDisplayName } from "@/modules/humans/transform";
import {
  sqliteListBindings,
  sqliteListSuffix,
} from "./list-pagination";

type HumanRow = {
  id: string;
  given_name: string;
  family_name: string;
  preferred_name: string | null;
  gender: "male" | "female";
  birth_date: string;
  birth_location_id: string;
  birth_location_name: string;
  birth_location_region: string | null;
  birth_location_country_name: string;
  nationality_country_id: string;
  nationality_country_name: string;
  height_cm: number;
  weight_kg: number;
};

function rowToHuman(row: HumanRow): Human {
  const givenName = row.given_name;
  const familyName = row.family_name;
  const preferredName = row.preferred_name;

  return {
    id: row.id,
    givenName,
    familyName,
    preferredName,
    displayName: humanDisplayName({ givenName, familyName, preferredName }),
    gender: row.gender,
    birthDate: row.birth_date,
    birthLocationId: row.birth_location_id,
    birthLocationName: row.birth_location_name,
    birthLocationRegion: row.birth_location_region,
    birthLocationCountryName: row.birth_location_country_name,
    nationalityCountryId: row.nationality_country_id,
    nationalityCountryName: row.nationality_country_name,
    heightCm: row.height_cm,
    weightKg: row.weight_kg,
  };
}

const HUMAN_SELECT = `
  SELECT
    h.id,
    h.given_name,
    h.family_name,
    h.preferred_name,
    h.gender,
    h.birth_date,
    h.birth_location_id,
    bl.name AS birth_location_name,
    bl.region AS birth_location_region,
    bc.name AS birth_location_country_name,
    h.nationality_country_id,
    nc.name AS nationality_country_name,
    h.height_cm,
    h.weight_kg
  FROM humans h
  INNER JOIN locations bl ON bl.id = h.birth_location_id
  INNER JOIN countries bc ON bc.id = bl.country_id
  INNER JOIN countries nc ON nc.id = h.nationality_country_id
`;

export class SqliteHumanRepository implements HumanRepository {
  constructor(private readonly db: Database) {}

  async list(options?: ListOptions): Promise<Human[]> {
    const rows = this.db
      .prepare(
        `${HUMAN_SELECT} ORDER BY h.family_name COLLATE NOCASE ASC, h.given_name COLLATE NOCASE ASC${sqliteListSuffix(options)}`,
      )
      .all(...sqliteListBindings(options)) as HumanRow[];
    return rows.map(rowToHuman);
  }

  async count(): Promise<number> {
    const row = this.db
      .prepare("SELECT COUNT(*) AS count FROM humans")
      .get() as { count: number };
    return row.count;
  }

  async get(id: string): Promise<Human | null> {
    const row = this.db
      .prepare(`${HUMAN_SELECT} WHERE h.id = ?`)
      .get(id) as HumanRow | undefined;
    return row ? rowToHuman(row) : null;
  }

  async create(human: Human): Promise<Human> {
    try {
      this.db
        .prepare(
          `INSERT INTO humans (
            id,
            given_name,
            family_name,
            preferred_name,
            gender,
            birth_date,
            birth_location_id,
            nationality_country_id,
            height_cm,
            weight_kg
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          human.id,
          human.givenName,
          human.familyName,
          human.preferredName,
          human.gender,
          human.birthDate,
          human.birthLocationId,
          human.nationalityCountryId,
          human.heightCm,
          human.weightKg,
        );
    } catch (error) {
      if (
        error instanceof SqliteError &&
        error.code === "SQLITE_CONSTRAINT_FOREIGNKEY"
      ) {
        throw new HumanError(
          HumanErrorCodes.BIRTH_LOCATION_NOT_FOUND,
          `Invalid birth location or nationality country for human ${human.id}`,
        );
      }
      throw error;
    }

    return (await this.get(human.id)) ?? human;
  }

  async delete(id: string): Promise<boolean> {
    const result = this.db.prepare("DELETE FROM humans WHERE id = ?").run(id);
    return result.changes > 0;
  }

  async clear(): Promise<void> {
    this.db.prepare("DELETE FROM humans").run();
  }
}
