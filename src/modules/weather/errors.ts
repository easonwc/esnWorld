export class WeatherError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "WeatherError";
    this.code = code;
  }
}

export const WeatherErrorCodes = {
  INVALID_ACTION: "INVALID_ACTION",
  INVALID_UNITS: "INVALID_UNITS",
  INVALID_SEED: "INVALID_SEED",
  MISSING_VENUE_ID: "MISSING_VENUE_ID",
  MISSING_LOCATION_ID: "MISSING_LOCATION_ID",
  MISSING_EVENT_ID: "MISSING_EVENT_ID",
  VENUE_NOT_FOUND: "VENUE_NOT_FOUND",
  LOCATION_NOT_FOUND: "LOCATION_NOT_FOUND",
  EVENT_NOT_FOUND: "EVENT_NOT_FOUND",
  INVALID_ISO_UTC: "INVALID_ISO_UTC",
} as const;
