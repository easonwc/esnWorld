CREATE TABLE teams_scoped_migration (
  id TEXT PRIMARY KEY,
  league_id TEXT NOT NULL REFERENCES leagues(id) ON DELETE RESTRICT,
  division_id TEXT NOT NULL REFERENCES divisions(id) ON DELETE RESTRICT,
  venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  abbreviation TEXT NOT NULL COLLATE NOCASE,
  logo TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (league_id, abbreviation),
  UNIQUE (division_id, name)
);

INSERT INTO teams_scoped_migration (
  id, league_id, division_id, venue_id, name, abbreviation, logo, created_at
)
SELECT
  t.id,
  c.league_id,
  t.division_id,
  t.venue_id,
  t.name,
  t.abbreviation,
  t.logo,
  t.created_at
FROM teams t
INNER JOIN divisions d ON d.id = t.division_id
INNER JOIN conferences c ON c.id = d.conference_id;

DROP TABLE teams;
ALTER TABLE teams_scoped_migration RENAME TO teams;

CREATE INDEX IF NOT EXISTS idx_teams_league_id ON teams(league_id);
CREATE INDEX IF NOT EXISTS idx_teams_division_id ON teams(division_id);
CREATE INDEX IF NOT EXISTS idx_teams_venue_id ON teams(venue_id);
