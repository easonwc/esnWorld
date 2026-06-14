CREATE TABLE IF NOT EXISTS conferences (
  id TEXT PRIMARY KEY,
  league_id TEXT NOT NULL REFERENCES leagues(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (league_id, abbreviation)
);

CREATE INDEX IF NOT EXISTS idx_conferences_league_id ON conferences(league_id);

CREATE TABLE IF NOT EXISTS divisions (
  id TEXT PRIMARY KEY,
  conference_id TEXT NOT NULL REFERENCES conferences(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (conference_id, abbreviation)
);

CREATE INDEX IF NOT EXISTS idx_divisions_conference_id ON divisions(conference_id);

CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  division_id TEXT NOT NULL REFERENCES divisions(id) ON DELETE RESTRICT,
  venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  abbreviation TEXT NOT NULL COLLATE NOCASE UNIQUE,
  logo TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (division_id, name)
);

CREATE INDEX IF NOT EXISTS idx_teams_division_id ON teams(division_id);
CREATE INDEX IF NOT EXISTS idx_teams_venue_id ON teams(venue_id);
