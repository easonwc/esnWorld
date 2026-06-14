import type { Location } from "@/modules/locations/types";
import type { LocationRepository } from "../types";

export class MemoryLocationRepository implements LocationRepository {
  private readonly locations = new Map<string, Location>();

  async list(): Promise<Location[]> {
    return [...this.locations.values()].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }

  async get(id: string): Promise<Location | null> {
    return this.locations.get(id) ?? null;
  }

  async create(location: Location): Promise<Location> {
    this.locations.set(location.id, location);
    return location;
  }

  async delete(id: string): Promise<boolean> {
    return this.locations.delete(id);
  }

  async countByCountry(countryId: string): Promise<number> {
    return [...this.locations.values()].filter(
      (location) => location.countryId === countryId,
    ).length;
  }

  async sumPopulationByCountry(countryId: string): Promise<number> {
    return [...this.locations.values()]
      .filter((location) => location.countryId === countryId)
      .reduce((sum, location) => sum + location.population, 0);
  }

  async clear(): Promise<void> {
    this.locations.clear();
  }
}
