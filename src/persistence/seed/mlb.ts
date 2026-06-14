import { downloadLeagueLogo, downloadMlbTeamLogo } from "@/persistence/logos/download";
import { loadMlbSeedConfig } from "./config";
import { mergeSportsLeagueSeed } from "./sports-league-seed";
import type { SportsLeagueSeedCatalog, SportsLeagueSeedResult } from "./sports-league-types";
import {
  MLB_CONFERENCE_SEED_DATA,
  MLB_DIVISION_SEED_DATA,
  MLB_LEAGUE_SEED,
  MLB_LOCATION_SEED_DATA,
  MLB_TEAM_SEED_DATA,
} from "./mlb-teams.data";

export type { SportsLeagueSeedResult as MlbSeedResult };

const MLB_CATALOG: SportsLeagueSeedCatalog = {
  league: MLB_LEAGUE_SEED,
  conferences: MLB_CONFERENCE_SEED_DATA,
  divisions: MLB_DIVISION_SEED_DATA,
  supplementalLocations: MLB_LOCATION_SEED_DATA,
  teams: MLB_TEAM_SEED_DATA,
  downloadLogo: downloadMlbTeamLogo,
  downloadLeagueLogo,
};

export async function mergeMlbSeed(
  repositories: Parameters<typeof mergeSportsLeagueSeed>[2] = {},
): Promise<SportsLeagueSeedResult> {
  return mergeSportsLeagueSeed(
    MLB_CATALOG,
    loadMlbSeedConfig().enabled,
    repositories,
  );
}

const globalForMlbSeed = globalThis as typeof globalThis & {
  __mlbSeedApplied?: boolean;
};

export async function seedMlbOnStartup(): Promise<SportsLeagueSeedResult | null> {
  if (process.env.VITEST === "true") {
    return null;
  }

  const config = loadMlbSeedConfig();
  if (!config.enabled) {
    return null;
  }

  if (globalForMlbSeed.__mlbSeedApplied) {
    return null;
  }

  globalForMlbSeed.__mlbSeedApplied = true;
  return mergeMlbSeed();
}
