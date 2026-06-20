CREATE TABLE IF NOT EXISTS golf_tour_memberships (
  id TEXT PRIMARY KEY,
  golfer_id TEXT NOT NULL REFERENCES golfers(id) ON DELETE RESTRICT,
  tour_id TEXT NOT NULL REFERENCES golf_tours(id) ON DELETE RESTRICT,
  season_year INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('member', 'inactive')),
  overall_skill REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (golfer_id, tour_id, season_year)
);

CREATE INDEX IF NOT EXISTS idx_golf_tour_memberships_tour_season
  ON golf_tour_memberships(tour_id, season_year);

CREATE INDEX IF NOT EXISTS idx_golf_tour_memberships_golfer_id
  ON golf_tour_memberships(golfer_id);
