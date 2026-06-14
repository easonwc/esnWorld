import { buildLocation } from "@/modules/locations/transform";
import {
  getDefaultCollegeRepository,
  getDefaultCountryRepository,
  getDefaultLocationRepository,
  type CountryRepository,
  type LocationRepository,
} from "@/persistence/repositories";
import { loadLocationSeedConfig } from "./config";
import { mergeCollegeSeed } from "./colleges";
import { mergeCountrySeed } from "./countries";
import { LOCATION_SEED_DATA } from "./locations.data";
import type { LocationSeedEntry, LocationSeedResult, WorldSeedResult } from "./types";

export function locationMergeKey(
  name: string,
  countryName: string,
  region?: string | null,
): string {
  const normalizedRegion = region?.trim().toLowerCase() ?? "";
  return `${name.trim().toLowerCase()}|${normalizedRegion}|${countryName.trim().toLowerCase()}`;
}

export async function mergeLocationSeed(
  locationRepository: LocationRepository,
  countryRepository: CountryRepository,
  entries: readonly LocationSeedEntry[] = LOCATION_SEED_DATA,
): Promise<LocationSeedResult> {
  const existing = await locationRepository.list();
  const existingKeys = new Set(
    existing.map((location) =>
      locationMergeKey(location.name, location.countryName, location.region),
    ),
  );

  let added = 0;
  let skipped = 0;

  for (const entry of entries) {
    const key = locationMergeKey(entry.name, entry.countryName, entry.region);

    if (existingKeys.has(key)) {
      skipped += 1;
      continue;
    }

    const country = await countryRepository.getByName(entry.countryName);
    if (!country) {
      throw new Error(
        `Seed country not found for location ${entry.name}: ${entry.countryName}`,
      );
    }

    const location = buildLocation(
      {
        name: entry.name,
        countryId: country.id,
        region: entry.region ?? null,
        latitude: entry.latitude,
        longitude: entry.longitude,
        timezone: entry.timezone,
        population: entry.population,
      },
      crypto.randomUUID(),
      country.name,
    );
    await locationRepository.create(location);
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

const globalForSeed = globalThis as typeof globalThis & {
  __worldSeedApplied?: boolean;
};

export async function seedWorldOnStartup(): Promise<WorldSeedResult | null> {
  if (process.env.VITEST === "true") {
    return null;
  }

  const config = loadLocationSeedConfig();
  if (!config.enabled) {
    return null;
  }

  if (globalForSeed.__worldSeedApplied) {
    return null;
  }

  globalForSeed.__worldSeedApplied = true;

  const countryRepository = getDefaultCountryRepository();
  const locationRepository = getDefaultLocationRepository();

  const countries = await mergeCountrySeed(countryRepository);
  const locations = await mergeLocationSeed(
    locationRepository,
    countryRepository,
  );
  const colleges = await mergeCollegeSeed(
    getDefaultCollegeRepository(),
    locationRepository,
  );

  if (countries.added > 0 || countries.skipped > 0) {
    console.info(
      `[countries seed] merged ${countries.added} new, skipped ${countries.skipped} existing (${countries.total} in catalog)`,
    );
  }

  if (locations.added > 0 || locations.skipped > 0) {
    console.info(
      `[locations seed] merged ${locations.added} new, skipped ${locations.skipped} existing (${locations.total} in catalog)`,
    );
  }

  if (colleges.added > 0 || colleges.skipped > 0) {
    console.info(
      `[colleges seed] merged ${colleges.added} new, skipped ${colleges.skipped} existing (${colleges.total} in catalog)`,
    );
  }

  return { countries, locations, colleges };
}

/** @deprecated Use seedWorldOnStartup */
export async function seedLocationsOnStartup(): Promise<LocationSeedResult | null> {
  const result = await seedWorldOnStartup();
  return result?.locations ?? null;
}
