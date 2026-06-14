import type { Database } from "better-sqlite3";
import { COUNTRY_SEED_DATA } from "../seed/countries.data";

const BACKFILL_MARKER = "003_country_iso_backfill";

function hasIsoCodeColumn(db: Database): boolean {
  const rows = db.prepare("PRAGMA table_info(countries)").all() as {
    name: string;
  }[];
  return rows.some((row) => row.name === "iso_code");
}

function hasBackfillMarker(db: Database): boolean {
  const row = db
    .prepare("SELECT 1 AS present FROM schema_migrations WHERE version = ?")
    .get(BACKFILL_MARKER) as { present: number } | undefined;
  return row !== undefined;
}

function recordBackfillMarker(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  db.prepare("INSERT OR IGNORE INTO schema_migrations (version) VALUES (?)").run(
    BACKFILL_MARKER,
  );
}

function countriesNeedIsoBackfill(db: Database): boolean {
  const row = db
    .prepare(
      "SELECT 1 AS needs_backfill FROM countries WHERE iso_code IS NULL OR iso_code = '' LIMIT 1",
    )
    .get() as { needs_backfill: number } | undefined;
  return row !== undefined;
}

export function runCountryIsoMigration(db: Database): void {
  if (!hasIsoCodeColumn(db)) {
    return;
  }

  if (hasBackfillMarker(db) && !countriesNeedIsoBackfill(db)) {
    return;
  }

  const update = db.prepare(
    "UPDATE countries SET iso_code = ? WHERE lower(name) = lower(?) AND (iso_code IS NULL OR iso_code = '')",
  );

  for (const entry of COUNTRY_SEED_DATA) {
    update.run(entry.isoCode.toUpperCase(), entry.name);
  }

  if (!countriesNeedIsoBackfill(db)) {
    recordBackfillMarker(db);
  }
}

