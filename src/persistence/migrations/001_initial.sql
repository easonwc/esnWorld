CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  timezone TEXT NOT NULL,
  population INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS venues (
  id TEXT PRIMARY KEY,
  location_id TEXT NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  is_indoor INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_venues_location_id ON venues(location_id);
