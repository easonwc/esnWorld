CREATE TABLE IF NOT EXISTS colleges (
  id TEXT PRIMARY KEY,
  location_id TEXT NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  attendance INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_colleges_location_id ON colleges(location_id);
