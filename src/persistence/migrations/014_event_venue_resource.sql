ALTER TABLE events ADD COLUMN venue_resource_id TEXT REFERENCES venue_resources(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_events_venue_resource_id ON events(venue_resource_id);
