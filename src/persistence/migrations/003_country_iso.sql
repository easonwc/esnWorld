ALTER TABLE countries ADD COLUMN iso_code TEXT;

CREATE INDEX IF NOT EXISTS idx_countries_iso_code ON countries(iso_code);
