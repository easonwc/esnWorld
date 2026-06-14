export function parseBoolean(
  value: string | undefined,
  defaultValue: boolean,
): boolean {
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

export interface AssetDownloadOptions {
  /** Bypass startup env flags (used by CLI download scripts). */
  force?: boolean;
}

export function isAssetDownloadEnabled(
  envValue: string | undefined,
  options: AssetDownloadOptions = {},
): boolean {
  if (process.env.VITEST === "true") {
    return false;
  }

  if (options.force) {
    return true;
  }

  return parseBoolean(envValue, false);
}
