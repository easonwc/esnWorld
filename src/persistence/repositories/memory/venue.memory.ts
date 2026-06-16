import type { Venue } from "@/modules/venues/types";
import type { VenueRepository } from "../types";
import { paginateArray, type ListOptions } from "@/lib/pagination";

export class MemoryVenueRepository implements VenueRepository {
  private readonly venues = new Map<string, Venue>();

  async list(options?: ListOptions): Promise<Venue[]> {
    const sorted = [...this.venues.values()].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    return options ? paginateArray(sorted, options) : sorted;
  }

  async count(): Promise<number> {
    return this.venues.size;
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
    const record: Venue = {
      ...venue,
      schedulingMode: venue.schedulingMode ?? "exclusive",
    };
    this.venues.set(record.id, record);
    return record;
  }

  async delete(id: string): Promise<boolean> {
    return this.venues.delete(id);
  }

  async clear(): Promise<void> {
    this.venues.clear();
  }
}
