import { downloadLeagueLogo, downloadWnbaTeamLogo } from "@/persistence/logos/download";
import { getLeagueLogoPublicPath, getWnbaLogoPublicPath } from "@/persistence/logos/config";
import { loadWnbaSeedConfig } from "./config";
import { mergeSportsLeagueSeed } from "./sports-league-seed";
import type { SportsLeagueSeedCatalog, SportsLeagueSeedResult } from "./sports-league-types";
import {
  WNBA_CONFERENCE_SEED_DATA,
  WNBA_DIVISION_SEED_DATA,
  WNBA_LEAGUE_SEED,
  WNBA_LOCATION_SEED_DATA,
  WNBA_TEAM_SEED_DATA,
} from "./wnba-teams.data";

export type { SportsLeagueSeedResult as WnbaSeedResult };

const WNBA_CATALOG: SportsLeagueSeedCatalog = {
  league: WNBA_LEAGUE_SEED,
  conferences: WNBA_CONFERENCE_SEED_DATA,
  divisions: WNBA_DIVISION_SEED_DATA,
  supplementalLocations: WNBA_LOCATION_SEED_DATA,
  teams: WNBA_TEAM_SEED_DATA,
  getTeamLogoPublicPath: getWnbaLogoPublicPath,
  getLeagueLogoPublicPath: getLeagueLogoPublicPath,
  downloadLogo: downloadWnbaTeamLogo,
  downloadLeagueLogo,
};

export async function mergeWnbaSeed(
  repositories: Parameters<typeof mergeSportsLeagueSeed>[2] = {},
): Promise<SportsLeagueSeedResult> {
  return mergeSportsLeagueSeed(
    WNBA_CATALOG,
    loadWnbaSeedConfig().enabled,
    repositories,
  );
}

const globalForWnbaSeed = globalThis as typeof globalThis & {
  __wnbaSeedApplied?: boolean;
};

export async function seedWnbaOnStartup(): Promise<SportsLeagueSeedResult | null> {
  if (process.env.VITEST === "true") {
    return null;
  }

  const config = loadWnbaSeedConfig();
  if (!config.enabled) {
    return null;
  }

  if (globalForWnbaSeed.__wnbaSeedApplied) {
    return null;
  }

  globalForWnbaSeed.__wnbaSeedApplied = true;
  return mergeWnbaSeed();
}
