CREATE TABLE IF NOT EXISTS humans (
  id TEXT PRIMARY KEY,
  given_name TEXT NOT NULL,
  family_name TEXT NOT NULL,
  preferred_name TEXT,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  birth_date TEXT NOT NULL,
  birth_location_id TEXT NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  nationality_country_id TEXT NOT NULL REFERENCES countries(id) ON DELETE RESTRICT,
  height_cm INTEGER NOT NULL,
  weight_kg REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_humans_birth_location_id ON humans(birth_location_id);
CREATE INDEX IF NOT EXISTS idx_humans_nationality_country_id ON humans(nationality_country_id);
CREATE INDEX IF NOT EXISTS idx_humans_family_name ON humans(family_name COLLATE NOCASE);
