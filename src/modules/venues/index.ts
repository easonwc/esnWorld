import { getWorldClockService } from "@/modules/world-clock";
import {
  getLocationStore,
  LocationError,
  LocationErrorCodes,
  parseIsoUtc,
  utcToLocalTime,
} from "@/modules/locations";
import { VenueError, VenueErrorCodes } from "./errors";
import { buildVenue, validateId, validateLocationId } from "./transform";
import type {
  Venue,
  VenueInput,
  VenueLocalTimeOutput,
  VenueOutput,
} from "./types";

export class VenueStore {
  private readonly venues = new Map<string, Venue>();

  list(): Venue[] {
    return [...this.venues.values()].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }

  listByLocation(locationId: string): Venue[] {
    const id = validateLocationId(locationId);
    getLocationStore().get(id);

    return [...this.venues.values()]
      .filter((venue) => venue.locationId === id)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  countByLocation(locationId: string): number {
    return [...this.venues.values()].filter(
      (venue) => venue.locationId === locationId,
    ).length;
  }

  get(id: string): Venue {
    const venue = this.venues.get(id);

    if (!venue) {
      throw new VenueError(
        VenueErrorCodes.VENUE_NOT_FOUND,
        `Venue not found: ${id}`,
      );
    }

    return venue;
  }

  create(input: {
    locationId: unknown;
    name: unknown;
    latitude: unknown;
    longitude: unknown;
    isIndoor: unknown;
  }): Venue {
    const locationStore = getLocationStore();
    const venueId = crypto.randomUUID();
    const venue = buildVenue(input, venueId);

    try {
      locationStore.get(venue.locationId);
    } catch (error) {
      if (error instanceof LocationError) {
        throw new VenueError(
          VenueErrorCodes.LOCATION_NOT_FOUND,
          error.message,
        );
      }
      throw error;
    }

    this.venues.set(venueId, venue);
    return venue;
  }

  delete(id: string): { deleted: true; id: string } {
    validateId(id);

    if (!this.venues.has(id)) {
      throw new VenueError(
        VenueErrorCodes.VENUE_NOT_FOUND,
        `Venue not found: ${id}`,
      );
    }

    this.venues.delete(id);
    return { deleted: true, id };
  }

  getLocalTime(id: string, isoUtc?: string): VenueLocalTimeOutput {
    const venue = this.get(id);
    const location = getLocationStore().get(venue.locationId);
    const sourceIsoUtc =
      isoUtc === undefined
        ? getWorldClockService().getCurrentOutput().isoUtc
        : parseIsoUtc(isoUtc);

    return {
      venueId: venue.id,
      venueName: venue.name,
      locationId: location.id,
      locationName: location.name,
      country: location.country,
      timezone: location.timezone,
      isoUtc: sourceIsoUtc,
      local: utcToLocalTime(sourceIsoUtc, location.timezone),
    };
  }

  clear(): void {
    this.venues.clear();
  }
}

const globalForVenues = globalThis as typeof globalThis & {
  __venueStore?: VenueStore;
};

export function getVenueStore(): VenueStore {
  if (!globalForVenues.__venueStore) {
    globalForVenues.__venueStore = new VenueStore();
  }
  return globalForVenues.__venueStore;
}

export function resetVenueStore(): VenueStore {
  const store = new VenueStore();
  globalForVenues.__venueStore = store;
  return store;
}

export function executeVenue(input: VenueInput): VenueOutput {
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

export function listVenues(): Venue[] {
  return getVenueStore().list();
}

export * from "./types";
export * from "./errors";
export { buildVenue, validateId, validateIsIndoor, validateLocationId } from "./transform";
