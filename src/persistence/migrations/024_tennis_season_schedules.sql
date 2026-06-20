CREATE TABLE IF NOT EXISTS tennis_season_schedules (
  id TEXT PRIMARY KEY,
  tour_id TEXT NOT NULL,
  tournament_id TEXT NOT NULL,
  season_year INTEGER NOT NULL,
  venue_id TEXT NOT NULL,
  root_event_id TEXT NOT NULL,
  scheduled_at_iso_utc TEXT NOT NULL,
  UNIQUE (tour_id, tournament_id, season_year)
);

CREATE INDEX IF NOT EXISTS idx_tennis_season_schedules_tour_season
  ON tennis_season_schedules(tour_id, season_year);

CREATE TABLE IF NOT EXISTS tennis_tour_scheduler_state (
  tour_abbreviation TEXT PRIMARY KEY,
  last_processed_iso_utc TEXT NOT NULL,
  last_scheduled_season_year INTEGER
);
