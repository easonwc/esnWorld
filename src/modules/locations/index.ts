import { getWorldClockService } from "@/modules/world-clock";
import { getCountryStore, CountryError } from "@/modules/countries";
import { getCollegeStore } from "@/modules/colleges";
import { getVenueStore } from "@/modules/venues";
import {
  getDefaultLocationRepository,
  type LocationRepository,
} from "@/persistence/repositories";
import { LocationError, LocationErrorCodes } from "./errors";
import {
  buildLocation,
  parseIsoUtc,
  utcToLocalTime,
  validateCountryId,
  validateId,
  validateLocationCreateInput,
} from "./transform";
import type {
  Location,
  LocationInput,
  LocationLocalTimeOutput,
  LocationOutput,
} from "./types";

export class LocationStore {
  constructor(private readonly repository: LocationRepository) {}

  async list(): Promise<Location[]> {
    return this.repository.list();
  }

  async get(id: string): Promise<Location> {
    const location = await this.repository.get(id);

    if (!location) {
      throw new LocationError(
        LocationErrorCodes.LOCATION_NOT_FOUND,
        `Location not found: ${id}`,
      );
    }

    return location;
  }

  async countByCountry(countryId: string): Promise<number> {
    return this.repository.countByCountry(countryId);
  }

  async sumPopulationByCountry(countryId: string): Promise<number> {
    return this.repository.sumPopulationByCountry(countryId);
  }

  async create(input: {
    name: unknown;
    countryId?: unknown;
    country?: unknown;
    region?: unknown;
    latitude: unknown;
    longitude: unknown;
    timezone: unknown;
    population: unknown;
  }): Promise<Location> {
    const countryId = validateLocationCreateInput(input);
    let country;

    try {
      country = await getCountryStore().get(countryId);
    } catch (error) {
      if (error instanceof CountryError) {
        throw new LocationError(
          LocationErrorCodes.COUNTRY_NOT_FOUND,
          error.message,
        );
      }
      throw error;
    }

    const id = crypto.randomUUID();
    const location = buildLocation(
      { ...input, countryId },
      id,
      country.name,
    );
    return this.repository.create(location);
  }

  async delete(id: string): Promise<{ deleted: true; id: string }> {
    validateId(id);

    const location = await this.repository.get(id);
    if (!location) {
      throw new LocationError(
        LocationErrorCodes.LOCATION_NOT_FOUND,
        `Location not found: ${id}`,
      );
    }

    const venueCount = await getVenueStore().countByLocation(id);
    if (venueCount > 0) {
      throw new LocationError(
        LocationErrorCodes.LOCATION_HAS_VENUES,
        `Cannot delete location with ${venueCount} venue(s). Delete venues first.`,
      );
    }

    const collegeCount = await getCollegeStore().countByLocation(id);
    if (collegeCount > 0) {
      throw new LocationError(
        LocationErrorCodes.LOCATION_HAS_COLLEGES,
        `Cannot delete location with ${collegeCount} college(s). Delete colleges first.`,
      );
    }

    await this.repository.delete(id);
    return { deleted: true, id };
  }

  async getLocalTime(
    id: string,
    isoUtc?: string,
  ): Promise<LocationLocalTimeOutput> {
    const location = await this.get(id);
    const sourceIsoUtc =
      isoUtc === undefined
        ? getWorldClockService().getCurrentOutput().isoUtc
        : parseIsoUtc(isoUtc);

    return {
      locationId: location.id,
      locationName: location.name,
      countryId: location.countryId,
      countryName: location.countryName,
      timezone: location.timezone,
      isoUtc: sourceIsoUtc,
      local: utcToLocalTime(sourceIsoUtc, location.timezone),
    };
  }

  async clear(): Promise<void> {
    await this.repository.clear();
  }
}

const globalForLocations = globalThis as typeof globalThis & {
  __locationStore?: LocationStore;
};

export function getLocationStore(): LocationStore {
  if (!globalForLocations.__locationStore) {
    globalForLocations.__locationStore = new LocationStore(
      getDefaultLocationRepository(),
    );
  }
  return globalForLocations.__locationStore;
}

export function resetLocationStore(
  repository?: LocationRepository,
): LocationStore {
  const store = new LocationStore(
    repository ?? getDefaultLocationRepository(),
  );
  globalForLocations.__locationStore = store;
  return store;
}

export async function executeLocation(
  input: LocationInput,
): Promise<LocationOutput> {
  const store = getLocationStore();

  switch (input.action) {
    case "create":
      return store.create(input);

    case "get":
      return store.get(validateId(input.id));

    case "delete":
      return store.delete(validateId(input.id));

    case "localTime":
      return store.getLocalTime(validateId(input.id), input.isoUtc);

    default: {
      const unknownAction = (input as { action: string }).action;
      throw new LocationError(
        LocationErrorCodes.INVALID_ACTION,
        `Unknown action: ${unknownAction}`,
      );
    }
  }
}

export async function listLocations(): Promise<Location[]> {
  return getLocationStore().list();
}

export * from "./types";
export * from "./errors";
export {
  buildLocation,
  localTimeToIsoUtc,
  parseIsoUtc,
  utcToLocalTime,
  validateCountryId,
  validateLocationCreateInput,
  validateLatitude,
  validateLongitude,
  validateName,
  validatePopulation,
  validateRegion,
  validateTimezone,
} from "./transform";
