import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { getDatabasePath } from "./config";
import { runCountryLocationMigration } from "./migrations/migrate-002";
import { runCountryIsoMigration } from "./migrations/migrate-003";

const MIGRATIONS = [
  "001_initial.sql",
  "002_countries.sql",
  "003_country_iso.sql",
  "004_location_region.sql",
  "005_colleges.sql",
  "006_leagues.sql",
  "007_nfl_structure.sql",
  "008_team_league_scope.sql",
  "009_league_logos.sql",
] as const;

function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const applied = new Set(
    db
      .prepare("SELECT version FROM schema_migrations")
      .all()
      .map((row) => (row as { version: string }).version),
  );

  for (const migration of MIGRATIONS) {
    if (applied.has(migration)) {
      continue;
    }

    const sqlPath = path.join(
      process.cwd(),
      "src",
      "persistence",
      "migrations",
      migration,
    );
    const sql = fs.readFileSync(sqlPath, "utf8");
    db.exec(sql);
    db.prepare("INSERT INTO schema_migrations (version) VALUES (?)").run(
      migration,
    );
  }

  runCountryLocationMigration(db);
  runCountryIsoMigration(db);
}

const globalForDb = globalThis as typeof globalThis & {
  __worldDb?: Database.Database;
};

export function getDb(): Database.Database {
  if (!globalForDb.__worldDb) {
    const dbPath = getDatabasePath();
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });

    const db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    runMigrations(db);
    globalForDb.__worldDb = db;
  }

  return globalForDb.__worldDb;
}

export function closeDb(): void {
  if (globalForDb.__worldDb) {
    globalForDb.__worldDb.close();
    globalForDb.__worldDb = undefined;
  }
}
