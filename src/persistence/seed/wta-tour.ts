import { loadWtaTourSeedConfig } from "./tennis-config";
import { mergeTennisTourCatalogSeed } from "./tennis-tour-seed";
import type { WtaTournamentSeedEntry } from "./wta-tour.data";
import {
  DEFAULT_WTA_ACTIVE_COURT_COUNT,
  DEFAULT_WTA_DRAW_SIZE,
  WTA_TOURNAMENT_SEED_DATA,
  WTA_TOUR_SEED,
} from "./wta-tour.data";

export type WtaTourSeedResult = Awaited<ReturnType<typeof mergeWtaTourSeed>>;

export async function mergeWtaTourSeed(
  repositories: Parameters<typeof mergeTennisTourCatalogSeed>[0]["repositories"] = {},
  enabled: boolean = loadWtaTourSeedConfig().enabled,
) {
  return mergeTennisTourCatalogSeed({
    tour: WTA_TOUR_SEED,
    tournaments: WTA_TOURNAMENT_SEED_DATA,
    defaultActiveCourtCount: DEFAULT_WTA_ACTIVE_COURT_COUNT,
    defaultDrawSize: DEFAULT_WTA_DRAW_SIZE,
    defaultDurationDays: 7,
    repositories,
    enabled,
  });
}

const globalForWtaTourSeed = globalThis as typeof globalThis & {
  __wtaTourSeedApplied?: boolean;
};

export async function seedWtaTourOnStartup(): Promise<WtaTourSeedResult | null> {
  if (process.env.VITEST === "true") {
    return null;
  }

  const config = loadWtaTourSeedConfig();
  if (!config.enabled) {
    return null;
  }

  if (globalForWtaTourSeed.__wtaTourSeedApplied) {
    return null;
  }

  globalForWtaTourSeed.__wtaTourSeedApplied = true;
  return mergeWtaTourSeed();
}

export type { WtaTournamentSeedEntry };
