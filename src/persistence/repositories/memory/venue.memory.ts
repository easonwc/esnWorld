import type { Venue } from "@/modules/venues/types";
import type { VenueRepository } from "../types";

export class MemoryVenueRepository implements VenueRepository {
  private readonly venues = new Map<string, Venue>();

  async list(): Promise<Venue[]> {
    return [...this.venues.values()].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }

  async listByLocation(locationId: string): Promise<Venue[]> {
    return [...this.venues.values()]
      .filter((venue) => venue.locationId === locationId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async countByLocation(locationId: string): Promise<number> {
    return [...this.venues.values()].filter(
      (venue) => venue.locationId === locationId,
    ).length;
  }

  async get(id: string): Promise<Venue | null> {
    return this.venues.get(id) ?? null;
  }

  async create(venue: Venue): Promise<Venue> {
    this.venues.set(venue.id, venue);
    return venue;
  }

  async delete(id: string): Promise<boolean> {
    return this.venues.delete(id);
  }

  async clear(): Promise<void> {
    this.venues.clear();
  }
}
