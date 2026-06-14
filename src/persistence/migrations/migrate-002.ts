import type { Database } from "better-sqlite3";
import {
  parseLanguagesJson,
  serializeLanguages,
} from "@/modules/countries/transform";

function locationColumns(db: Database): Set<string> {
  const rows = db.prepare("PRAGMA table_info(locations)").all() as {
    name: string;
  }[];
  return new Set(rows.map((row) => row.name));
}

function ensureCountryIdColumn(db: Database): void {
  const columns = locationColumns(db);
  if (!columns.has("country_id")) {
    db.exec(
      "ALTER TABLE locations ADD COLUMN country_id TEXT REFERENCES countries(id)",
    );
  }
}

function migrateLegacyCountryNames(db: Database): void {
  const columns = locationColumns(db);
  if (!columns.has("country")) {
    return;
  }

  const distinctCountries = db
    .prepare("SELECT DISTINCT country AS name FROM locations WHERE country IS NOT NULL")
    .all() as { name: string }[];

  for (const { name } of distinctCountries) {
    let countryRow = db
      .prepare("SELECT id FROM countries WHERE lower(name) = lower(?)")
      .get(name) as { id: string } | undefined;

    if (!countryRow) {
      const id = crypto.randomUUID();
      db.prepare(
        "INSERT INTO countries (id, name, flag, languages) VALUES (?, ?, ?, ?)",
      ).run(id, name, "🏳️", serializeLanguages(["Unknown"]));
      countryRow = { id };
    }

    db.prepare("UPDATE locations SET country_id = ? WHERE country = ?").run(
      countryRow.id,
      name,
    );
  }
}

function rebuildLocationsWithCountryForeignKey(db: Database): void {
  const columns = locationColumns(db);
  if (!columns.has("country")) {
    return;
  }

  db.exec(`
    CREATE TABLE locations_new (
      id TEXT PRIMARY KEY,
      country_id TEXT NOT NULL REFERENCES countries(id) ON DELETE RESTRICT,
      name TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      timezone TEXT NOT NULL,
      population INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    INSERT INTO locations_new (
      id, country_id, name, latitude, longitude, timezone, population, created_at
    )
    SELECT
      id,
      country_id,
      name,
      latitude,
      longitude,
      timezone,
      population,
      created_at
    FROM locations
    WHERE country_id IS NOT NULL;

    DROP TABLE locations;
    ALTER TABLE locations_new RENAME TO locations;
    CREATE INDEX IF NOT EXISTS idx_locations_country_id ON locations(country_id);
  `);
}

export function runCountryLocationMigration(db: Database): void {
  ensureCountryIdColumn(db);
  migrateLegacyCountryNames(db);
  rebuildLocationsWithCountryForeignKey(db);
}

export function parseCountryLanguages(raw: string): string[] {
  return parseLanguagesJson(raw);
}
