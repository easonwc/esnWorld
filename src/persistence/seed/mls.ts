import { downloadLeagueLogo, downloadMlsTeamLogo } from "@/persistence/logos/download";
import { loadMlsSeedConfig } from "./config";
import { mergeSportsLeagueSeed } from "./sports-league-seed";
import type { SportsLeagueSeedCatalog, SportsLeagueSeedResult } from "./sports-league-types";
import {
  MLS_CONFERENCE_SEED_DATA,
  MLS_DIVISION_SEED_DATA,
  MLS_LEAGUE_SEED,
  MLS_LOCATION_SEED_DATA,
  MLS_TEAM_SEED_DATA,
} from "./mls-teams.data";

export type { SportsLeagueSeedResult as MlsSeedResult };

const MLS_CATALOG: SportsLeagueSeedCatalog = {
  league: MLS_LEAGUE_SEED,
  conferences: MLS_CONFERENCE_SEED_DATA,
  divisions: MLS_DIVISION_SEED_DATA,
  supplementalLocations: MLS_LOCATION_SEED_DATA,
  teams: MLS_TEAM_SEED_DATA,
  downloadLogo: downloadMlsTeamLogo,
  downloadLeagueLogo,
};

export async function mergeMlsSeed(
  repositories: Parameters<typeof mergeSportsLeagueSeed>[2] = {},
): Promise<SportsLeagueSeedResult> {
  return mergeSportsLeagueSeed(
    MLS_CATALOG,
    loadMlsSeedConfig().enabled,
    repositories,
  );
}

const globalForMlsSeed = globalThis as typeof globalThis & {
  __mlsSeedApplied?: boolean;
};

export async function seedMlsOnStartup(): Promise<SportsLeagueSeedResult | null> {
  if (process.env.VITEST === "true") {
    return null;
  }

  const config = loadMlsSeedConfig();
  if (!config.enabled) {
    return null;
  }

  if (globalForMlsSeed.__mlsSeedApplied) {
    return null;
  }

  globalForMlsSeed.__mlsSeedApplied = true;
  return mergeMlsSeed();
}
