import { CountryError, getCountryStore } from "@/modules/countries";
import { getLocationStore, LocationError } from "@/modules/locations";
import { getWorldClockService } from "@/modules/world-clock";
import {
  getDefaultHumanRepository,
  type HumanRepository,
} from "@/persistence/repositories";
import type { ListOptions } from "@/lib/pagination";
import { HumanError, HumanErrorCodes } from "./errors";
import {
  buildHuman,
  validateBirthLocationId,
  validateId,
  validateNationalityCountryId,
} from "./transform";
import type { Human, HumanInput, HumanOutput } from "./types";

export class HumanStore {
  constructor(private readonly repository: HumanRepository) {}

  async list(options?: ListOptions): Promise<Human[]> {
    return this.repository.list(options);
  }

  async count(): Promise<number> {
    return this.repository.count();
  }

  async get(id: string): Promise<Human> {
    const human = await this.repository.get(id);

    if (!human) {
      throw new HumanError(
        HumanErrorCodes.HUMAN_NOT_FOUND,
        `Human not found: ${id}`,
      );
    }

    return human;
  }

  async create(input: {
    givenName: unknown;
    familyName: unknown;
    preferredName?: unknown;
    gender: unknown;
    birthDate: unknown;
    birthLocationId: unknown;
    nationalityCountryId: unknown;
    heightCm: unknown;
    weightKg: unknown;
  }): Promise<Human> {
    const humanId = crypto.randomUUID();
    const asOfIsoUtc = getWorldClockService().getCurrentOutput().isoUtc;
    const birthLocationId = validateBirthLocationId(input.birthLocationId);
    const nationalityCountryId = validateNationalityCountryId(
      input.nationalityCountryId,
    );

    let birthLocation;
    try {
      birthLocation = await getLocationStore().get(birthLocationId);
    } catch (error) {
      if (error instanceof LocationError) {
        throw new HumanError(
          HumanErrorCodes.BIRTH_LOCATION_NOT_FOUND,
          error.message,
        );
      }
      throw error;
    }

    let nationalityCountry;
    try {
      nationalityCountry = await getCountryStore().get(nationalityCountryId);
    } catch (error) {
      if (error instanceof CountryError) {
        throw new HumanError(
          HumanErrorCodes.NATIONALITY_COUNTRY_NOT_FOUND,
          error.message,
        );
      }
      throw error;
    }

    const human = buildHuman(
      input,
      humanId,
      birthLocation.name,
      birthLocation.region,
      birthLocation.countryName,
      nationalityCountry.name,
      asOfIsoUtc,
    );

    return this.repository.create(human);
  }

  async delete(id: string): Promise<{ deleted: true; id: string }> {
    validateId(id);

    const human = await this.repository.get(id);
    if (!human) {
      throw new HumanError(
        HumanErrorCodes.HUMAN_NOT_FOUND,
        `Human not found: ${id}`,
      );
    }

    await this.repository.delete(id);
    return { deleted: true, id };
  }

  async clear(): Promise<void> {
    await this.repository.clear();
  }
}

const globalForHumans = globalThis as typeof globalThis & {
  __humanStore?: HumanStore;
};

export function getHumanStore(): HumanStore {
  if (!globalForHumans.__humanStore) {
    globalForHumans.__humanStore = new HumanStore(getDefaultHumanRepository());
  }
  return globalForHumans.__humanStore;
}

export function resetHumanStore(repository?: HumanRepository): HumanStore {
  const store = new HumanStore(repository ?? getDefaultHumanRepository());
  globalForHumans.__humanStore = store;
  return store;
}

export async function executeHuman(input: HumanInput): Promise<HumanOutput> {
  const store = getHumanStore();

  switch (input.action) {
    case "create":
      return store.create(input);

    case "get":
      return store.get(validateId(input.id));

    case "delete":
      return store.delete(validateId(input.id));

    default: {
      const unknownAction = (input as { action: string }).action;
      throw new HumanError(
        HumanErrorCodes.INVALID_ACTION,
        `Unknown action: ${unknownAction}`,
      );
    }
  }
}

export async function listHumans(options?: ListOptions): Promise<Human[]> {
  return getHumanStore().list(options);
}

export async function countHumans(): Promise<number> {
  return getHumanStore().count();
}

export * from "./types";
export * from "./errors";
export {
  buildHuman,
  computeHumanAge,
  humanDisplayName,
  validateBirthDate,
  validateBirthLocationId,
  validateFamilyName,
  validateGender,
  validateGivenName,
  validateHeightCm,
  validateId,
  validateNationalityCountryId,
  validatePreferredName,
  validateWeightKg,
} from "./transform";
