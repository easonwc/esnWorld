import type { Location } from "@/modules/locations/types";
import type { LocationRepository } from "../types";
import { paginateArray, type ListOptions } from "@/lib/pagination";

export class MemoryLocationRepository implements LocationRepository {
  private readonly locations = new Map<string, Location>();

  async list(options?: ListOptions): Promise<Location[]> {
    const sorted = [...this.locations.values()].sort((a, b) => {
      const byName = a.name.localeCompare(b.name);
      if (byName !== 0) {
        return byName;
      }
      return (a.region ?? "").localeCompare(b.region ?? "");
    });
    return options ? paginateArray(sorted, options) : sorted;
  }

  async count(): Promise<number> {
    return this.locations.size;
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

  async populationTotalsByCountry(): Promise<ReadonlyMap<string, number>> {
    const totals = new Map<string, number>();

    for (const location of this.locations.values()) {
      totals.set(
        location.countryId,
        (totals.get(location.countryId) ?? 0) + location.population,
      );
    }

    return totals;
  }

  async clear(): Promise<void> {
    this.locations.clear();
  }
}
