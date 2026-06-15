import type { College } from "@/modules/colleges/types";
import type { CollegeRepository } from "../types";
import { paginateArray, type ListOptions } from "@/lib/pagination";

export class MemoryCollegeRepository implements CollegeRepository {
  private readonly colleges = new Map<string, College>();

  async list(options?: ListOptions): Promise<College[]> {
    const sorted = [...this.colleges.values()].sort((a, b) => {
      const byName = a.name.localeCompare(b.name);
      if (byName !== 0) {
        return byName;
      }
      return (a.locationName ?? "").localeCompare(b.locationName ?? "");
    });
    return options ? paginateArray(sorted, options) : sorted;
  }

  async count(): Promise<number> {
    return this.colleges.size;
  }

  async listByLocation(locationId: string): Promise<College[]> {
    return [...this.colleges.values()]
      .filter((college) => college.locationId === locationId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async countByLocation(locationId: string): Promise<number> {
    return [...this.colleges.values()].filter(
      (college) => college.locationId === locationId,
    ).length;
  }

  async get(id: string): Promise<College | null> {
    return this.colleges.get(id) ?? null;
  }

  async create(college: College): Promise<College> {
    this.colleges.set(college.id, college);
    return college;
  }

  async updateLogo(id: string, logo: string): Promise<void> {
    const college = this.colleges.get(id);
    if (college) {
      this.colleges.set(id, { ...college, logo });
    }
  }

  async delete(id: string): Promise<boolean> {
    return this.colleges.delete(id);
  }

  async clear(): Promise<void> {
    this.colleges.clear();
  }
}
