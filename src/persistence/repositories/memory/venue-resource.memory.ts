import type { VenueResource } from "@/modules/venues/types";
import type { VenueResourceRepository } from "../types";

export class MemoryVenueResourceRepository implements VenueResourceRepository {
  private readonly resources = new Map<string, VenueResource>();

  async listByVenue(venueId: string): Promise<VenueResource[]> {
    return [...this.resources.values()]
      .filter((resource) => resource.venueId === venueId)
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  async get(id: string): Promise<VenueResource | null> {
    return this.resources.get(id) ?? null;
  }

  async create(resource: VenueResource): Promise<VenueResource> {
    this.resources.set(resource.id, resource);
    return resource;
  }

  async delete(id: string): Promise<boolean> {
    return this.resources.delete(id);
  }

  async clear(): Promise<void> {
    this.resources.clear();
  }
}
