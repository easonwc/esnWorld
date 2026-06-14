import { getLocationStore } from "@/modules/locations";
import { downloadFlagImage } from "@/persistence/flags/download";
import {
  getDefaultCountryRepository,
  type CountryRecord,
  type CountryRepository,
} from "@/persistence/repositories";
import type { ListOptions } from "@/lib/pagination";
import { CountryError, CountryErrorCodes } from "./errors";
import { buildCountry, validateId, validateIsoCode } from "./transform";
import type { Country, CountryInput, CountryOutput } from "./types";

export class CountryStore {
  constructor(private readonly repository: CountryRepository) {}

  private toCountry(
    record: CountryRecord,
    population: number,
  ): Country {
    if (!record.isoCode) {
      throw new CountryError(
        CountryErrorCodes.INVALID_ISO_CODE,
        `Country is missing isoCode: ${record.name}`,
      );
    }

    return {
      id: record.id,
      name: record.name,
      isoCode: record.isoCode,
      flag: record.flag,
      languages: record.languages,
      population,
    };
  }

  private async withPopulation(record: CountryRecord): Promise<Country> {
    return this.toCountry(
      record,
      await getLocationStore().sumPopulationByCountry(record.id),
    );
  }

  async list(options?: ListOptions): Promise<Country[]> {
    const records = await this.repository.list(options);
    const populationTotals =
      await getLocationStore().populationTotalsByCountry();

    return records.map((record) =>
      this.toCountry(record, populationTotals.get(record.id) ?? 0),
    );
  }

  async count(): Promise<number> {
    return this.repository.count();
  }

  async get(id: string): Promise<Country> {
    const country = await this.repository.get(id);

    if (!country) {
      throw new CountryError(
        CountryErrorCodes.COUNTRY_NOT_FOUND,
        `Country not found: ${id}`,
      );
    }

    return this.withPopulation(country);
  }

  async getByName(name: string): Promise<Country | null> {
    const country = await this.repository.getByName(name);
    return country ? this.withPopulation(country) : null;
  }

  async create(input: {
    name: unknown;
    isoCode: unknown;
    languages: unknown;
  }): Promise<Country> {
    const isoCode = validateIsoCode(input.isoCode);
    const flag = await downloadFlagImage(isoCode);
    const id = crypto.randomUUID();
    const country = buildCountry(
      {
        name: input.name,
        isoCode,
        flag,
        languages: input.languages,
      },
      id,
    );
    const record = await this.repository.create({
      id: country.id,
      name: country.name,
      isoCode: country.isoCode,
      flag: country.flag,
      languages: country.languages,
    });
    return this.withPopulation(record);
  }

  async delete(id: string): Promise<{ deleted: true; id: string }> {
    validateId(id);

    const country = await this.repository.get(id);
    if (!country) {
      throw new CountryError(
        CountryErrorCodes.COUNTRY_NOT_FOUND,
        `Country not found: ${id}`,
      );
    }

    const locationCount = await getLocationStore().countByCountry(id);
    if (locationCount > 0) {
      throw new CountryError(
        CountryErrorCodes.COUNTRY_HAS_LOCATIONS,
        `Cannot delete country with ${locationCount} location(s). Delete locations first.`,
      );
    }

    await this.repository.delete(id);
    return { deleted: true, id };
  }

  async clear(): Promise<void> {
    await this.repository.clear();
  }
}

const globalForCountries = globalThis as typeof globalThis & {
  __countryStore?: CountryStore;
};

export function getCountryStore(): CountryStore {
  if (!globalForCountries.__countryStore) {
    globalForCountries.__countryStore = new CountryStore(
      getDefaultCountryRepository(),
    );
  }
  return globalForCountries.__countryStore;
}

export function resetCountryStore(
  repository?: CountryRepository,
): CountryStore {
  const store = new CountryStore(repository ?? getDefaultCountryRepository());
  globalForCountries.__countryStore = store;
  return store;
}

export async function executeCountry(
  input: CountryInput,
): Promise<CountryOutput> {
  const store = getCountryStore();

  switch (input.action) {
    case "create":
      return store.create(input);

    case "get":
      return store.get(validateId(input.id));

    case "delete":
      return store.delete(validateId(input.id));

    default: {
      const unknownAction = (input as { action: string }).action;
      throw new CountryError(
        CountryErrorCodes.INVALID_ACTION,
        `Unknown action: ${unknownAction}`,
      );
    }
  }
}

export async function listCountries(options?: ListOptions): Promise<Country[]> {
  return getCountryStore().list(options);
}

export async function countCountries(): Promise<number> {
  return getCountryStore().count();
}

export * from "./types";
export * from "./errors";
export {
  buildCountry,
  parseLanguagesJson,
  serializeLanguages,
  validateFlag,
  validateId,
  validateIsoCode,
  validateLanguages,
  validateName,
} from "./transform";
