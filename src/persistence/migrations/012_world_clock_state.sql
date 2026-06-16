CREATE TABLE IF NOT EXISTS world_clock_state (
  id TEXT PRIMARY KEY DEFAULT 'default',
  epoch_ms INTEGER NOT NULL,
  is_running INTEGER NOT NULL,
  last_started_at_real_ms INTEGER,
  simulated_ms_per_real_ms REAL NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
