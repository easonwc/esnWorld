import { LocationError, LocationErrorCodes } from "./errors";
import type { LocalTimeParts, Location } from "./types";

const ISO_UTC_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;

const WEEKDAY_TO_INDEX: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

export function validateName(name: unknown): string {
  if (typeof name !== "string" || name.trim().length === 0) {
    throw new LocationError(
      LocationErrorCodes.INVALID_NAME,
      "name must be a non-empty string",
    );
  }

  if (name.trim().length > 200) {
    throw new LocationError(
      LocationErrorCodes.INVALID_NAME,
      "name must be 200 characters or fewer",
    );
  }

  return name.trim();
}

export function validateLatitude(latitude: unknown): number {
  if (typeof latitude !== "number" || !Number.isFinite(latitude)) {
    throw new LocationError(
      LocationErrorCodes.INVALID_LATITUDE,
      "latitude must be a finite number",
    );
  }

  if (latitude < -90 || latitude > 90) {
    throw new LocationError(
      LocationErrorCodes.INVALID_LATITUDE,
      "latitude must be between -90 and 90",
    );
  }

  return latitude;
}

export function validateLongitude(longitude: unknown): number {
  if (typeof longitude !== "number" || !Number.isFinite(longitude)) {
    throw new LocationError(
      LocationErrorCodes.INVALID_LONGITUDE,
      "longitude must be a finite number",
    );
  }

  if (longitude < -180 || longitude > 180) {
    throw new LocationError(
      LocationErrorCodes.INVALID_LONGITUDE,
      "longitude must be between -180 and 180",
    );
  }

  return longitude;
}

export function validateTimezone(timezone: unknown): string {
  if (typeof timezone !== "string" || timezone.trim().length === 0) {
    throw new LocationError(
      LocationErrorCodes.INVALID_TIMEZONE,
      "timezone must be a non-empty IANA timezone string",
    );
  }

  const tz = timezone.trim();

  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
  } catch {
    throw new LocationError(
      LocationErrorCodes.INVALID_TIMEZONE,
      `timezone is not a valid IANA timezone: ${tz}`,
    );
  }

  return tz;
}

export function validateCountry(country: unknown): string {
  if (typeof country !== "string" || country.trim().length === 0) {
    throw new LocationError(
      LocationErrorCodes.INVALID_COUNTRY,
      "country must be a non-empty string",
    );
  }

  if (country.trim().length > 100) {
    throw new LocationError(
      LocationErrorCodes.INVALID_COUNTRY,
      "country must be 100 characters or fewer",
    );
  }

  return country.trim();
}

export function validatePopulation(population: unknown): number {
  if (typeof population !== "number" || !Number.isFinite(population)) {
    throw new LocationError(
      LocationErrorCodes.INVALID_POPULATION,
      "population must be a finite number",
    );
  }

  if (population < 0 || !Number.isInteger(population)) {
    throw new LocationError(
      LocationErrorCodes.INVALID_POPULATION,
      "population must be a non-negative integer",
    );
  }

  return population;
}

export function validateId(id: unknown): string {
  if (typeof id !== "string" || id.trim().length === 0) {
    throw new LocationError(
      LocationErrorCodes.MISSING_ID,
      "id is required",
    );
  }

  return id.trim();
}

export function parseIsoUtc(isoUtc: string): string {
  if (!ISO_UTC_PATTERN.test(isoUtc)) {
    throw new LocationError(
      LocationErrorCodes.INVALID_ISO_UTC,
      `isoUtc must be a valid UTC ISO 8601 string ending with Z, received: ${isoUtc}`,
    );
  }

  const epochMs = Date.parse(isoUtc);

  if (Number.isNaN(epochMs)) {
    throw new LocationError(
      LocationErrorCodes.INVALID_ISO_UTC,
      `isoUtc could not be parsed as a valid datetime: ${isoUtc}`,
    );
  }

  return new Date(epochMs).toISOString();
}

export function buildLocation(
  input: {
    name: unknown;
    country: unknown;
    latitude: unknown;
    longitude: unknown;
    timezone: unknown;
    population: unknown;
  },
  id: string,
): Location {
  return {
    id,
    name: validateName(input.name),
    country: validateCountry(input.country),
    latitude: validateLatitude(input.latitude),
    longitude: validateLongitude(input.longitude),
    timezone: validateTimezone(input.timezone),
    population: validatePopulation(input.population),
  };
}

export function utcToLocalTime(isoUtc: string, timezone: string): LocalTimeParts {
  validateTimezone(timezone);
  const normalized = parseIsoUtc(isoUtc);
  const date = new Date(normalized);

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "long",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const weekdayName = get("weekday");
  let hour = Number(get("hour"));

  if (hour === 24) {
    hour = 0;
  }

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour,
    minute: Number(get("minute")),
    second: Number(get("second")),
    weekday: WEEKDAY_TO_INDEX[weekdayName] ?? 0,
    weekdayName,
  };
}
