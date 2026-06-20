import path from "node:path";
import { isAssetDownloadEnabled, type AssetDownloadOptions } from "../env";

export const NFL_LOGO_CDN_BASE =
  "https://static.www.nfl.com/image/upload/league/api/clubs/logos";

export const MLB_LOGO_CDN_BASE =
  "https://a.espncdn.com/i/teamlogos/mlb/500";

export const NBA_LOGO_CDN_BASE =
  "https://a.espncdn.com/i/teamlogos/nba/500";

/** ESPN filename overrides when it differs from our team abbreviation. */
export const NBA_LOGO_CDN_ALIASES: Record<string, string> = {
  NOP: "NO",
  UTA: "UTAH",
};

export function getNbaLogoCdnAbbreviation(abbreviation: string): string {
  const normalized = abbreviation.trim().toUpperCase();
  return NBA_LOGO_CDN_ALIASES[normalized] ?? normalized;
}

export const NHL_LOGO_CDN_BASE =
  "https://a.espncdn.com/i/teamlogos/nhl/500";

/** ESPN filename overrides when it differs from our team abbreviation. */
export const NHL_LOGO_CDN_ALIASES: Record<string, string> = {
  LAK: "LA",
  SJS: "SJ",
  TBL: "TB",
};

export function getNhlLogoCdnAbbreviation(abbreviation: string): string {
  const normalized = abbreviation.trim().toUpperCase();
  return NHL_LOGO_CDN_ALIASES[normalized] ?? normalized;
}

export const MLS_LOGO_CDN_BASE =
  "https://images.mlssoccer.com/image/upload/v1614296970/assets/logos";

export const WNBA_LOGO_CDN_BASE =
  "https://a.espncdn.com/i/teamlogos/wnba/500";

export const LEAGUE_LOGO_CDN_BASE =
  "https://a.espncdn.com/i/teamlogos/leagues/500";

export const NCAA_COLLEGE_LOGO_CDN_BASE =
  "https://a.espncdn.com/i/teamlogos/ncaa/500";

export function getNflLogosDirectory(): string {
  return path.resolve(process.cwd(), "public", "logos", "nfl");
}

export function getMlbLogosDirectory(): string {
  return path.resolve(process.cwd(), "public", "logos", "mlb");
}

export function getNbaLogosDirectory(): string {
  return path.resolve(process.cwd(), "public", "logos", "nba");
}

export function getNhlLogosDirectory(): string {
  return path.resolve(process.cwd(), "public", "logos", "nhl");
}

export function getMlsLogosDirectory(): string {
  return path.resolve(process.cwd(), "public", "logos", "mls");
}

export function getWnbaLogosDirectory(): string {
  return path.resolve(process.cwd(), "public", "logos", "wnba");
}

export function getLeagueLogosDirectory(): string {
  return path.resolve(process.cwd(), "public", "logos", "leagues");
}

export function getNcaaCollegeLogosDirectory(): string {
  return path.resolve(process.cwd(), "public", "logos", "ncaa");
}

export function getNflLogoPublicPath(abbreviation: string): string {
  return `/logos/nfl/${abbreviation.trim().toLowerCase()}.png`;
}

export function getMlbLogoPublicPath(abbreviation: string): string {
  return `/logos/mlb/${abbreviation.trim().toLowerCase()}.png`;
}

export function getNbaLogoPublicPath(abbreviation: string): string {
  return `/logos/nba/${abbreviation.trim().toLowerCase()}.png`;
}

export function getNhlLogoPublicPath(abbreviation: string): string {
  return `/logos/nhl/${abbreviation.trim().toLowerCase()}.png`;
}

export function getMlsLogoPublicPath(abbreviation: string): string {
  return `/logos/mls/${abbreviation.trim().toLowerCase()}.png`;
}

export function getWnbaLogoPublicPath(abbreviation: string): string {
  return `/logos/wnba/${abbreviation.trim().toLowerCase()}.png`;
}

export function getLeagueLogoPublicPath(abbreviation: string): string {
  return `/logos/leagues/${abbreviation.trim().toLowerCase()}.png`;
}

export function getCollegeLogoPublicPath(espnId: number): string {
  return `/logos/ncaa/${espnId}.png`;
}

/** Remote sources for golf tour logos (PGA, future LPGA, etc.). */
export const GOLF_TOUR_LOGO_DOWNLOAD_URLS: Record<string, string> = {
  PGA: "https://upload.wikimedia.org/wikipedia/en/5/53/PGA_Tour_logo.svg",
};

export function getGolfTourLogosDirectory(): string {
  return path.resolve(process.cwd(), "public", "logos", "golf-tours");
}

export function getGolfTourLogoExtension(abbreviation: string): string {
  const normalized = abbreviation.trim().toUpperCase();
  const url = GOLF_TOUR_LOGO_DOWNLOAD_URLS[normalized] ?? "";
  if (url.endsWith(".svg")) {
    return "svg";
  }
  return "png";
}

export function getGolfTourLogoPublicPath(abbreviation: string): string {
  const normalized = abbreviation.trim().toLowerCase();
  const extension = getGolfTourLogoExtension(abbreviation);
  return `/logos/golf-tours/${normalized}.${extension}`;
}

export function getGolfTourLogoFilePath(abbreviation: string): string {
  return path.join(
    getGolfTourLogosDirectory(),
    `${abbreviation.trim().toLowerCase()}.${getGolfTourLogoExtension(abbreviation)}`,
  );
}

export function shouldDownloadGolfTourLogos(
  options: AssetDownloadOptions = {},
): boolean {
  return isAssetDownloadEnabled(
    process.env.GOLF_TOUR_LOGO_DOWNLOAD_ON_STARTUP,
    options,
  );
}

export function getNflLogoFilePath(abbreviation: string): string {
  return path.join(
    getNflLogosDirectory(),
    `${abbreviation.trim().toLowerCase()}.png`,
  );
}

export function getMlbLogoFilePath(abbreviation: string): string {
  return path.join(
    getMlbLogosDirectory(),
    `${abbreviation.trim().toLowerCase()}.png`,
  );
}

export function getNbaLogoFilePath(abbreviation: string): string {
  return path.join(
    getNbaLogosDirectory(),
    `${abbreviation.trim().toLowerCase()}.png`,
  );
}

export function getNhlLogoFilePath(abbreviation: string): string {
  return path.join(
    getNhlLogosDirectory(),
    `${abbreviation.trim().toLowerCase()}.png`,
  );
}

export function getMlsLogoFilePath(abbreviation: string): string {
  return path.join(
    getMlsLogosDirectory(),
    `${abbreviation.trim().toLowerCase()}.png`,
  );
}

export function getWnbaLogoFilePath(abbreviation: string): string {
  return path.join(
    getWnbaLogosDirectory(),
    `${abbreviation.trim().toLowerCase()}.png`,
  );
}

export function getLeagueLogoFilePath(abbreviation: string): string {
  return path.join(
    getLeagueLogosDirectory(),
    `${abbreviation.trim().toLowerCase()}.png`,
  );
}

export function getCollegeLogoFilePath(espnId: number): string {
  return path.join(getNcaaCollegeLogosDirectory(), `${espnId}.png`);
}

export function shouldDownloadNflLogos(
  options: AssetDownloadOptions = {},
): boolean {
  return isAssetDownloadEnabled(
    process.env.NFL_LOGO_DOWNLOAD_ON_STARTUP,
    options,
  );
}

export function shouldDownloadMlbLogos(
  options: AssetDownloadOptions = {},
): boolean {
  return isAssetDownloadEnabled(
    process.env.MLB_LOGO_DOWNLOAD_ON_STARTUP,
    options,
  );
}

export function shouldDownloadNbaLogos(
  options: AssetDownloadOptions = {},
): boolean {
  return isAssetDownloadEnabled(
    process.env.NBA_LOGO_DOWNLOAD_ON_STARTUP,
    options,
  );
}

export function shouldDownloadNhlLogos(
  options: AssetDownloadOptions = {},
): boolean {
  return isAssetDownloadEnabled(
    process.env.NHL_LOGO_DOWNLOAD_ON_STARTUP,
    options,
  );
}

export function shouldDownloadMlsLogos(
  options: AssetDownloadOptions = {},
): boolean {
  return isAssetDownloadEnabled(
    process.env.MLS_LOGO_DOWNLOAD_ON_STARTUP,
    options,
  );
}

export function shouldDownloadWnbaLogos(
  options: AssetDownloadOptions = {},
): boolean {
  return isAssetDownloadEnabled(
    process.env.WNBA_LOGO_DOWNLOAD_ON_STARTUP,
    options,
  );
}

export function shouldDownloadCollegeLogos(
  options: AssetDownloadOptions = {},
): boolean {
  return isAssetDownloadEnabled(
    process.env.COLLEGE_LOGO_DOWNLOAD_ON_STARTUP,
    options,
  );
}

export function shouldDownloadLeagueLogo(
  abbreviation: string,
  options: AssetDownloadOptions = {},
): boolean {
  const envByLeague: Record<string, string | undefined> = {
    NFL: process.env.NFL_LOGO_DOWNLOAD_ON_STARTUP,
    MLB: process.env.MLB_LOGO_DOWNLOAD_ON_STARTUP,
    NBA: process.env.NBA_LOGO_DOWNLOAD_ON_STARTUP,
    NHL: process.env.NHL_LOGO_DOWNLOAD_ON_STARTUP,
    MLS: process.env.MLS_LOGO_DOWNLOAD_ON_STARTUP,
    WNBA: process.env.WNBA_LOGO_DOWNLOAD_ON_STARTUP,
  };

  return isAssetDownloadEnabled(
    envByLeague[abbreviation.trim().toUpperCase()],
    options,
  );
}
