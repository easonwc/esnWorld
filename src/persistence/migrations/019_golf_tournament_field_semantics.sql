ALTER TABLE golf_tournaments RENAME COLUMN field_size TO tee_group_count;
ALTER TABLE golf_tournaments ADD COLUMN field_size INTEGER NOT NULL DEFAULT 144;
