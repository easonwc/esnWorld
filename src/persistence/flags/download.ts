import fs from "node:fs";
import type { CountryRepository } from "@/persistence/repositories";
import {
  FLAG_CDN_BASE,
  getFlagFilePath,
  getFlagPublicPath,
  getFlagsDirectory,
  shouldDownloadFlags,
} from "./config";
import type { AssetDownloadOptions } from "../env";

export interface FlagDownloadResult {
  downloaded: number;
  skipped: number;
  failed: number;
}

export interface FlagSyncResult extends FlagDownloadResult {
  updated: number;
}

function normalizeIsoCode(isoCode: string): string {
  const normalized = isoCode.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized)) {
    throw new Error(`isoCode must be two letters, received: ${isoCode}`);
  }
  return normalized;
}

export async function downloadFlagImage(
  isoCode: string,
  options: AssetDownloadOptions = {},
): Promise<string> {
  const normalized = normalizeIsoCode(isoCode);
  const publicPath = getFlagPublicPath(normalized);

  if (!shouldDownloadFlags(options)) {
    return publicPath;
  }

  const flagsDir = getFlagsDirectory();
  fs.mkdirSync(flagsDir, { recursive: true });

  const filePath = getFlagFilePath(normalized);
  if (fs.existsSync(filePath)) {
    return publicPath;
  }

  const response = await fetch(`${FLAG_CDN_BASE}/${normalized.toLowerCase()}.svg`);

  if (!response.ok) {
    throw new Error(
      `Failed to download flag for ${normalized}: HTTP ${response.status}`,
    );
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return publicPath;
}

export async function downloadSeedFlagImages(): Promise<FlagDownloadResult> {
  const { COUNTRY_SEED_DATA } = await import("../seed/countries.data");

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const entry of COUNTRY_SEED_DATA) {
    const filePath = getFlagFilePath(entry.isoCode);

    if (fs.existsSync(filePath)) {
      skipped += 1;
      continue;
    }

    try {
      await downloadFlagImage(entry.isoCode, { force: true });
      downloaded += 1;
    } catch {
      failed += 1;
    }
  }

  return { downloaded, skipped, failed };
}

export async function syncCountryFlagImages(
  repository: CountryRepository,
): Promise<FlagSyncResult> {
  const countries = await repository.list();

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;
  let updated = 0;

  for (const country of countries) {
    if (!country.isoCode) {
      continue;
    }

    const existed = fs.existsSync(getFlagFilePath(country.isoCode));

    try {
      const flagPath = await downloadFlagImage(country.isoCode);

      if (existed) {
        skipped += 1;
      } else if (shouldDownloadFlags()) {
        downloaded += 1;
      }

      if (country.flag !== flagPath) {
        await repository.updateFlag(country.id, flagPath);
        updated += 1;
      }
    } catch {
      failed += 1;
    }
  }

  return { downloaded, skipped, failed, updated };
}
