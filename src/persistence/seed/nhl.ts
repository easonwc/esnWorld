import { downloadLeagueLogo, downloadNhlTeamLogo } from "@/persistence/logos/download";
import { getLeagueLogoPublicPath, getNhlLogoPublicPath } from "@/persistence/logos/config";
import { loadNhlSeedConfig } from "./config";
import { mergeSportsLeagueSeed } from "./sports-league-seed";
import type { SportsLeagueSeedCatalog, SportsLeagueSeedResult } from "./sports-league-types";
import {
  NHL_CONFERENCE_SEED_DATA,
  NHL_DIVISION_SEED_DATA,
  NHL_LEAGUE_SEED,
  NHL_LOCATION_SEED_DATA,
  NHL_TEAM_SEED_DATA,
} from "./nhl-teams.data";

export type { SportsLeagueSeedResult as NhlSeedResult };

const NHL_CATALOG: SportsLeagueSeedCatalog = {
  league: NHL_LEAGUE_SEED,
  conferences: NHL_CONFERENCE_SEED_DATA,
  divisions: NHL_DIVISION_SEED_DATA,
  supplementalLocations: NHL_LOCATION_SEED_DATA,
  teams: NHL_TEAM_SEED_DATA,
  getTeamLogoPublicPath: getNhlLogoPublicPath,
  getLeagueLogoPublicPath: getLeagueLogoPublicPath,
  downloadLogo: downloadNhlTeamLogo,
  downloadLeagueLogo,
};

export async function mergeNhlSeed(
  repositories: Parameters<typeof mergeSportsLeagueSeed>[2] = {},
): Promise<SportsLeagueSeedResult> {
  return mergeSportsLeagueSeed(
    NHL_CATALOG,
    loadNhlSeedConfig().enabled,
    repositories,
  );
}

const globalForNhlSeed = globalThis as typeof globalThis & {
  __nhlSeedApplied?: boolean;
};

export async function seedNhlOnStartup(): Promise<SportsLeagueSeedResult | null> {
  if (process.env.VITEST === "true") {
    return null;
  }

  const config = loadNhlSeedConfig();
  if (!config.enabled) {
    return null;
  }

  if (globalForNhlSeed.__nhlSeedApplied) {
    return null;
  }

  globalForNhlSeed.__nhlSeedApplied = true;
  return mergeNhlSeed();
}
