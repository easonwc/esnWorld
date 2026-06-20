import { loadGolfVenueSeedConfig } from "./config";
import {
  resourcesForGolfVenue,
  type GolfVenueSeedEntry,
} from "./golf-venue-types";
import { GOLF_VENUE_SEED_DATA } from "./golf-venues.data";
import {
  mergeMultiResourceVenueSeed,
  type MultiResourceVenueSeedResult,
} from "./multi-resource-venue-seed";

export type GolfVenueSeedResult = MultiResourceVenueSeedResult;

export async function mergeGolfVenueSeed(
  repositories: Parameters<typeof mergeMultiResourceVenueSeed>[2] = {},
  enabled: boolean = loadGolfVenueSeedConfig().enabled,
  catalog: readonly GolfVenueSeedEntry[] = GOLF_VENUE_SEED_DATA,
): Promise<GolfVenueSeedResult> {
  return mergeMultiResourceVenueSeed(
    catalog,
    (entry) => resourcesForGolfVenue(entry as GolfVenueSeedEntry),
    repositories,
    enabled,
  );
}

const globalForGolfVenueSeed = globalThis as typeof globalThis & {
  __golfVenueSeedApplied?: boolean;
};

export async function seedGolfVenuesOnStartup(): Promise<GolfVenueSeedResult | null> {
  if (process.env.VITEST === "true") {
    return null;
  }

  const config = loadGolfVenueSeedConfig();
  if (!config.enabled) {
    return null;
  }

  if (globalForGolfVenueSeed.__golfVenueSeedApplied) {
    return null;
  }

  globalForGolfVenueSeed.__golfVenueSeedApplied = true;
  return mergeGolfVenueSeed();
}
