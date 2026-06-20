import { loadPgaTourSeedConfig } from "./golf-config";
import { mergeGolfTourCatalogSeed } from "./golf-tour-seed";
import type { PgaTournamentSeedEntry } from "./pga-tour.data";
import {
  DEFAULT_PGA_FIELD_SIZE,
  DEFAULT_PGA_TEE_GROUP_COUNT,
  PGA_TOURNAMENT_SEED_DATA,
  PGA_TOUR_SEED,
} from "./pga-tour.data";

export type PgaTourSeedResult = Awaited<ReturnType<typeof mergePgaTourSeed>>;

export async function mergePgaTourSeed(
  repositories: Parameters<typeof mergeGolfTourCatalogSeed>[0]["repositories"] = {},
  enabled: boolean = loadPgaTourSeedConfig().enabled,
) {
  return mergeGolfTourCatalogSeed({
    tour: PGA_TOUR_SEED,
    tournaments: PGA_TOURNAMENT_SEED_DATA,
    defaultTeeGroupCount: DEFAULT_PGA_TEE_GROUP_COUNT,
    defaultFieldSize: DEFAULT_PGA_FIELD_SIZE,
    repositories,
    enabled,
  });
}

const globalForPgaTourSeed = globalThis as typeof globalThis & {
  __pgaTourSeedApplied?: boolean;
};

export async function seedPgaTourOnStartup(): Promise<PgaTourSeedResult | null> {
  if (process.env.VITEST === "true") {
    return null;
  }

  const config = loadPgaTourSeedConfig();
  if (!config.enabled) {
    return null;
  }

  if (globalForPgaTourSeed.__pgaTourSeedApplied) {
    return null;
  }

  globalForPgaTourSeed.__pgaTourSeedApplied = true;
  return mergePgaTourSeed();
}

export type { PgaTournamentSeedEntry };
