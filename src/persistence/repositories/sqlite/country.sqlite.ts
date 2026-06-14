import {
  parseLanguagesJson,
  serializeLanguages,
  validateIsoCode,
} from "@/modules/countries/transform";
import type { CountryRecord } from "../types";
import type { CountryRepository } from "../types";
import type { Database } from "better-sqlite3";
import type { ListOptions } from "@/lib/pagination";
import {
  sqliteListBindings,
  sqliteListSuffix,
} from "./list-pagination";

type CountryRow = {
  id: string;
  name: string;
  iso_code: string | null;
  flag: string;
  languages: string;
};

function rowToCountryRecord(row: CountryRow): CountryRecord {
  return {
    id: row.id,
    name: row.name,
    isoCode: row.iso_code,
    flag: row.flag,
    languages: parseLanguagesJson(row.languages),
  };
}

const COUNTRY_SELECT =
  "SELECT id, name, iso_code, flag, languages FROM countries";

export class SqliteCountryRepository implements CountryRepository {
  constructor(private readonly db: Database) {}

  async list(options?: ListOptions): Promise<CountryRecord[]> {
    const rows = this.db
      .prepare(
        `${COUNTRY_SELECT} ORDER BY name ASC${sqliteListSuffix(options)}`,
      )
      .all(...sqliteListBindings(options)) as CountryRow[];
    return rows.map(rowToCountryRecord);
  }

  async count(): Promise<number> {
    const row = this.db
      .prepare("SELECT COUNT(*) AS count FROM countries")
      .get() as { count: number };
    return row.count;
  }

  async get(id: string): Promise<CountryRecord | null> {
    const row = this.db
      .prepare(`${COUNTRY_SELECT} WHERE id = ?`)
      .get(id) as CountryRow | undefined;
    return row ? rowToCountryRecord(row) : null;
  }

  async getByName(name: string): Promise<CountryRecord | null> {
    const row = this.db
      .prepare(`${COUNTRY_SELECT} WHERE lower(name) = lower(?)`)
      .get(name) as CountryRow | undefined;
    return row ? rowToCountryRecord(row) : null;
  }

  async create(country: CountryRecord): Promise<CountryRecord> {
    this.db
      .prepare(
        "INSERT INTO countries (id, name, iso_code, flag, languages) VALUES (?, ?, ?, ?, ?)",
      )
      .run(
        country.id,
        country.name,
        country.isoCode,
        country.flag,
        serializeLanguages(country.languages),
      );
    return country;
  }

  async updateFlag(id: string, flag: string): Promise<void> {
    this.db.prepare("UPDATE countries SET flag = ? WHERE id = ?").run(flag, id);
  }

  async delete(id: string): Promise<boolean> {
    const result = this.db.prepare("DELETE FROM countries WHERE id = ?").run(id);
    return result.changes > 0;
  }

  async clear(): Promise<void> {
    this.db.prepare("DELETE FROM countries").run();
  }
}
