import { loadTennisVenueSeedConfig } from "./config";
import {
  mergeMultiResourceVenueSeed,
  type MultiResourceVenueSeedResult,
} from "./multi-resource-venue-seed";
import {
  resourcesForTennisVenue,
  type TennisVenueSeedEntry,
} from "./tennis-venue-types";
import { TENNIS_VENUE_SEED_DATA } from "./tennis-venues.data";

export type TennisVenueSeedResult = MultiResourceVenueSeedResult;

export async function mergeTennisVenueSeed(
  repositories: Parameters<typeof mergeMultiResourceVenueSeed>[2] = {},
  enabled: boolean = loadTennisVenueSeedConfig().enabled,
): Promise<TennisVenueSeedResult> {
  return mergeMultiResourceVenueSeed(
    TENNIS_VENUE_SEED_DATA,
    (entry) => resourcesForTennisVenue(entry as TennisVenueSeedEntry),
    repositories,
    enabled,
  );
}

const globalForTennisVenueSeed = globalThis as typeof globalThis & {
  __tennisVenueSeedApplied?: boolean;
};

export async function seedTennisVenuesOnStartup(): Promise<TennisVenueSeedResult | null> {
  if (process.env.VITEST === "true") {
    return null;
  }

  const config = loadTennisVenueSeedConfig();
  if (!config.enabled) {
    return null;
  }

  if (globalForTennisVenueSeed.__tennisVenueSeedApplied) {
    return null;
  }

  globalForTennisVenueSeed.__tennisVenueSeedApplied = true;
  return mergeTennisVenueSeed();
}
