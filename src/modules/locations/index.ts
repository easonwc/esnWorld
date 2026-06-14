import { getWorldClockService } from "@/modules/world-clock";
import { getVenueStore } from "@/modules/venues";
import { LocationError, LocationErrorCodes } from "./errors";
import {
  buildLocation,
  parseIsoUtc,
  utcToLocalTime,
  validateId,
} from "./transform";
import type {
  Location,
  LocationInput,
  LocationLocalTimeOutput,
  LocationOutput,
} from "./types";

export class LocationStore {
  private readonly locations = new Map<string, Location>();

  list(): Location[] {
    return [...this.locations.values()].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }

  get(id: string): Location {
    const location = this.locations.get(id);

    if (!location) {
      throw new LocationError(
        LocationErrorCodes.LOCATION_NOT_FOUND,
        `Location not found: ${id}`,
      );
    }

    return location;
  }

  create(input: {
    name: unknown;
    country: unknown;
    latitude: unknown;
    longitude: unknown;
    timezone: unknown;
    population: unknown;
  }): Location {
    const id = crypto.randomUUID();
    const location = buildLocation(input, id);
    this.locations.set(id, location);
    return location;
  }

  delete(id: string): { deleted: true; id: string } {
    validateId(id);

    if (!this.locations.has(id)) {
      throw new LocationError(
        LocationErrorCodes.LOCATION_NOT_FOUND,
        `Location not found: ${id}`,
      );
    }

    const venueCount = getVenueStore().countByLocation(id);
    if (venueCount > 0) {
      throw new LocationError(
        LocationErrorCodes.LOCATION_HAS_VENUES,
        `Cannot delete location with ${venueCount} venue(s). Delete venues first.`,
      );
    }

    this.locations.delete(id);
    return { deleted: true, id };
  }

  getLocalTime(id: string, isoUtc?: string): LocationLocalTimeOutput {
    const location = this.get(id);
    const sourceIsoUtc =
      isoUtc === undefined
        ? getWorldClockService().getCurrentOutput().isoUtc
        : parseIsoUtc(isoUtc);

    return {
      locationId: location.id,
      locationName: location.name,
      country: location.country,
      timezone: location.timezone,
      isoUtc: sourceIsoUtc,
      local: utcToLocalTime(sourceIsoUtc, location.timezone),
    };
  }

  clear(): void {
    this.locations.clear();
  }
}

const globalForLocations = globalThis as typeof globalThis & {
  __locationStore?: LocationStore;
};

export function getLocationStore(): LocationStore {
  if (!globalForLocations.__locationStore) {
    globalForLocations.__locationStore = new LocationStore();
  }
  return globalForLocations.__locationStore;
}

export function resetLocationStore(): LocationStore {
  const store = new LocationStore();
  globalForLocations.__locationStore = store;
  return store;
}

export function executeLocation(input: LocationInput): LocationOutput {
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

export function listLocations(): Location[] {
  return getLocationStore().list();
}

export * from "./types";
export * from "./errors";
export {
  buildLocation,
  parseIsoUtc,
  utcToLocalTime,
  validateCountry,
  validateLatitude,
  validateLongitude,
  validateName,
  validatePopulation,
  validateTimezone,
} from "./transform";
