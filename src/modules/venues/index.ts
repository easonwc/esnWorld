import { getWorldClockService } from "@/modules/world-clock";
import {
  getLocationStore,
  LocationError,
  LocationErrorCodes,
  parseIsoUtc,
  utcToLocalTime,
} from "@/modules/locations";
import {
  getDefaultTeamRepository,
  getDefaultVenueRepository,
  getDefaultVenueResourceRepository,
  type VenueRepository,
  type VenueResourceRepository,
} from "@/persistence/repositories";
import type { ListOptions } from "@/lib/pagination";
import { VenueError, VenueErrorCodes } from "./errors";
import {
  buildVenue,
  validateId,
  validateLocationId,
  validateResourceType,
} from "./transform";
import type {
  Venue,
  VenueInput,
  VenueLocalTimeOutput,
  VenueOutput,
  VenueResource,
} from "./types";

function validateVenueIdInput(venueId: unknown): string {
  if (typeof venueId !== "string" || venueId.trim().length === 0) {
    throw new VenueError(
      VenueErrorCodes.MISSING_VENUE_ID,
      "venueId is required",
    );
  }

  return venueId.trim();
}

export class VenueStore {
  constructor(
    private readonly repository: VenueRepository,
    private readonly resourceRepository: VenueResourceRepository,
  ) {}

  async list(options?: ListOptions): Promise<Venue[]> {
    return this.repository.list(options);
  }

  async count(): Promise<number> {
    return this.repository.count();
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
    schedulingMode?: unknown;
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

    const teamCount = await getDefaultTeamRepository().countByVenue(id);
    if (teamCount > 0) {
      throw new VenueError(
        VenueErrorCodes.VENUE_HAS_TEAMS,
        `Cannot delete venue with ${teamCount} team(s). Delete teams first.`,
      );
    }

    await this.repository.delete(id);
    return { deleted: true, id };
  }

  async createResource(input: {
    venueId: unknown;
    name: unknown;
    resourceType?: unknown;
  }): Promise<VenueResource> {
    const venueId = validateVenueIdInput(input.venueId);
    const venue = await this.get(venueId);

    if (venue.schedulingMode !== "multi_resource") {
      throw new VenueError(
        VenueErrorCodes.INVALID_SCHEDULING_MODE,
        "Venue resources can only be added to multi_resource venues",
      );
    }

    const resource: VenueResource = {
      id: crypto.randomUUID(),
      venueId: venue.id,
      name: validateResourceName(input.name),
      resourceType: validateResourceType(input.resourceType),
    };

    return this.resourceRepository.create(resource);
  }

  async listResources(venueId: string): Promise<VenueResource[]> {
    await this.get(validateVenueIdInput(venueId));
    return this.resourceRepository.listByVenue(venueId);
  }

  async getResource(id: string): Promise<VenueResource> {
    const resource = await this.resourceRepository.get(validateId(id));
    if (!resource) {
      throw new VenueError(
        VenueErrorCodes.RESOURCE_NOT_FOUND,
        `Venue resource not found: ${id}`,
      );
    }
    return resource;
  }

  async deleteResource(id: string): Promise<{ deleted: true; id: string }> {
    const normalizedId = validateId(id);
    const resource = await this.resourceRepository.get(normalizedId);
    if (!resource) {
      throw new VenueError(
        VenueErrorCodes.RESOURCE_NOT_FOUND,
        `Venue resource not found: ${normalizedId}`,
      );
    }

    await this.resourceRepository.delete(normalizedId);
    return { deleted: true, id: normalizedId };
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
    await this.resourceRepository.clear();
    await this.repository.clear();
  }
}

function validateResourceName(name: unknown): string {
  if (typeof name !== "string" || name.trim().length === 0) {
    throw new VenueError(
      VenueErrorCodes.INVALID_NAME,
      "name is required",
    );
  }
  return name.trim();
}

const globalForVenues = globalThis as typeof globalThis & {
  __venueStore?: VenueStore;
};

export function getVenueStore(): VenueStore {
  if (!globalForVenues.__venueStore) {
    globalForVenues.__venueStore = new VenueStore(
      getDefaultVenueRepository(),
      getDefaultVenueResourceRepository(),
    );
  }
  return globalForVenues.__venueStore;
}

export function resetVenueStore(
  repository?: VenueRepository,
  resourceRepository?: VenueResourceRepository,
): VenueStore {
  const store = new VenueStore(
    repository ?? getDefaultVenueRepository(),
    resourceRepository ?? getDefaultVenueResourceRepository(),
  );
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

    case "createResource":
      return store.createResource(input);

    case "listResources":
      return store.listResources(validateVenueIdInput(input.venueId));

    case "getResource":
      return store.getResource(validateId(input.id));

    case "deleteResource":
      return store.deleteResource(validateId(input.id));

    default: {
      const unknownAction = (input as { action: string }).action;
      throw new VenueError(
        VenueErrorCodes.INVALID_ACTION,
        `Unknown action: ${unknownAction}`,
      );
    }
  }
}

export async function listVenues(options?: ListOptions): Promise<Venue[]> {
  return getVenueStore().list(options);
}

export async function countVenues(): Promise<number> {
  return getVenueStore().count();
}

export * from "./types";
export * from "./errors";
export {
  buildVenue,
  validateId,
  validateIsIndoor,
  validateLocationId,
  validateResourceType,
  validateSchedulingMode,
} from "./transform";
