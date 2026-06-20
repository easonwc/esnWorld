CREATE TABLE IF NOT EXISTS tennis_players (
  id TEXT PRIMARY KEY,
  human_id TEXT NOT NULL UNIQUE REFERENCES humans(id) ON DELETE RESTRICT,
  plays_left_handed INTEGER NOT NULL DEFAULT 0,
  backhand_style TEXT NOT NULL CHECK (backhand_style IN ('one_handed', 'two_handed')),
  turned_pro_year INTEGER,
  serve_json TEXT NOT NULL,
  return_json TEXT NOT NULL,
  baseline_json TEXT NOT NULL,
  net_json TEXT NOT NULL,
  surface_preference_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tennis_players_human_id ON tennis_players(human_id);
