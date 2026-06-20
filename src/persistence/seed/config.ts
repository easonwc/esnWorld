import { parseBoolean } from "../env";

export interface LocationSeedConfig {
  enabled: boolean;
}

export interface NflSeedConfig {
  enabled: boolean;
}

export interface MlbSeedConfig {
  enabled: boolean;
}

export interface NbaSeedConfig {
  enabled: boolean;
}

export interface NhlSeedConfig {
  enabled: boolean;
}

export interface MlsSeedConfig {
  enabled: boolean;
}

export interface WnbaSeedConfig {
  enabled: boolean;
}

export interface TennisVenueSeedConfig {
  enabled: boolean;
}

export interface GolfVenueSeedConfig {
  enabled: boolean;
}

/** @deprecated Use TennisVenueSeedConfig or GolfVenueSeedConfig */
export type TennisGolfVenueSeedConfig = TennisVenueSeedConfig;

function legacyTennisGolfVenuesEnabled(env: NodeJS.ProcessEnv): boolean {
  return parseBoolean(env.TENNIS_GOLF_VENUES_SEED_ON_STARTUP, false);
}

export function loadTennisVenueSeedConfig(
  env: NodeJS.ProcessEnv = process.env,
): TennisVenueSeedConfig {
  return {
    enabled:
      parseBoolean(env.TENNIS_VENUES_SEED_ON_STARTUP, false) ||
      legacyTennisGolfVenuesEnabled(env),
  };
}

export function loadGolfVenueSeedConfig(
  env: NodeJS.ProcessEnv = process.env,
): GolfVenueSeedConfig {
  return {
    enabled:
      parseBoolean(env.GOLF_VENUES_SEED_ON_STARTUP, false) ||
      legacyTennisGolfVenuesEnabled(env),
  };
}

/** @deprecated Use loadTennisVenueSeedConfig or loadGolfVenueSeedConfig */
export function loadTennisGolfVenueSeedConfig(
  env: NodeJS.ProcessEnv = process.env,
): TennisVenueSeedConfig {
  return loadTennisVenueSeedConfig(env);
}

export function loadLocationSeedConfig(
  env: NodeJS.ProcessEnv = process.env,
): LocationSeedConfig {
  return {
    enabled: parseBoolean(env.LOCATIONS_SEED_ON_STARTUP, false),
  };
}

export function loadNflSeedConfig(
  env: NodeJS.ProcessEnv = process.env,
): NflSeedConfig {
  return {
    enabled: parseBoolean(env.NFL_SEED_ON_STARTUP, false),
  };
}

export function loadMlbSeedConfig(
  env: NodeJS.ProcessEnv = process.env,
): MlbSeedConfig {
  return {
    enabled: parseBoolean(env.MLB_SEED_ON_STARTUP, false),
  };
}

export function loadNbaSeedConfig(
  env: NodeJS.ProcessEnv = process.env,
): NbaSeedConfig {
  return {
    enabled: parseBoolean(env.NBA_SEED_ON_STARTUP, false),
  };
}

export function loadNhlSeedConfig(
  env: NodeJS.ProcessEnv = process.env,
): NhlSeedConfig {
  return {
    enabled: parseBoolean(env.NHL_SEED_ON_STARTUP, false),
  };
}

export function loadMlsSeedConfig(
  env: NodeJS.ProcessEnv = process.env,
): MlsSeedConfig {
  return {
    enabled: parseBoolean(env.MLS_SEED_ON_STARTUP, false),
  };
}

export function loadWnbaSeedConfig(
  env: NodeJS.ProcessEnv = process.env,
): WnbaSeedConfig {
  return {
    enabled: parseBoolean(env.WNBA_SEED_ON_STARTUP, false),
  };
}

