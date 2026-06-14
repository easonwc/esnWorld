import type { Venue } from "@/modules/venues/types";
import type { Database } from "better-sqlite3";
import type { VenueRepository } from "../types";
import type { ListOptions } from "@/lib/pagination";
import {
  sqliteListBindings,
  sqliteListSuffix,
} from "./list-pagination";

type VenueRow = {
  id: string;
  location_id: string;
  name: string;
  latitude: number;
  longitude: number;
  is_indoor: number;
};

function rowToVenue(row: VenueRow): Venue {
  return {
    id: row.id,
    locationId: row.location_id,
    name: row.name,
    latitude: row.latitude,
    longitude: row.longitude,
    isIndoor: row.is_indoor === 1,
  };
}

export class SqliteVenueRepository implements VenueRepository {
  constructor(private readonly db: Database) {}

  async list(options?: ListOptions): Promise<Venue[]> {
    const rows = this.db
      .prepare(
        `SELECT id, location_id, name, latitude, longitude, is_indoor FROM venues ORDER BY name ASC${sqliteListSuffix(options)}`,
      )
      .all(...sqliteListBindings(options)) as VenueRow[];
    return rows.map(rowToVenue);
  }

  async count(): Promise<number> {
    const row = this.db
      .prepare("SELECT COUNT(*) AS count FROM venues")
      .get() as { count: number };
    return row.count;
  }

  async listByLocation(locationId: string): Promise<Venue[]> {
    const rows = this.db
      .prepare(
        `SELECT id, location_id, name, latitude, longitude, is_indoor
         FROM venues
         WHERE location_id = ?
         ORDER BY name ASC`,
      )
      .all(locationId) as VenueRow[];
    return rows.map(rowToVenue);
  }

  async countByLocation(locationId: string): Promise<number> {
    const row = this.db
      .prepare("SELECT COUNT(*) AS count FROM venues WHERE location_id = ?")
      .get(locationId) as { count: number };
    return row.count;
  }

  async get(id: string): Promise<Venue | null> {
    const row = this.db
      .prepare(
        "SELECT id, location_id, name, latitude, longitude, is_indoor FROM venues WHERE id = ?",
      )
      .get(id) as VenueRow | undefined;
    return row ? rowToVenue(row) : null;
  }

  async create(venue: Venue): Promise<Venue> {
    this.db
      .prepare(
        `INSERT INTO venues (id, location_id, name, latitude, longitude, is_indoor)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(
        venue.id,
        venue.locationId,
        venue.name,
        venue.latitude,
        venue.longitude,
        venue.isIndoor ? 1 : 0,
      );
    return venue;
  }

  async delete(id: string): Promise<boolean> {
    const result = this.db.prepare("DELETE FROM venues WHERE id = ?").run(id);
    return result.changes > 0;
  }

  async clear(): Promise<void> {
    this.db.prepare("DELETE FROM venues").run();
  }
}
