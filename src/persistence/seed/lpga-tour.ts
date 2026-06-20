import { loadLpgaTourSeedConfig } from "./golf-config";
import { mergeGolfTourCatalogSeed } from "./golf-tour-seed";
import { LPGA_LOCATION_SEED_DATA } from "./lpga-locations.data";
import {
  DEFAULT_LPGA_FIELD_SIZE,
  DEFAULT_LPGA_TEE_GROUP_COUNT,
  LPGA_TOURNAMENT_SEED_DATA,
  LPGA_TOUR_SEED,
} from "./lpga-tour.data";
import { LPGA_VENUE_SEED_DATA } from "./lpga-venues.data";

export type LpgaTourSeedResult = Awaited<ReturnType<typeof mergeLpgaTourSeed>>;

export async function mergeLpgaTourSeed(
  repositories: Parameters<typeof mergeGolfTourCatalogSeed>[0]["repositories"] = {},
  enabled: boolean = loadLpgaTourSeedConfig().enabled,
) {
  return mergeGolfTourCatalogSeed({
    tour: LPGA_TOUR_SEED,
    tournaments: LPGA_TOURNAMENT_SEED_DATA,
    defaultTeeGroupCount: DEFAULT_LPGA_TEE_GROUP_COUNT,
    defaultFieldSize: DEFAULT_LPGA_FIELD_SIZE,
    supplementalLocations: LPGA_LOCATION_SEED_DATA,
    supplementalVenues: LPGA_VENUE_SEED_DATA,
    repositories,
    enabled,
  });
}

const globalForLpgaTourSeed = globalThis as typeof globalThis & {
  __lpgaTourSeedApplied?: boolean;
};

export async function seedLpgaTourOnStartup(): Promise<LpgaTourSeedResult | null> {
  if (process.env.VITEST === "true") {
    return null;
  }

  const config = loadLpgaTourSeedConfig();
  if (!config.enabled) {
    return null;
  }

  if (globalForLpgaTourSeed.__lpgaTourSeedApplied) {
    return null;
  }

  globalForLpgaTourSeed.__lpgaTourSeedApplied = true;
  return mergeLpgaTourSeed();
}
