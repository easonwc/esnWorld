CREATE TABLE IF NOT EXISTS golf_tournaments (
  id TEXT PRIMARY KEY,
  tour_id TEXT NOT NULL REFERENCES golf_tours(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  is_major INTEGER NOT NULL,
  purse_usd INTEGER NOT NULL,
  entry_criteria_json TEXT NOT NULL,
  venue_mode TEXT NOT NULL CHECK (venue_mode IN ('fixed', 'rotation')),
  typical_duration_days INTEGER NOT NULL DEFAULT 4,
  field_size INTEGER NOT NULL DEFAULT 30,
  season_start_month INTEGER NOT NULL,
  season_start_day INTEGER NOT NULL,
  rotation_epoch_year INTEGER,
  sort_order INTEGER NOT NULL,
  UNIQUE (tour_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_golf_tournaments_tour_id ON golf_tournaments(tour_id);

CREATE TABLE IF NOT EXISTS golf_tournament_venues (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL REFERENCES golf_tournaments(id) ON DELETE CASCADE,
  venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE RESTRICT,
  rotation_order INTEGER NOT NULL DEFAULT 0,
  is_default INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_golf_tournament_venues_tournament_id
  ON golf_tournament_venues(tournament_id);
