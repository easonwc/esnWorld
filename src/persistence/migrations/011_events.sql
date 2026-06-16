CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES events(id) ON DELETE CASCADE,
  venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  local_start_year INTEGER NOT NULL,
  local_start_month INTEGER NOT NULL,
  local_start_day INTEGER NOT NULL,
  local_start_hour INTEGER NOT NULL,
  local_start_minute INTEGER NOT NULL,
  local_start_second INTEGER NOT NULL DEFAULT 0,
  iso_utc_start TEXT NOT NULL,
  iso_utc_end TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_events_venue_id ON events(venue_id);
CREATE INDEX IF NOT EXISTS idx_events_parent_id ON events(parent_id);
CREATE INDEX IF NOT EXISTS idx_events_iso_utc_start ON events(iso_utc_start);
