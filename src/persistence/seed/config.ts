export interface LocationSeedConfig {
  enabled: boolean;
}

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value.trim() === "") {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return defaultValue;
}

export function loadLocationSeedConfig(
  env: NodeJS.ProcessEnv = process.env,
): LocationSeedConfig {
  return {
    enabled: parseBoolean(env.LOCATIONS_SEED_ON_STARTUP, false),
  };
}
