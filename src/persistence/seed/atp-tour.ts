import { loadAtpTourSeedConfig } from "./tennis-config";
import { mergeTennisTourCatalogSeed } from "./tennis-tour-seed";
import type { AtpTournamentSeedEntry } from "./atp-tour.data";
import {
  ATP_TOURNAMENT_SEED_DATA,
  ATP_TOUR_SEED,
  DEFAULT_ATP_ACTIVE_COURT_COUNT,
  DEFAULT_ATP_DRAW_SIZE,
} from "./atp-tour.data";

export type AtpTourSeedResult = Awaited<ReturnType<typeof mergeAtpTourSeed>>;

export async function mergeAtpTourSeed(
  repositories: Parameters<typeof mergeTennisTourCatalogSeed>[0]["repositories"] = {},
  enabled: boolean = loadAtpTourSeedConfig().enabled,
) {
  return mergeTennisTourCatalogSeed({
    tour: ATP_TOUR_SEED,
    tournaments: ATP_TOURNAMENT_SEED_DATA,
    defaultActiveCourtCount: DEFAULT_ATP_ACTIVE_COURT_COUNT,
    defaultDrawSize: DEFAULT_ATP_DRAW_SIZE,
    defaultDurationDays: 7,
    repositories,
    enabled,
  });
}

const globalForAtpTourSeed = globalThis as typeof globalThis & {
  __atpTourSeedApplied?: boolean;
};

export async function seedAtpTourOnStartup(): Promise<AtpTourSeedResult | null> {
  if (process.env.VITEST === "true") {
    return null;
  }

  const config = loadAtpTourSeedConfig();
  if (!config.enabled) {
    return null;
  }

  if (globalForAtpTourSeed.__atpTourSeedApplied) {
    return null;
  }

  globalForAtpTourSeed.__atpTourSeedApplied = true;
  return mergeAtpTourSeed();
}

export type { AtpTournamentSeedEntry };
