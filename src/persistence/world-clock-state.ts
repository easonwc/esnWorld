import type { WorldClockTickerState } from "@/modules/world-clock/tick";
import type Database from "better-sqlite3";

const WORLD_CLOCK_STATE_ID = "default";

type WorldClockStateRow = {
  epoch_ms: number;
  is_running: number;
  last_started_at_real_ms: number | null;
  simulated_ms_per_real_ms: number;
};

export function loadWorldClockTickerState(
  db: Database,
): WorldClockTickerState | null {
  const row = db
    .prepare(
      `SELECT epoch_ms, is_running, last_started_at_real_ms, simulated_ms_per_real_ms
       FROM world_clock_state
       WHERE id = ?`,
    )
    .get(WORLD_CLOCK_STATE_ID) as WorldClockStateRow | undefined;

  if (!row) {
    return null;
  }

  return {
    epochMs: row.epoch_ms,
    isRunning: row.is_running === 1,
    lastStartedAtRealMs: row.last_started_at_real_ms,
    simulatedMsPerRealMs: row.simulated_ms_per_real_ms,
  };
}

export function saveWorldClockTickerState(
  db: Database,
  ticker: WorldClockTickerState,
): void {
  db.prepare(
    `INSERT INTO world_clock_state (
      id,
      epoch_ms,
      is_running,
      last_started_at_real_ms,
      simulated_ms_per_real_ms,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      epoch_ms = excluded.epoch_ms,
      is_running = excluded.is_running,
      last_started_at_real_ms = excluded.last_started_at_real_ms,
      simulated_ms_per_real_ms = excluded.simulated_ms_per_real_ms,
      updated_at = datetime('now')`,
  ).run(
    WORLD_CLOCK_STATE_ID,
    ticker.epochMs,
    ticker.isRunning ? 1 : 0,
    ticker.lastStartedAtRealMs,
    ticker.simulatedMsPerRealMs,
  );
}
