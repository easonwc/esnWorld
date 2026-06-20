import { parseBoolean } from "../env";

export interface OwgrSeedConfig {
  enabled: boolean;
}

export function loadOwgrSeedConfig(
  env: NodeJS.ProcessEnv = process.env,
): OwgrSeedConfig {
  return {
    enabled: parseBoolean(env.OWGR_SEED_ON_STARTUP, false),
  };
}
