CREATE TABLE IF NOT EXISTS golfers (
  id TEXT PRIMARY KEY,
  human_id TEXT NOT NULL UNIQUE REFERENCES humans(id) ON DELETE RESTRICT,
  plays_left_handed INTEGER NOT NULL DEFAULT 0,
  turned_pro_year INTEGER,
  putting_json TEXT NOT NULL,
  approach_json TEXT NOT NULL,
  short_game_json TEXT NOT NULL,
  tee_shot_json TEXT NOT NULL,
  clubs_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_golfers_human_id ON golfers(human_id);
