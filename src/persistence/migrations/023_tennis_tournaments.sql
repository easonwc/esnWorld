CREATE TABLE IF NOT EXISTS tennis_tournaments (
  id TEXT PRIMARY KEY,
  tour_id TEXT NOT NULL REFERENCES tennis_tours(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  is_major INTEGER NOT NULL,
  prize_money_usd INTEGER NOT NULL,
  entry_criteria_json TEXT NOT NULL,
  venue_mode TEXT NOT NULL CHECK (venue_mode IN ('fixed', 'rotation')),
  typical_duration_days INTEGER NOT NULL DEFAULT 7,
  active_court_count INTEGER NOT NULL DEFAULT 12,
  draw_size INTEGER NOT NULL DEFAULT 32,
  season_start_month INTEGER NOT NULL,
  season_start_day INTEGER NOT NULL,
  rotation_epoch_year INTEGER,
  sort_order INTEGER NOT NULL,
  materialize_on_schedule INTEGER NOT NULL DEFAULT 1,
  schedule_reference_json TEXT,
  UNIQUE (tour_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_tennis_tournaments_tour_id ON tennis_tournaments(tour_id);

CREATE TABLE IF NOT EXISTS tennis_tournament_venues (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL REFERENCES tennis_tournaments(id) ON DELETE CASCADE,
  venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE RESTRICT,
  rotation_order INTEGER NOT NULL DEFAULT 0,
  is_default INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_tennis_tournament_venues_tournament_id
  ON tennis_tournament_venues(tournament_id);
