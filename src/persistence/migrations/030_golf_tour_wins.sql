CREATE TABLE IF NOT EXISTS golf_tour_wins (
  id TEXT PRIMARY KEY,
  golfer_id TEXT NOT NULL REFERENCES golfers(id) ON DELETE RESTRICT,
  tour_id TEXT NOT NULL REFERENCES golf_tours(id) ON DELETE RESTRICT,
  season_year INTEGER NOT NULL,
  tournament_id TEXT REFERENCES golf_tournaments(id) ON DELETE RESTRICT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_golf_tour_wins_tour_season
  ON golf_tour_wins(tour_id, season_year);

CREATE INDEX IF NOT EXISTS idx_golf_tour_wins_golfer_id
  ON golf_tour_wins(golfer_id);
