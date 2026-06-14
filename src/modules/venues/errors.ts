export class VenueError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "VenueError";
    this.code = code;
  }
}

export const VenueErrorCodes = {
  INVALID_ACTION: "INVALID_ACTION",
  INVALID_NAME: "INVALID_NAME",
  INVALID_LATITUDE: "INVALID_LATITUDE",
  INVALID_LONGITUDE: "INVALID_LONGITUDE",
  INVALID_ID: "INVALID_ID",
  MISSING_ID: "MISSING_ID",
  MISSING_LOCATION_ID: "MISSING_LOCATION_ID",
  VENUE_NOT_FOUND: "VENUE_NOT_FOUND",
  LOCATION_NOT_FOUND: "LOCATION_NOT_FOUND",
  INVALID_ISO_UTC: "INVALID_ISO_UTC",
} as const;
