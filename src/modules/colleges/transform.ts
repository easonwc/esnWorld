import { validateName } from "@/modules/locations";
import { CollegeError, CollegeErrorCodes } from "./errors";
import type { College } from "./types";

export function validateId(id: unknown): string {
  if (typeof id !== "string" || id.trim().length === 0) {
    throw new CollegeError(CollegeErrorCodes.MISSING_ID, "id is required");
  }

  return id.trim();
}

export function validateLocationId(locationId: unknown): string {
  if (typeof locationId !== "string" || locationId.trim().length === 0) {
    throw new CollegeError(
      CollegeErrorCodes.INVALID_LOCATION_ID,
      "locationId is required",
    );
  }

  return locationId.trim();
}

export function validateAttendance(attendance: unknown): number {
  if (typeof attendance !== "number" || !Number.isFinite(attendance)) {
    throw new CollegeError(
      CollegeErrorCodes.INVALID_ATTENDANCE,
      "attendance must be a finite number",
    );
  }

  if (attendance < 0 || !Number.isInteger(attendance)) {
    throw new CollegeError(
      CollegeErrorCodes.INVALID_ATTENDANCE,
      "attendance must be a non-negative integer",
    );
  }

  return attendance;
}

function validateCollegeName(name: unknown): string {
  try {
    return validateName(name);
  } catch (error) {
    if (error instanceof Error) {
      throw new CollegeError(CollegeErrorCodes.INVALID_NAME, error.message);
    }
    throw error;
  }
}

export function buildCollege(
  input: {
    name: unknown;
    locationId: unknown;
    attendance: unknown;
  },
  id: string,
  locationName: string,
  locationRegion: string | null,
  logo = "",
): College {
  return {
    id,
    name: validateCollegeName(input.name),
    locationId: validateLocationId(input.locationId),
    locationName: locationName.trim(),
    locationRegion,
    attendance: validateAttendance(input.attendance),
    logo,
  };
}
