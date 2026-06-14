import path from "node:path";

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

export function shouldDownloadFlags(): boolean {
  return process.env.VITEST !== "true" && process.env.SKIP_FLAG_DOWNLOAD !== "true";
}
