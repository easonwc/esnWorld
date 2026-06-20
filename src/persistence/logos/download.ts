import fs from "node:fs";
import type { AssetDownloadOptions } from "@/persistence/env";
import type { LeagueRepository, TeamRepository, CollegeRepository, GolfTourRepository } from "@/persistence/repositories";
import { COLLEGE_ESPN_LOGO_IDS } from "./college-espn-ids";
import {
  getLeagueLogoFilePath,
  getLeagueLogoPublicPath,
  getLeagueLogosDirectory,
  getMlbLogoFilePath,
  getMlbLogoPublicPath,
  getMlbLogosDirectory,
  getMlsLogoFilePath,
  getMlsLogoPublicPath,
  getMlsLogosDirectory,
  getNbaLogoFilePath,
  getNbaLogoPublicPath,
  getNbaLogosDirectory,
  getNhlLogoFilePath,
  getNhlLogoPublicPath,
  getNhlLogosDirectory,
  getNflLogoFilePath,
  getNflLogoPublicPath,
  getNflLogosDirectory,
  getWnbaLogoFilePath,
  getWnbaLogoPublicPath,
  getWnbaLogosDirectory,
  getCollegeLogoFilePath,
  getCollegeLogoPublicPath,
  getNcaaCollegeLogosDirectory,
  getGolfTourLogoFilePath,
  getGolfTourLogoPublicPath,
  getGolfTourLogosDirectory,
  GOLF_TOUR_LOGO_DOWNLOAD_URLS,
  LEAGUE_LOGO_CDN_BASE,
  MLB_LOGO_CDN_BASE,
  MLS_LOGO_CDN_BASE,
  NBA_LOGO_CDN_BASE,
  getNbaLogoCdnAbbreviation,
  getNhlLogoCdnAbbreviation,
  NHL_LOGO_CDN_BASE,
  NFL_LOGO_CDN_BASE,
  NCAA_COLLEGE_LOGO_CDN_BASE,
  WNBA_LOGO_CDN_BASE,
  shouldDownloadCollegeLogos,
  shouldDownloadGolfTourLogos,
  shouldDownloadLeagueLogo,
  shouldDownloadMlbLogos,
  shouldDownloadMlsLogos,
  shouldDownloadNbaLogos,
  shouldDownloadNhlLogos,
  shouldDownloadNflLogos,
  shouldDownloadWnbaLogos,
} from "./config";

export interface LeagueLogoDownloadResult {
  downloaded: number;
  skipped: number;
  failed: number;
}

export interface LeagueLogoSyncResult extends LeagueLogoDownloadResult {
  updated: number;
}

const LOGO_DOWNLOAD_CONCURRENCY = 8;

async function runWithConcurrency<T>(
  items: readonly T[],
  concurrency: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  if (items.length === 0) {
    return;
  }

  let index = 0;
  async function worker(): Promise<void> {
    while (index < items.length) {
      const current = index;
      index += 1;
      await fn(items[current]!);
    }
  }

  const workers = Math.min(concurrency, items.length);
  await Promise.all(Array.from({ length: workers }, () => worker()));
}

function normalizeAbbreviation(abbreviation: string): string {
  const normalized = abbreviation.trim().toUpperCase();
  if (!/^[A-Z0-9]{2,4}$/.test(normalized)) {
    throw new Error(`abbreviation must be 2–4 letters, received: ${abbreviation}`);
  }
  return normalized;
}

export async function downloadLeagueLogo(
  abbreviation: string,
  options: AssetDownloadOptions = {},
): Promise<string> {
  const normalized = normalizeAbbreviation(abbreviation);
  const publicPath = getLeagueLogoPublicPath(normalized);

  if (!shouldDownloadLeagueLogo(normalized, options)) {
    return publicPath;
  }

  const logosDir = getLeagueLogosDirectory();
  fs.mkdirSync(logosDir, { recursive: true });

  const filePath = getLeagueLogoFilePath(normalized);
  if (fs.existsSync(filePath)) {
    return publicPath;
  }

  const response = await fetch(
    `${LEAGUE_LOGO_CDN_BASE}/${normalized.toLowerCase()}.png`,
  );

  if (!response.ok) {
    if (options.force) {
      throw new Error(
        `Failed to download league logo for ${normalized}: HTTP ${response.status}`,
      );
    }
    return publicPath;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return publicPath;
}

export async function downloadGolfTourLogo(
  abbreviation: string,
  options: AssetDownloadOptions = {},
): Promise<string> {
  const normalized = normalizeAbbreviation(abbreviation);
  const publicPath = getGolfTourLogoPublicPath(normalized);

  if (!shouldDownloadGolfTourLogos(options)) {
    return publicPath;
  }

  const downloadUrl = GOLF_TOUR_LOGO_DOWNLOAD_URLS[normalized];
  if (!downloadUrl) {
    return publicPath;
  }

  const logosDir = getGolfTourLogosDirectory();
  fs.mkdirSync(logosDir, { recursive: true });

  const filePath = getGolfTourLogoFilePath(normalized);
  if (fs.existsSync(filePath)) {
    return publicPath;
  }

  const response = await fetch(downloadUrl);

  if (!response.ok) {
    if (options.force) {
      throw new Error(
        `Failed to download golf tour logo for ${normalized}: HTTP ${response.status}`,
      );
    }
    return publicPath;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return publicPath;
}

export async function syncGolfTourLogo(
  tourRepository: GolfTourRepository,
  abbreviation: string,
): Promise<LeagueLogoSyncResult> {
  const normalized = normalizeAbbreviation(abbreviation);

  if (!shouldDownloadGolfTourLogos()) {
    return { downloaded: 0, skipped: 0, failed: 0, updated: 0 };
  }

  const tour = await tourRepository.getByAbbreviation(normalized);

  if (!tour) {
    return { downloaded: 0, skipped: 0, failed: 0, updated: 0 };
  }

  try {
    const existed = fs.existsSync(getGolfTourLogoFilePath(normalized));
    const logoPath = await downloadGolfTourLogo(normalized);

    let downloaded = 0;
    let skipped = 0;

    if (existed) {
      skipped = 1;
    } else {
      downloaded = 1;
    }

    let updated = 0;
    if (tour.logo !== logoPath) {
      await tourRepository.updateLogo(tour.id, logoPath);
      updated = 1;
    }

    return { downloaded, skipped, failed: 0, updated };
  } catch {
    return { downloaded: 0, skipped: 0, failed: 1, updated: 0 };
  }
}

export async function downloadNflTeamLogo(
  abbreviation: string,
  options: AssetDownloadOptions = {},
): Promise<string> {
  const normalized = normalizeAbbreviation(abbreviation);
  const publicPath = getNflLogoPublicPath(normalized);

  if (!shouldDownloadNflLogos(options)) {
    return publicPath;
  }

  const logosDir = getNflLogosDirectory();
  fs.mkdirSync(logosDir, { recursive: true });

  const filePath = getNflLogoFilePath(normalized);
  if (fs.existsSync(filePath)) {
    return publicPath;
  }

  const response = await fetch(`${NFL_LOGO_CDN_BASE}/${normalized}`);

  if (!response.ok) {
    if (options.force) {
      throw new Error(
        `Failed to download logo for ${normalized}: HTTP ${response.status}`,
      );
    }
    return publicPath;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return publicPath;
}

export async function downloadMlbTeamLogo(
  abbreviation: string,
  options: AssetDownloadOptions = {},
): Promise<string> {
  const normalized = normalizeAbbreviation(abbreviation);
  const publicPath = getMlbLogoPublicPath(normalized);

  if (!shouldDownloadMlbLogos(options)) {
    return publicPath;
  }

  const logosDir = getMlbLogosDirectory();
  fs.mkdirSync(logosDir, { recursive: true });

  const filePath = getMlbLogoFilePath(normalized);
  if (fs.existsSync(filePath)) {
    return publicPath;
  }

  const response = await fetch(`${MLB_LOGO_CDN_BASE}/${normalized}.png`);

  if (!response.ok) {
    if (options.force) {
      throw new Error(
        `Failed to download logo for ${normalized}: HTTP ${response.status}`,
      );
    }
    return publicPath;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return publicPath;
}

export async function downloadNbaTeamLogo(
  abbreviation: string,
  options: AssetDownloadOptions = {},
): Promise<string> {
  const normalized = normalizeAbbreviation(abbreviation);
  const publicPath = getNbaLogoPublicPath(normalized);

  if (!shouldDownloadNbaLogos(options)) {
    return publicPath;
  }

  const logosDir = getNbaLogosDirectory();
  fs.mkdirSync(logosDir, { recursive: true });

  const filePath = getNbaLogoFilePath(normalized);
  if (fs.existsSync(filePath)) {
    return publicPath;
  }

  const response = await fetch(
    `${NBA_LOGO_CDN_BASE}/${getNbaLogoCdnAbbreviation(normalized)}.png`,
  );

  if (!response.ok) {
    if (options.force) {
      throw new Error(
        `Failed to download logo for ${normalized}: HTTP ${response.status}`,
      );
    }
    return publicPath;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return publicPath;
}

export async function downloadNhlTeamLogo(
  abbreviation: string,
  options: AssetDownloadOptions = {},
): Promise<string> {
  const normalized = normalizeAbbreviation(abbreviation);
  const publicPath = getNhlLogoPublicPath(normalized);

  if (!shouldDownloadNhlLogos(options)) {
    return publicPath;
  }

  const logosDir = getNhlLogosDirectory();
  fs.mkdirSync(logosDir, { recursive: true });

  const filePath = getNhlLogoFilePath(normalized);
  if (fs.existsSync(filePath)) {
    return publicPath;
  }

  const response = await fetch(
    `${NHL_LOGO_CDN_BASE}/${getNhlLogoCdnAbbreviation(normalized)}.png`,
  );

  if (!response.ok) {
    if (options.force) {
      throw new Error(
        `Failed to download logo for ${normalized}: HTTP ${response.status}`,
      );
    }
    return publicPath;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return publicPath;
}

export async function downloadMlsTeamLogo(
  abbreviation: string,
  options: AssetDownloadOptions = {},
): Promise<string> {
  const normalized = normalizeAbbreviation(abbreviation);
  const publicPath = getMlsLogoPublicPath(normalized);

  if (!shouldDownloadMlsLogos(options)) {
    return publicPath;
  }

  const logosDir = getMlsLogosDirectory();
  fs.mkdirSync(logosDir, { recursive: true });

  const filePath = getMlsLogoFilePath(normalized);
  if (fs.existsSync(filePath)) {
    return publicPath;
  }

  const response = await fetch(`${MLS_LOGO_CDN_BASE}/${normalized}.png`);

  if (!response.ok) {
    if (options.force) {
      throw new Error(
        `Failed to download logo for ${normalized}: HTTP ${response.status}`,
      );
    }
    return publicPath;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return publicPath;
}

export async function downloadWnbaTeamLogo(
  abbreviation: string,
  options: AssetDownloadOptions = {},
): Promise<string> {
  const normalized = normalizeAbbreviation(abbreviation);
  const publicPath = getWnbaLogoPublicPath(normalized);

  if (!shouldDownloadWnbaLogos(options)) {
    return publicPath;
  }

  const logosDir = getWnbaLogosDirectory();
  fs.mkdirSync(logosDir, { recursive: true });

  const filePath = getWnbaLogoFilePath(normalized);
  if (fs.existsSync(filePath)) {
    return publicPath;
  }

  const response = await fetch(`${WNBA_LOGO_CDN_BASE}/${normalized}.png`);

  if (!response.ok) {
    if (options.force) {
      throw new Error(
        `Failed to download logo for ${normalized}: HTTP ${response.status}`,
      );
    }
    return publicPath;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return publicPath;
}

export async function downloadSeedLeagueLogos(
  abbreviations: readonly string[],
  getLogoFilePath: (abbreviation: string) => string,
  downloadLogo: (
    abbreviation: string,
    options?: AssetDownloadOptions,
  ) => Promise<string>,
): Promise<LeagueLogoDownloadResult> {
  const result: LeagueLogoDownloadResult = { downloaded: 0, skipped: 0, failed: 0 };

  await runWithConcurrency(abbreviations, LOGO_DOWNLOAD_CONCURRENCY, async (abbreviation) => {
    const filePath = getLogoFilePath(abbreviation);

    if (fs.existsSync(filePath)) {
      result.skipped += 1;
      return;
    }

    try {
      await downloadLogo(abbreviation, { force: true });
      result.downloaded += 1;
    } catch {
      result.failed += 1;
    }
  });

  return result;
}

export async function downloadSeedNflLogos(
  abbreviations: readonly string[],
): Promise<LeagueLogoDownloadResult> {
  return downloadSeedLeagueLogos(
    abbreviations,
    getNflLogoFilePath,
    downloadNflTeamLogo,
  );
}

export async function downloadSeedMlbLogos(
  abbreviations: readonly string[],
): Promise<LeagueLogoDownloadResult> {
  return downloadSeedLeagueLogos(
    abbreviations,
    getMlbLogoFilePath,
    downloadMlbTeamLogo,
  );
}

export async function downloadSeedNbaLogos(
  abbreviations: readonly string[],
): Promise<LeagueLogoDownloadResult> {
  return downloadSeedLeagueLogos(
    abbreviations,
    getNbaLogoFilePath,
    downloadNbaTeamLogo,
  );
}

export async function downloadSeedNhlLogos(
  abbreviations: readonly string[],
): Promise<LeagueLogoDownloadResult> {
  return downloadSeedLeagueLogos(
    abbreviations,
    getNhlLogoFilePath,
    downloadNhlTeamLogo,
  );
}

export async function downloadSeedMlsLogos(
  abbreviations: readonly string[],
): Promise<LeagueLogoDownloadResult> {
  return downloadSeedLeagueLogos(
    abbreviations,
    getMlsLogoFilePath,
    downloadMlsTeamLogo,
  );
}

export async function downloadSeedWnbaLogos(
  abbreviations: readonly string[],
): Promise<LeagueLogoDownloadResult> {
  return downloadSeedLeagueLogos(
    abbreviations,
    getWnbaLogoFilePath,
    downloadWnbaTeamLogo,
  );
}

async function syncLeagueTeamLogos(
  teamRepository: TeamRepository,
  leagueRepository: LeagueRepository,
  leagueAbbreviation: string,
  downloadLogo: (abbreviation: string) => Promise<string>,
  getLogoFilePath: (abbreviation: string) => string,
  shouldDownload: () => boolean,
): Promise<LeagueLogoSyncResult> {
  if (!shouldDownload()) {
    return { downloaded: 0, skipped: 0, failed: 0, updated: 0 };
  }

  const league = await leagueRepository.getByAbbreviation(leagueAbbreviation);
  if (!league) {
    return { downloaded: 0, skipped: 0, failed: 0, updated: 0 };
  }

  const teams = await teamRepository.listByLeague(league.id);
  const result: LeagueLogoSyncResult = {
    downloaded: 0,
    skipped: 0,
    failed: 0,
    updated: 0,
  };

  await runWithConcurrency(teams, LOGO_DOWNLOAD_CONCURRENCY, async (team) => {
    const logoFilePath = getLogoFilePath(team.abbreviation);
    const existed = fs.existsSync(logoFilePath);

    try {
      const logoPath = await downloadLogo(team.abbreviation);
      const saved = fs.existsSync(logoFilePath);

      if (existed) {
        result.skipped += 1;
      } else if (saved) {
        result.downloaded += 1;
      } else {
        result.failed += 1;
      }

      if (team.logo !== logoPath) {
        await teamRepository.updateLogo(team.id, logoPath);
        result.updated += 1;
      }
    } catch {
      result.failed += 1;
    }
  });

  return result;
}

export async function syncNflTeamLogos(
  teamRepository: TeamRepository,
  leagueRepository: LeagueRepository,
): Promise<LeagueLogoSyncResult> {
  return syncLeagueTeamLogos(
    teamRepository,
    leagueRepository,
    "NFL",
    downloadNflTeamLogo,
    getNflLogoFilePath,
    shouldDownloadNflLogos,
  );
}

export async function syncMlbTeamLogos(
  teamRepository: TeamRepository,
  leagueRepository: LeagueRepository,
): Promise<LeagueLogoSyncResult> {
  return syncLeagueTeamLogos(
    teamRepository,
    leagueRepository,
    "MLB",
    downloadMlbTeamLogo,
    getMlbLogoFilePath,
    shouldDownloadMlbLogos,
  );
}

export async function syncNbaTeamLogos(
  teamRepository: TeamRepository,
  leagueRepository: LeagueRepository,
): Promise<LeagueLogoSyncResult> {
  return syncLeagueTeamLogos(
    teamRepository,
    leagueRepository,
    "NBA",
    downloadNbaTeamLogo,
    getNbaLogoFilePath,
    shouldDownloadNbaLogos,
  );
}

export async function syncNhlTeamLogos(
  teamRepository: TeamRepository,
  leagueRepository: LeagueRepository,
): Promise<LeagueLogoSyncResult> {
  return syncLeagueTeamLogos(
    teamRepository,
    leagueRepository,
    "NHL",
    downloadNhlTeamLogo,
    getNhlLogoFilePath,
    shouldDownloadNhlLogos,
  );
}

export async function syncMlsTeamLogos(
  teamRepository: TeamRepository,
  leagueRepository: LeagueRepository,
): Promise<LeagueLogoSyncResult> {
  return syncLeagueTeamLogos(
    teamRepository,
    leagueRepository,
    "MLS",
    downloadMlsTeamLogo,
    getMlsLogoFilePath,
    shouldDownloadMlsLogos,
  );
}

export async function syncWnbaTeamLogos(
  teamRepository: TeamRepository,
  leagueRepository: LeagueRepository,
): Promise<LeagueLogoSyncResult> {
  return syncLeagueTeamLogos(
    teamRepository,
    leagueRepository,
    "WNBA",
    downloadWnbaTeamLogo,
    getWnbaLogoFilePath,
    shouldDownloadWnbaLogos,
  );
}

export async function syncLeagueEntityLogo(
  leagueRepository: LeagueRepository,
  abbreviation: string,
): Promise<LeagueLogoSyncResult> {
  const normalized = normalizeAbbreviation(abbreviation);

  if (!shouldDownloadLeagueLogo(normalized)) {
    return { downloaded: 0, skipped: 0, failed: 0, updated: 0 };
  }

  const league = await leagueRepository.getByAbbreviation(normalized);

  if (!league) {
    return { downloaded: 0, skipped: 0, failed: 0, updated: 0 };
  }

  try {
    const existed = fs.existsSync(getLeagueLogoFilePath(normalized));
    const logoPath = await downloadLeagueLogo(normalized);

    let downloaded = 0;
    let skipped = 0;

    if (existed) {
      skipped = 1;
    } else {
      downloaded = 1;
    }

    let updated = 0;
    if (league.logo !== logoPath) {
      await leagueRepository.updateLogo(league.id, logoPath);
      updated = 1;
    }

    return { downloaded, skipped, failed: 0, updated };
  } catch {
    return { downloaded: 0, skipped: 0, failed: 1, updated: 0 };
  }
}

function normalizeEspnId(espnId: number): number {
  if (!Number.isInteger(espnId) || espnId <= 0) {
    throw new Error(`espnId must be a positive integer, received: ${espnId}`);
  }
  return espnId;
}

export async function downloadCollegeLogo(
  espnId: number,
  options: AssetDownloadOptions = {},
): Promise<string> {
  const normalized = normalizeEspnId(espnId);
  const publicPath = getCollegeLogoPublicPath(normalized);

  if (!shouldDownloadCollegeLogos(options)) {
    return publicPath;
  }

  const logosDir = getNcaaCollegeLogosDirectory();
  fs.mkdirSync(logosDir, { recursive: true });

  const filePath = getCollegeLogoFilePath(normalized);
  if (fs.existsSync(filePath)) {
    return publicPath;
  }

  const response = await fetch(
    `${NCAA_COLLEGE_LOGO_CDN_BASE}/${normalized}.png`,
  );

  if (!response.ok) {
    if (options.force) {
      throw new Error(
        `Failed to download college logo for ${normalized}: HTTP ${response.status}`,
      );
    }
    return publicPath;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return publicPath;
}

export async function downloadSeedCollegeLogos(
  espnIds: readonly number[],
): Promise<LeagueLogoDownloadResult> {
  const result: LeagueLogoDownloadResult = {
    downloaded: 0,
    skipped: 0,
    failed: 0,
  };

  await runWithConcurrency(espnIds, LOGO_DOWNLOAD_CONCURRENCY, async (espnId) => {
    const filePath = getCollegeLogoFilePath(espnId);

    if (fs.existsSync(filePath)) {
      result.skipped += 1;
      return;
    }

    try {
      await downloadCollegeLogo(espnId, { force: true });
      result.downloaded += 1;
    } catch {
      result.failed += 1;
    }
  });

  return result;
}

export async function syncCollegeLogos(
  repository: CollegeRepository,
): Promise<LeagueLogoSyncResult> {
  if (!shouldDownloadCollegeLogos()) {
    return { downloaded: 0, skipped: 0, failed: 0, updated: 0 };
  }

  const colleges = await repository.list();
  const result: LeagueLogoSyncResult = {
    downloaded: 0,
    skipped: 0,
    failed: 0,
    updated: 0,
  };

  await runWithConcurrency(colleges, LOGO_DOWNLOAD_CONCURRENCY, async (college) => {
    const espnId = COLLEGE_ESPN_LOGO_IDS[college.name];
    if (!espnId) {
      return;
    }

    const logoFilePath = getCollegeLogoFilePath(espnId);
    const existed = fs.existsSync(logoFilePath);

    try {
      const logoPath = await downloadCollegeLogo(espnId);
      const saved = fs.existsSync(logoFilePath);

      if (existed) {
        result.skipped += 1;
      } else if (saved) {
        result.downloaded += 1;
      } else {
        result.failed += 1;
      }

      if (college.logo !== logoPath) {
        await repository.updateLogo(college.id, logoPath);
        result.updated += 1;
      }
    } catch {
      result.failed += 1;
    }
  });

  return result;
}
