import type { Location } from "@/modules/locations/types";
import { LocationError, LocationErrorCodes } from "@/modules/locations/errors";
import Database, { SqliteError } from "better-sqlite3";
import type { LocationRepository } from "../types";

type LocationRow = {
  id: string;
  country_id: string;
  country_name: string;
  name: string;
  region: string | null;
  latitude: number;
  longitude: number;
  timezone: string;
  population: number;
};

function rowToLocation(row: LocationRow): Location {
  return {
    id: row.id,
    name: row.name,
    countryId: row.country_id,
    countryName: row.country_name,
    region: row.region,
    latitude: row.latitude,
    longitude: row.longitude,
    timezone: row.timezone,
    population: row.population,
  };
}

const LOCATION_SELECT = `
  SELECT
    l.id,
    l.country_id,
    c.name AS country_name,
    l.name,
    l.region,
    l.latitude,
    l.longitude,
    l.timezone,
    l.population
  FROM locations l
  INNER JOIN countries c ON c.id = l.country_id
`;

export class SqliteLocationRepository implements LocationRepository {
  constructor(private readonly db: Database.Database) {}

  async list(): Promise<Location[]> {
    const rows = this.db
      .prepare(`${LOCATION_SELECT} ORDER BY l.name ASC, COALESCE(l.region, '') ASC`)
      .all() as LocationRow[];
    return rows.map(rowToLocation);
  }

  async get(id: string): Promise<Location | null> {
    const row = this.db
      .prepare(`${LOCATION_SELECT} WHERE l.id = ?`)
      .get(id) as LocationRow | undefined;
    return row ? rowToLocation(row) : null;
  }

  async create(location: Location): Promise<Location> {
    try {
      this.db
        .prepare(
          `INSERT INTO locations (id, country_id, name, region, latitude, longitude, timezone, population)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          location.id,
          location.countryId,
          location.name,
          location.region,
          location.latitude,
          location.longitude,
          location.timezone,
          location.population,
        );
    } catch (error) {
      if (error instanceof SqliteError && error.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
        throw new LocationError(
          LocationErrorCodes.COUNTRY_NOT_FOUND,
          `Country not found: ${location.countryId}`,
        );
      }
      throw error;
    }

    return (await this.get(location.id)) ?? location;
  }

  async delete(id: string): Promise<boolean> {
    const result = this.db
      .prepare("DELETE FROM locations WHERE id = ?")
      .run(id);
    return result.changes > 0;
  }

  async countByCountry(countryId: string): Promise<number> {
    const row = this.db
      .prepare("SELECT COUNT(*) AS count FROM locations WHERE country_id = ?")
      .get(countryId) as { count: number };
    return row.count;
  }

  async sumPopulationByCountry(countryId: string): Promise<number> {
    const row = this.db
      .prepare(
        "SELECT COALESCE(SUM(population), 0) AS total FROM locations WHERE country_id = ?",
      )
      .get(countryId) as { total: number };
    return row.total;
  }

  async clear(): Promise<void> {
    this.db.prepare("DELETE FROM locations").run();
  }
}
