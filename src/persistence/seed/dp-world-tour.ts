import { loadDpWorldTourSeedConfig } from "./golf-config";
import { mergeGolfTourCatalogSeed } from "./golf-tour-seed";
import { DP_WORLD_LOCATION_SEED_DATA } from "./dp-world-locations.data";
import {
  DEFAULT_DP_WORLD_FIELD_SIZE,
  DEFAULT_DP_WORLD_TEE_GROUP_COUNT,
  DP_WORLD_TOURNAMENT_SEED_DATA,
  DP_WORLD_TOUR_SEED,
} from "./dp-world-tour.data";
import { DP_WORLD_VENUE_SEED_DATA } from "./dp-world-venues.data";

export type DpWorldTourSeedResult = Awaited<
  ReturnType<typeof mergeDpWorldTourSeed>
>;

export async function mergeDpWorldTourSeed(
  repositories: Parameters<typeof mergeGolfTourCatalogSeed>[0]["repositories"] = {},
  enabled: boolean = loadDpWorldTourSeedConfig().enabled,
) {
  return mergeGolfTourCatalogSeed({
    tour: DP_WORLD_TOUR_SEED,
    tournaments: DP_WORLD_TOURNAMENT_SEED_DATA,
    defaultTeeGroupCount: DEFAULT_DP_WORLD_TEE_GROUP_COUNT,
    defaultFieldSize: DEFAULT_DP_WORLD_FIELD_SIZE,
    supplementalLocations: DP_WORLD_LOCATION_SEED_DATA,
    supplementalVenues: DP_WORLD_VENUE_SEED_DATA,
    repositories,
    enabled,
  });
}

const globalForDpWorldTourSeed = globalThis as typeof globalThis & {
  __dpWorldTourSeedApplied?: boolean;
};

export async function seedDpWorldTourOnStartup(): Promise<DpWorldTourSeedResult | null> {
  if (process.env.VITEST === "true") {
    return null;
  }

  const config = loadDpWorldTourSeedConfig();
  if (!config.enabled) {
    return null;
  }

  if (globalForDpWorldTourSeed.__dpWorldTourSeedApplied) {
    return null;
  }

  globalForDpWorldTourSeed.__dpWorldTourSeedApplied = true;
  return mergeDpWorldTourSeed();
}
