import type { CountryRecord } from "../types";
import type { CountryRepository } from "../types";

export class MemoryCountryRepository implements CountryRepository {
  private readonly countries = new Map<string, CountryRecord>();

  async list(): Promise<CountryRecord[]> {
    return [...this.countries.values()].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }

  async get(id: string): Promise<CountryRecord | null> {
    return this.countries.get(id) ?? null;
  }

  async getByName(name: string): Promise<CountryRecord | null> {
    const normalized = name.trim().toLowerCase();
    return (
      [...this.countries.values()].find(
        (country) => country.name.toLowerCase() === normalized,
      ) ?? null
    );
  }

  async create(country: CountryRecord): Promise<CountryRecord> {
    this.countries.set(country.id, country);
    return country;
  }

  async updateFlag(id: string, flag: string): Promise<void> {
    const country = this.countries.get(id);
    if (country) {
      this.countries.set(id, { ...country, flag });
    }
  }

  async delete(id: string): Promise<boolean> {
    return this.countries.delete(id);
  }

  async clear(): Promise<void> {
    this.countries.clear();
  }
}
