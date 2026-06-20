CREATE TABLE IF NOT EXISTS golf_world_rankings (
  id TEXT PRIMARY KEY,
  golfer_id TEXT NOT NULL REFERENCES golfers(id) ON DELETE RESTRICT,
  ranking_system TEXT NOT NULL CHECK (ranking_system IN ('owgr', 'rolex')),
  as_of_date TEXT NOT NULL,
  rank INTEGER NOT NULL CHECK (rank >= 1),
  ranking_points REAL NOT NULL,
  overall_skill REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (golfer_id, ranking_system, as_of_date),
  UNIQUE (ranking_system, as_of_date, rank)
);

CREATE INDEX IF NOT EXISTS idx_golf_world_rankings_system_date
  ON golf_world_rankings(ranking_system, as_of_date);

CREATE INDEX IF NOT EXISTS idx_golf_world_rankings_golfer_id
  ON golf_world_rankings(golfer_id);
