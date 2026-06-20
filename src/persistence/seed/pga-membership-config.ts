import { parseBoolean, parseNonNegativeInt } from "../env";

export interface PgaMembershipSeedConfig {
  enabled: boolean;
  memberCount: number;
}

export function loadPgaMembershipSeedConfig(
  env: NodeJS.ProcessEnv = process.env,
): PgaMembershipSeedConfig {
  return {
    enabled: parseBoolean(env.PGA_MEMBERSHIP_SEED_ON_STARTUP, false),
    memberCount: parseNonNegativeInt(env.PGA_MEMBERSHIP_COUNT, 175),
  };
}
