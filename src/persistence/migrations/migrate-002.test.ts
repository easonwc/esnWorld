import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";
import { runCountryLocationMigration } from "./migrate-002";

function locationColumnNames(db: Database.Database): string[] {
  return (
    db.prepare("PRAGMA table_info(locations)").all() as { name: string }[]
  ).map((row) => row.name);
}

describe("runCountryLocationMigration", () => {
  it("preserves region when rebuilding legacy locations tables", () => {
    const db = new Database(":memory:");
    db.exec(`
      CREATE TABLE countries (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        flag TEXT NOT NULL,
        languages TEXT NOT NULL
      );

      INSERT INTO countries (id, name, flag, languages)
      VALUES ('country-1', 'United States', '/flags/us.svg', '["English"]');

      CREATE TABLE locations (
        id TEXT PRIMARY KEY,
        country TEXT NOT NULL,
        country_id TEXT,
        name TEXT NOT NULL,
        region TEXT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        timezone TEXT NOT NULL,
        population INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      INSERT INTO locations (
        id, country, country_id, name, region, latitude, longitude, timezone, population
      ) VALUES (
        'loc-1', 'United States', 'country-1', 'Columbia', 'Missouri', 38.9517, -92.3341, 'America/Chicago', 125000
      );
    `);

    runCountryLocationMigration(db);

    expect(locationColumnNames(db)).toContain("region");
    expect(locationColumnNames(db)).not.toContain("country");

    const row = db
      .prepare("SELECT name, region FROM locations WHERE id = 'loc-1'")
      .get() as { name: string; region: string };

    expect(row).toEqual({ name: "Columbia", region: "Missouri" });
    db.close();
  });

  it("adds region when rebuilding legacy tables that never had it", () => {
    const db = new Database(":memory:");
    db.exec(`
      CREATE TABLE countries (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        flag TEXT NOT NULL,
        languages TEXT NOT NULL
      );

      INSERT INTO countries (id, name, flag, languages)
      VALUES ('country-1', 'United States', '/flags/us.svg', '["English"]');

      CREATE TABLE locations (
        id TEXT PRIMARY KEY,
        country TEXT NOT NULL,
        country_id TEXT,
        name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        timezone TEXT NOT NULL,
        population INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      INSERT INTO locations (
        id, country, country_id, name, latitude, longitude, timezone, population
      ) VALUES (
        'loc-1', 'United States', 'country-1', 'Boston', 42.3601, -71.0589, 'America/New_York', 4941000
      );
    `);

    runCountryLocationMigration(db);

    expect(locationColumnNames(db)).toContain("region");

    const row = db
      .prepare("SELECT region FROM locations WHERE id = 'loc-1'")
      .get() as { region: string | null };

    expect(row.region).toBeNull();
    db.close();
  });
});
