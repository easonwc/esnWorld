import path from "node:path";
import { isAssetDownloadEnabled } from "../env";

export const FLAG_CDN_BASE = "https://flagcdn.com";

export function getFlagsDirectory(): string {
  return path.resolve(process.cwd(), "public", "flags");
}

export function getFlagPublicPath(isoCode: string): string {
  return `/flags/${isoCode.trim().toLowerCase()}.svg`;
}

export function getFlagFilePath(isoCode: string): string {
  return path.join(getFlagsDirectory(), `${isoCode.trim().toLowerCase()}.svg`);
}

export function shouldDownloadFlags(
  options: { force?: boolean } = {},
): boolean {
  return isAssetDownloadEnabled(
    process.env.FLAG_DOWNLOAD_ON_STARTUP,
    options,
  );
}
