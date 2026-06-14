import {
  validateLatitude,
  validateLongitude,
  validateName,
} from "@/modules/locations";
import { VenueError, VenueErrorCodes } from "./errors";
import type { Venue } from "./types";

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
