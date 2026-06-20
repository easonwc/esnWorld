import { parseBoolean, parseNonNegativeInt } from "../env";

export interface GenderCountSeedConfig {
  enabled: boolean;
  maleCount: number;
  femaleCount: number;
  baseSeed: number;
}

function loadGenderCountSeedConfig(
  env: NodeJS.ProcessEnv,
  enabledKey: string,
  maleCountKey: string,
  femaleCountKey: string,
  defaults: { maleCount: number; femaleCount: number },
): GenderCountSeedConfig {
  return {
    enabled: parseBoolean(env[enabledKey], false),
    maleCount: parseNonNegativeInt(env[maleCountKey], defaults.maleCount),
    femaleCount: parseNonNegativeInt(env[femaleCountKey], defaults.femaleCount),
    baseSeed: parseNonNegativeInt(env.ATHLETES_SEED, 42),
  };
}

export function loadGolfersSeedConfig(
  env: NodeJS.ProcessEnv = process.env,
): GenderCountSeedConfig {
  return loadGenderCountSeedConfig(
    env,
    "GOLFERS_SEED_ON_STARTUP",
    "GOLFERS_SEED_MALE_COUNT",
    "GOLFERS_SEED_FEMALE_COUNT",
    { maleCount: 200, femaleCount: 144 },
  );
}

export function loadTennisPlayersSeedConfig(
  env: NodeJS.ProcessEnv = process.env,
): GenderCountSeedConfig {
  return loadGenderCountSeedConfig(
    env,
    "TENNIS_PLAYERS_SEED_ON_STARTUP",
    "TENNIS_PLAYERS_SEED_MALE_COUNT",
    "TENNIS_PLAYERS_SEED_FEMALE_COUNT",
    { maleCount: 128, femaleCount: 128 },
  );
}
