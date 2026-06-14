import { downloadLeagueLogo, downloadNflTeamLogo } from "@/persistence/logos/download";
import { loadNflSeedConfig } from "./config";
import { mergeSportsLeagueSeed } from "./sports-league-seed";
import type { SportsLeagueSeedCatalog } from "./sports-league-types";
import type { SportsLeagueSeedResult } from "./sports-league-types";
import {
  NFL_CONFERENCE_SEED_DATA,
  NFL_DIVISION_SEED_DATA,
  NFL_LEAGUE_SEED,
  NFL_LOCATION_SEED_DATA,
  NFL_TEAM_SEED_DATA,
} from "./nfl-teams.data";

export type { SportsLeagueSeedResult as NflSeedResult };

const NFL_CATALOG: SportsLeagueSeedCatalog = {
  league: NFL_LEAGUE_SEED,
  conferences: NFL_CONFERENCE_SEED_DATA,
  divisions: NFL_DIVISION_SEED_DATA,
  supplementalLocations: NFL_LOCATION_SEED_DATA,
  teams: NFL_TEAM_SEED_DATA,
  downloadLogo: downloadNflTeamLogo,
  downloadLeagueLogo,
};

export { venueMergeKey } from "./sports-league-seed";

export async function mergeNflSeed(
  repositories: Parameters<typeof mergeSportsLeagueSeed>[2] = {},
): Promise<SportsLeagueSeedResult> {
  return mergeSportsLeagueSeed(
    NFL_CATALOG,
    loadNflSeedConfig().enabled,
    repositories,
  );
}

const globalForNflSeed = globalThis as typeof globalThis & {
  __nflSeedApplied?: boolean;
};

export async function seedNflOnStartup(): Promise<SportsLeagueSeedResult | null> {
  if (process.env.VITEST === "true") {
    return null;
  }

  const config = loadNflSeedConfig();
  if (!config.enabled) {
    return null;
  }

  if (globalForNflSeed.__nflSeedApplied) {
    return null;
  }

  globalForNflSeed.__nflSeedApplied = true;
  return mergeNflSeed();
}
