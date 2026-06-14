import { buildCountry } from "@/modules/countries/transform";
import { downloadFlagImage } from "@/persistence/flags/download";
import {
  getDefaultCountryRepository,
  type CountryRepository,
} from "@/persistence/repositories";
import { COUNTRY_SEED_DATA } from "./countries.data";
import type { CountrySeedEntry, CountrySeedResult } from "./types";

export function countryMergeKey(name: string): string {
  return name.trim().toLowerCase();
}

export async function mergeCountrySeed(
  repository: CountryRepository,
  entries: readonly CountrySeedEntry[] = COUNTRY_SEED_DATA,
): Promise<CountrySeedResult> {
  const existing = await repository.list();
  const existingKeys = new Set(
    existing.map((country) => countryMergeKey(country.name)),
  );

  let added = 0;
  let skipped = 0;

  for (const entry of entries) {
    const key = countryMergeKey(entry.name);

    if (existingKeys.has(key)) {
      skipped += 1;
      continue;
    }

    const id = crypto.randomUUID();
    const isoCode = entry.isoCode.toUpperCase();
    const flag = await downloadFlagImage(isoCode);
    const country = buildCountry(
      {
        name: entry.name,
        isoCode,
        flag,
        languages: entry.languages,
      },
      id,
    );

    await repository.create({
      id: country.id,
      name: country.name,
      isoCode: country.isoCode,
      flag: country.flag,
      languages: country.languages,
    });
    existingKeys.add(key);
    added += 1;
  }

  return {
    enabled: true,
    added,
    skipped,
    total: entries.length,
  };
}

export async function seedCountries(
  repository: CountryRepository = getDefaultCountryRepository(),
): Promise<CountrySeedResult> {
  return mergeCountrySeed(repository);
}
