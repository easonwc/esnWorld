import { buildCollege } from "@/modules/colleges/transform";
import {
  getDefaultCollegeRepository,
  getDefaultLocationRepository,
  type CollegeRepository,
  type LocationRepository,
} from "@/persistence/repositories";
import { COLLEGE_SEED_DATA } from "./colleges.data";
import { locationMergeKey } from "./locations";
import type { CollegeSeedEntry, CollegeSeedResult } from "./types";
import { requireUsSeedRegion } from "./validate-us-regions";

export function collegeMergeKey(name: string): string {
  return name.trim().toLowerCase();
}

export function resolveCollegeSeedLocation<
  T extends { name: string; countryName: string; region?: string | null },
>(
  locationName: string,
  countryName: string,
  locationRegion: string | null | undefined,
  locationByKey: Map<string, T>,
): T | undefined {
  const withRegion = locationByKey.get(
    locationMergeKey(locationName, countryName, locationRegion),
  );
  if (withRegion) {
    return withRegion;
  }

  return locationByKey.get(locationMergeKey(locationName, countryName, null));
}

function buildLocationKeyMap(locations: Awaited<ReturnType<LocationRepository["list"]>>) {
  return new Map(
    locations.map((location) => [
      locationMergeKey(location.name, location.countryName, location.region),
      location,
    ]),
  );
}

export async function mergeCollegeSeed(
  collegeRepository: CollegeRepository,
  locationRepository: LocationRepository,
  entries: readonly CollegeSeedEntry[] = COLLEGE_SEED_DATA,
): Promise<CollegeSeedResult> {
  const existing = await collegeRepository.list();
  const existingKeys = new Set(
    existing.map((college) => collegeMergeKey(college.name)),
  );
  const locations = await locationRepository.list();
  const locationByKey = buildLocationKeyMap(locations);

  let added = 0;
  let skipped = 0;

  for (const entry of entries) {
    const key = collegeMergeKey(entry.name);

    if (existingKeys.has(key)) {
      skipped += 1;
      continue;
    }

    const locationRegion = requireUsSeedRegion(
      entry.countryName,
      entry.locationRegion,
      `College ${entry.name} location`,
    );

    const locationKey = locationMergeKey(
      entry.locationName,
      entry.countryName,
      locationRegion,
    );
    const location =
      locationByKey.get(locationKey) ??
      locationByKey.get(
        locationMergeKey(entry.locationName, entry.countryName, null),
      );

    if (!location) {
      throw new Error(
        `Seed location not found for college ${entry.name}: ${entry.locationName}, ${entry.locationRegion ?? ""}, ${entry.countryName}`,
      );
    }

    const college = buildCollege(
      {
        name: entry.name,
        locationId: location.id,
        attendance: entry.attendance,
      },
      crypto.randomUUID(),
      location.name,
      location.region,
    );
    await collegeRepository.create(college);
    existingKeys.add(key);
    added += 1;
  }

  return {
    enabled: true,
    added,
    skipped,
    total: entries.length,
  };
}
