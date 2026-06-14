import { getLocationStore } from "@/modules/locations";
import { downloadFlagImage } from "@/persistence/flags/download";
import {
  getDefaultCountryRepository,
  type CountryRecord,
  type CountryRepository,
} from "@/persistence/repositories";
import { CountryError, CountryErrorCodes } from "./errors";
import { buildCountry, validateId, validateIsoCode } from "./transform";
import type { Country, CountryInput, CountryOutput } from "./types";

export class CountryStore {
  constructor(private readonly repository: CountryRepository) {}

  private async withPopulation(record: CountryRecord): Promise<Country> {
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
      population: await getLocationStore().sumPopulationByCountry(record.id),
    };
  }

  async list(): Promise<Country[]> {
    const records = await this.repository.list();
    return Promise.all(records.map((record) => this.withPopulation(record)));
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

export async function listCountries(): Promise<Country[]> {
  return getCountryStore().list();
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
