import path from "node:path";

export const NFL_LOGO_CDN_BASE =
  "https://static.www.nfl.com/image/upload/league/api/clubs/logos";

export const MLB_LOGO_CDN_BASE =
  "https://a.espncdn.com/i/teamlogos/mlb/500";

export const NBA_LOGO_CDN_BASE =
  "https://a.espncdn.com/i/teamlogos/nba/500";

export const NHL_LOGO_CDN_BASE =
  "https://a.espncdn.com/i/teamlogos/nhl/500";

export const MLS_LOGO_CDN_BASE =
  "https://images.mlssoccer.com/image/upload/v1614296970/assets/logos";

export const WNBA_LOGO_CDN_BASE =
  "https://a.espncdn.com/i/teamlogos/wnba/500";

export const LEAGUE_LOGO_CDN_BASE =
  "https://a.espncdn.com/i/teamlogos/leagues/500";

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

export function shouldDownloadNflLogos(): boolean {
  return (
    process.env.VITEST !== "true" && process.env.SKIP_NFL_LOGO_DOWNLOAD !== "true"
  );
}

export function shouldDownloadMlbLogos(): boolean {
  return (
    process.env.VITEST !== "true" && process.env.SKIP_MLB_LOGO_DOWNLOAD !== "true"
  );
}

export function shouldDownloadNbaLogos(): boolean {
  return (
    process.env.VITEST !== "true" && process.env.SKIP_NBA_LOGO_DOWNLOAD !== "true"
  );
}

export function shouldDownloadNhlLogos(): boolean {
  return (
    process.env.VITEST !== "true" && process.env.SKIP_NHL_LOGO_DOWNLOAD !== "true"
  );
}

export function shouldDownloadMlsLogos(): boolean {
  return (
    process.env.VITEST !== "true" && process.env.SKIP_MLS_LOGO_DOWNLOAD !== "true"
  );
}

export function shouldDownloadWnbaLogos(): boolean {
  return (
    process.env.VITEST !== "true" && process.env.SKIP_WNBA_LOGO_DOWNLOAD !== "true"
  );
}

export function shouldDownloadLeagueLogo(abbreviation: string): boolean {
  if (process.env.VITEST === "true") {
    return false;
  }

  const skipFlags: Record<string, string | undefined> = {
    NFL: process.env.SKIP_NFL_LOGO_DOWNLOAD,
    MLB: process.env.SKIP_MLB_LOGO_DOWNLOAD,
    NBA: process.env.SKIP_NBA_LOGO_DOWNLOAD,
    NHL: process.env.SKIP_NHL_LOGO_DOWNLOAD,
    MLS: process.env.SKIP_MLS_LOGO_DOWNLOAD,
    WNBA: process.env.SKIP_WNBA_LOGO_DOWNLOAD,
  };

  return skipFlags[abbreviation.trim().toUpperCase()] !== "true";
}
