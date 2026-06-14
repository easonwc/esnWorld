import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";
import { runCountryIsoMigration } from "./migrate-003";

function createCountryTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE countries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      iso_code TEXT,
      flag TEXT NOT NULL,
      languages TEXT NOT NULL
    );
  `);
}

describe("runCountryIsoMigration", () => {
  it("backfills missing iso codes from the seed catalog", () => {
    const db = new Database(":memory:");
    createCountryTable(db);

    db.prepare(
      "INSERT INTO countries (id, name, iso_code, flag, languages) VALUES (?, ?, ?, ?, ?)",
    ).run("country-1", "United States", null, "/flags/us.svg", '["English"]');

    runCountryIsoMigration(db);

    const row = db
      .prepare("SELECT iso_code FROM countries WHERE id = 'country-1'")
      .get() as { iso_code: string };

    expect(row.iso_code).toBe("US");
    db.close();
  });

  it("records a backfill marker and skips the seed loop on later boots", () => {
    const db = new Database(":memory:");
    createCountryTable(db);

    db.prepare(
      "INSERT INTO countries (id, name, iso_code, flag, languages) VALUES (?, ?, ?, ?, ?)",
    ).run("country-1", "United States", "US", "/flags/us.svg", '["English"]');

    runCountryIsoMigration(db);

    const marker = db
      .prepare(
        "SELECT version FROM schema_migrations WHERE version = '003_country_iso_backfill'",
      )
      .get() as { version: string } | undefined;

    expect(marker?.version).toBe("003_country_iso_backfill");

    db.prepare("UPDATE countries SET iso_code = NULL WHERE id = 'country-1'").run();
    runCountryIsoMigration(db);

    const row = db
      .prepare("SELECT iso_code FROM countries WHERE id = 'country-1'")
      .get() as { iso_code: string };

    expect(row.iso_code).toBe("US");
    db.close();
  });
});
