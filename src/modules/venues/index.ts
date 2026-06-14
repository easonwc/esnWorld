import { getWorldClockService } from "@/modules/world-clock";
import {
  getLocationStore,
  LocationError,
  LocationErrorCodes,
  parseIsoUtc,
  utcToLocalTime,
} from "@/modules/locations";
import {
  getDefaultVenueRepository,
  type VenueRepository,
} from "@/persistence/repositories";
import { VenueError, VenueErrorCodes } from "./errors";
import { buildVenue, validateId, validateLocationId } from "./transform";
import type {
  Venue,
  VenueInput,
  VenueLocalTimeOutput,
  VenueOutput,
} from "./types";

export class VenueStore {
  constructor(private readonly repository: VenueRepository) {}

  async list(): Promise<Venue[]> {
    return this.repository.list();
  }

  async listByLocation(locationId: string): Promise<Venue[]> {
    const id = validateLocationId(locationId);
    await getLocationStore().get(id);
    return this.repository.listByLocation(id);
  }

  async countByLocation(locationId: string): Promise<number> {
    return this.repository.countByLocation(locationId);
  }

  async get(id: string): Promise<Venue> {
    const venue = await this.repository.get(id);

    if (!venue) {
      throw new VenueError(
        VenueErrorCodes.VENUE_NOT_FOUND,
        `Venue not found: ${id}`,
      );
    }

    return venue;
  }

  async create(input: {
    locationId: unknown;
    name: unknown;
    latitude: unknown;
    longitude: unknown;
    isIndoor: unknown;
  }): Promise<Venue> {
    const venueId = crypto.randomUUID();
    const venue = buildVenue(input, venueId);

    try {
      await getLocationStore().get(venue.locationId);
    } catch (error) {
      if (error instanceof LocationError) {
        throw new VenueError(
          VenueErrorCodes.LOCATION_NOT_FOUND,
          error.message,
        );
      }
      throw error;
    }

    return this.repository.create(venue);
  }

  async delete(id: string): Promise<{ deleted: true; id: string }> {
    validateId(id);

    const venue = await this.repository.get(id);
    if (!venue) {
      throw new VenueError(
        VenueErrorCodes.VENUE_NOT_FOUND,
        `Venue not found: ${id}`,
      );
    }

    await this.repository.delete(id);
    return { deleted: true, id };
  }

  async getLocalTime(
    id: string,
    isoUtc?: string,
  ): Promise<VenueLocalTimeOutput> {
    const venue = await this.get(id);
    const location = await getLocationStore().get(venue.locationId);
    const sourceIsoUtc =
      isoUtc === undefined
        ? getWorldClockService().getCurrentOutput().isoUtc
        : parseIsoUtc(isoUtc);

    return {
      venueId: venue.id,
      venueName: venue.name,
      locationId: location.id,
      locationName: location.name,
      country: location.countryName,
      timezone: location.timezone,
      isoUtc: sourceIsoUtc,
      local: utcToLocalTime(sourceIsoUtc, location.timezone),
    };
  }

  async clear(): Promise<void> {
    await this.repository.clear();
  }
}

const globalForVenues = globalThis as typeof globalThis & {
  __venueStore?: VenueStore;
};

export function getVenueStore(): VenueStore {
  if (!globalForVenues.__venueStore) {
    globalForVenues.__venueStore = new VenueStore(getDefaultVenueRepository());
  }
  return globalForVenues.__venueStore;
}

export function resetVenueStore(repository?: VenueRepository): VenueStore {
  const store = new VenueStore(repository ?? getDefaultVenueRepository());
  globalForVenues.__venueStore = store;
  return store;
}

export async function executeVenue(input: VenueInput): Promise<VenueOutput> {
  const store = getVenueStore();

  switch (input.action) {
    case "create":
      return store.create(input);

    case "get":
      return store.get(validateId(input.id));

    case "delete":
      return store.delete(validateId(input.id));

    case "listByLocation":
      return store.listByLocation(validateLocationId(input.locationId));

    case "localTime":
      return store.getLocalTime(validateId(input.id), input.isoUtc);

    default: {
      const unknownAction = (input as { action: string }).action;
      throw new VenueError(
        VenueErrorCodes.INVALID_ACTION,
        `Unknown action: ${unknownAction}`,
      );
    }
  }
}

export async function listVenues(): Promise<Venue[]> {
  return getVenueStore().list();
}

export * from "./types";
export * from "./errors";
export { buildVenue, validateId, validateIsIndoor, validateLocationId } from "./transform";
