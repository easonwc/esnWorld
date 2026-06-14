import type { Database } from "better-sqlite3";
import { COUNTRY_SEED_DATA } from "../seed/countries.data";

function hasIsoCodeColumn(db: Database): boolean {
  const rows = db.prepare("PRAGMA table_info(countries)").all() as {
    name: string;
  }[];
  return rows.some((row) => row.name === "iso_code");
}

export function runCountryIsoMigration(db: Database): void {
  if (!hasIsoCodeColumn(db)) {
    return;
  }

  const update = db.prepare(
    "UPDATE countries SET iso_code = ? WHERE lower(name) = lower(?) AND (iso_code IS NULL OR iso_code = '')",
  );

  for (const entry of COUNTRY_SEED_DATA) {
    update.run(entry.isoCode.toUpperCase(), entry.name);
  }
}
