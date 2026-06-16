import {
  validateLatitude,
  validateLongitude,
  validateName,
} from "@/modules/locations";
import { VenueError, VenueErrorCodes } from "./errors";
import type { Venue, VenueResourceType, VenueSchedulingMode } from "./types";

const SCHEDULING_MODES = new Set<VenueSchedulingMode>([
  "exclusive",
  "multi_resource",
]);

const RESOURCE_TYPES = new Set<VenueResourceType>([
  "court",
  "tee_group",
  "lane",
  "generic",
]);

export function validateSchedulingMode(
  schedulingMode: unknown,
): VenueSchedulingMode {
  if (schedulingMode === undefined || schedulingMode === null) {
    return "exclusive";
  }

  if (
    typeof schedulingMode !== "string" ||
    !SCHEDULING_MODES.has(schedulingMode as VenueSchedulingMode)
  ) {
    throw new VenueError(
      VenueErrorCodes.INVALID_SCHEDULING_MODE,
      'schedulingMode must be "exclusive" or "multi_resource"',
    );
  }

  return schedulingMode as VenueSchedulingMode;
}

export function validateResourceType(
  resourceType: unknown,
): VenueResourceType {
  if (resourceType === undefined || resourceType === null) {
    return "generic";
  }

  if (
    typeof resourceType !== "string" ||
    !RESOURCE_TYPES.has(resourceType as VenueResourceType)
  ) {
    throw new VenueError(
      VenueErrorCodes.INVALID_RESOURCE_TYPE,
      'resourceType must be "court", "tee_group", "lane", or "generic"',
    );
  }

  return resourceType as VenueResourceType;
}

export function validateId(id: unknown): string {
  if (typeof id !== "string" || id.trim().length === 0) {
    throw new VenueError(
      VenueErrorCodes.MISSING_ID,
      "id is required",
    );
  }

  return id.trim();
}

export function validateLocationId(locationId: unknown): string {
  if (typeof locationId !== "string" || locationId.trim().length === 0) {
    throw new VenueError(
      VenueErrorCodes.MISSING_LOCATION_ID,
      "locationId is required",
    );
  }

  return locationId.trim();
}

export function validateIsIndoor(isIndoor: unknown): boolean {
  if (typeof isIndoor !== "boolean") {
    throw new VenueError(
      VenueErrorCodes.INVALID_IS_INDOOR,
      "isIndoor must be a boolean",
    );
  }

  return isIndoor;
}

export function buildVenue(
  input: {
    locationId: unknown;
    name: unknown;
    latitude: unknown;
    longitude: unknown;
    isIndoor: unknown;
    schedulingMode?: unknown;
  },
  id: string,
): Venue {
  return {
    id,
    locationId: validateLocationId(input.locationId),
    name: validateVenueName(input.name),
    latitude: validateLatitude(input.latitude),
    longitude: validateLongitude(input.longitude),
    isIndoor: validateIsIndoor(input.isIndoor),
    schedulingMode: validateSchedulingMode(input.schedulingMode),
  };
}

function validateVenueName(name: unknown): string {
  try {
    return validateName(name);
  } catch (error) {
    if (error instanceof Error && "code" in error) {
      throw new VenueError(
        VenueErrorCodes.INVALID_NAME,
        error.message,
      );
    }
    throw error;
  }
}
