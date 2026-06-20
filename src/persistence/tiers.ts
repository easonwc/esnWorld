import type Database from "better-sqlite3";

/** Session tier — calendar and simulation state that changes frequently. */
export const SESSION_TIER_TABLES = [
  "events",
  "world_clock_state",
  "golf_season_schedules",
  "golf_tour_scheduler_state",
  "tennis_season_schedules",
  "tennis_tour_scheduler_state",
] as const;

/** World tier — geography and sports structure that rarely changes. */
export const WORLD_TIER_TABLES = [
  "teams",
  "divisions",
  "conferences",
  "leagues",
  "tennis_tournament_venues",
  "tennis_tournaments",
  "tennis_tours",
  "golf_tournament_venues",
  "golf_tournaments",
  "golf_tours",
  "colleges",
  "venue_resources",
  "venues",
  "locations",
  "countries",
] as const;

function tableExists(db: Database.Database, table: string): boolean {
  const row = db
    .prepare(
      "SELECT 1 AS present FROM sqlite_master WHERE type = 'table' AND name = ?",
    )
    .get(table) as { present: number } | undefined;
  return row !== undefined;
}

function deleteFromTables(
  db: Database.Database,
  tables: readonly string[],
): void {
  for (const table of tables) {
    if (tableExists(db, table)) {
      db.prepare(`DELETE FROM ${table}`).run();
    }
  }
}

export function clearSessionTier(db: Database.Database): void {
  db.exec("PRAGMA foreign_keys = OFF");
  deleteFromTables(db, SESSION_TIER_TABLES);
  db.exec("PRAGMA foreign_keys = ON");
}

export function clearWorldTier(db: Database.Database): void {
  clearSessionTier(db);
  db.exec("PRAGMA foreign_keys = OFF");
  deleteFromTables(db, WORLD_TIER_TABLES);
  db.exec("PRAGMA foreign_keys = ON");
}
