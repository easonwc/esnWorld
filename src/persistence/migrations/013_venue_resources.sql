ALTER TABLE venues ADD COLUMN scheduling_mode TEXT NOT NULL DEFAULT 'exclusive'
  CHECK (scheduling_mode IN ('exclusive', 'multi_resource'));

CREATE TABLE IF NOT EXISTS venue_resources (
  id TEXT PRIMARY KEY,
  venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  resource_type TEXT NOT NULL DEFAULT 'generic'
    CHECK (resource_type IN ('court', 'tee_group', 'lane', 'generic')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (venue_id, name)
);

CREATE INDEX IF NOT EXISTS idx_venue_resources_venue_id ON venue_resources(venue_id);
