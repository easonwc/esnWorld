import type { VenueResource } from "@/modules/venues/types";
import type { Database } from "better-sqlite3";
import type { VenueResourceRepository } from "../types";

type VenueResourceRow = {
  id: string;
  venue_id: string;
  name: string;
  resource_type: VenueResource["resourceType"];
};

function rowToVenueResource(row: VenueResourceRow): VenueResource {
  return {
    id: row.id,
    venueId: row.venue_id,
    name: row.name,
    resourceType: row.resource_type,
  };
}

export class SqliteVenueResourceRepository implements VenueResourceRepository {
  constructor(private readonly db: Database) {}

  async listByVenue(venueId: string): Promise<VenueResource[]> {
    const rows = this.db
      .prepare(
        `SELECT id, venue_id, name, resource_type
         FROM venue_resources
         WHERE venue_id = ?
         ORDER BY name ASC`,
      )
      .all(venueId) as VenueResourceRow[];
    return rows.map(rowToVenueResource);
  }

  async get(id: string): Promise<VenueResource | null> {
    const row = this.db
      .prepare(
        "SELECT id, venue_id, name, resource_type FROM venue_resources WHERE id = ?",
      )
      .get(id) as VenueResourceRow | undefined;
    return row ? rowToVenueResource(row) : null;
  }

  async create(resource: VenueResource): Promise<VenueResource> {
    this.db
      .prepare(
        `INSERT INTO venue_resources (id, venue_id, name, resource_type)
         VALUES (?, ?, ?, ?)`,
      )
      .run(
        resource.id,
        resource.venueId,
        resource.name,
        resource.resourceType,
      );
    return resource;
  }

  async delete(id: string): Promise<boolean> {
    const result = this.db
      .prepare("DELETE FROM venue_resources WHERE id = ?")
      .run(id);
    return result.changes > 0;
  }

  async clear(): Promise<void> {
    this.db.prepare("DELETE FROM venue_resources").run();
  }
}
