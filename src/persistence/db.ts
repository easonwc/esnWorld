import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import {
  getDatabasePath,
  shouldFullResetDatabaseOnStartup,
  shouldResetSessionOnStartup,
  shouldResetWorldDatabaseOnStartup,
} from "./config";
import { runCountryLocationMigration } from "./migrations/migrate-002";
import { runCountryIsoMigration } from "./migrations/migrate-003";
import { clearSessionTier, clearWorldTier } from "./tiers";

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
  "010_college_logos.sql",
  "011_events.sql",
  "012_world_clock_state.sql",
  "013_venue_resources.sql",
  "014_event_venue_resource.sql",
  "015_golf_tours.sql",
  "016_golf_tournaments.sql",
  "017_golf_season_schedules.sql",
  "018_golf_tour_logos.sql",
  "019_golf_tournament_field_semantics.sql",
  "020_golf_tournament_materialize.sql",
  "021_golf_tournament_schedule_reference.sql",
  "022_tennis_tours.sql",
  "023_tennis_tournaments.sql",
  "024_tennis_season_schedules.sql",
  "025_humans.sql",
  "026_golfers.sql",
  "027_tennis_players.sql",
  "028_golf_tour_memberships.sql",
  "029_golf_world_rankings.sql",
  "030_golf_tour_wins.sql",
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
  __databaseResetApplied?: boolean;
};

export function deleteDatabaseFiles(dbPath = getDatabasePath()): void {
  for (const suffix of ["", "-wal", "-shm"]) {
    const filePath = `${dbPath}${suffix}`;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

function applyStartupResetsIfRequested(): void {
  if (globalForDb.__databaseResetApplied) {
    return;
  }

  globalForDb.__databaseResetApplied = true;

  const dbPath = getDatabasePath();

  if (shouldFullResetDatabaseOnStartup()) {
    closeDb();
    if (fs.existsSync(dbPath)) {
      deleteDatabaseFiles(dbPath);
      console.info("[database] full reset on startup — removed SQLite files");
    }
    return;
  }

  const worldReset = shouldResetWorldDatabaseOnStartup();
  const sessionReset = shouldResetSessionOnStartup();

  if (!worldReset && !sessionReset) {
    return;
  }

  if (!fs.existsSync(dbPath)) {
    return;
  }

  closeDb();

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  runMigrations(db);

  if (worldReset) {
    clearWorldTier(db);
    console.info(
      "[database] world tier reset on startup — cleared geography, sports structure, and session state",
    );
  } else {
    clearSessionTier(db);
    console.info(
      "[database] session tier reset on startup — cleared events and simulation state",
    );
  }

  db.close();
}

export function getDb(): Database.Database {
  if (!globalForDb.__worldDb) {
    applyStartupResetsIfRequested();

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

/** Test-only helper to re-run startup reset handlers. */
export function resetDatabaseStartupStateForTests(): void {
  globalForDb.__databaseResetApplied = false;
}
