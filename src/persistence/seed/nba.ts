import { downloadLeagueLogo, downloadNbaTeamLogo } from "@/persistence/logos/download";
import { getLeagueLogoPublicPath, getNbaLogoPublicPath } from "@/persistence/logos/config";
import { loadNbaSeedConfig } from "./config";
import { mergeSportsLeagueSeed } from "./sports-league-seed";
import type { SportsLeagueSeedCatalog, SportsLeagueSeedResult } from "./sports-league-types";
import {
  NBA_CONFERENCE_SEED_DATA,
  NBA_DIVISION_SEED_DATA,
  NBA_LEAGUE_SEED,
  NBA_LOCATION_SEED_DATA,
  NBA_TEAM_SEED_DATA,
} from "./nba-teams.data";

export type { SportsLeagueSeedResult as NbaSeedResult };

const NBA_CATALOG: SportsLeagueSeedCatalog = {
  league: NBA_LEAGUE_SEED,
  conferences: NBA_CONFERENCE_SEED_DATA,
  divisions: NBA_DIVISION_SEED_DATA,
  supplementalLocations: NBA_LOCATION_SEED_DATA,
  teams: NBA_TEAM_SEED_DATA,
  getTeamLogoPublicPath: getNbaLogoPublicPath,
  getLeagueLogoPublicPath: getLeagueLogoPublicPath,
  downloadLogo: downloadNbaTeamLogo,
  downloadLeagueLogo,
};

export async function mergeNbaSeed(
  repositories: Parameters<typeof mergeSportsLeagueSeed>[2] = {},
): Promise<SportsLeagueSeedResult> {
  return mergeSportsLeagueSeed(
    NBA_CATALOG,
    loadNbaSeedConfig().enabled,
    repositories,
  );
}

const globalForNbaSeed = globalThis as typeof globalThis & {
  __nbaSeedApplied?: boolean;
};

export async function seedNbaOnStartup(): Promise<SportsLeagueSeedResult | null> {
  if (process.env.VITEST === "true") {
    return null;
  }

  const config = loadNbaSeedConfig();
  if (!config.enabled) {
    return null;
  }

  if (globalForNbaSeed.__nbaSeedApplied) {
    return null;
  }

  globalForNbaSeed.__nbaSeedApplied = true;
  return mergeNbaSeed();
}
