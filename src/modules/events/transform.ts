import { transformCalendar } from "@/modules/calendar";
import {
  localTimeToIsoUtc,
  validateName,
  type LocalDateTimeInput,
} from "@/modules/locations";
import { EventError, EventErrorCodes } from "./errors";
import type { EventLocalStartInput, EventRecord, EventStatus } from "./types";

export function validateId(id: unknown): string {
  if (typeof id !== "string" || id.trim().length === 0) {
    throw new EventError(
      EventErrorCodes.MISSING_ID,
      "id is required",
    );
  }

  return id.trim();
}

export function validateVenueId(venueId: unknown): string {
  if (typeof venueId !== "string" || venueId.trim().length === 0) {
    throw new EventError(
      EventErrorCodes.MISSING_VENUE_ID,
      "venueId is required",
    );
  }

  return venueId.trim();
}

export function validateEventName(name: unknown): string {
  try {
    return validateName(name);
  } catch (error) {
    if (error instanceof Error) {
      throw new EventError(EventErrorCodes.INVALID_NAME, error.message);
    }
    throw error;
  }
}

export function validateLocalStart(localStart: unknown): LocalDateTimeInput {
  if (!localStart || typeof localStart !== "object") {
    throw new EventError(
      EventErrorCodes.INVALID_LOCAL_START,
      "localStart is required",
    );
  }

  const input = localStart as EventLocalStartInput;

  try {
    transformCalendar({
      action: "fromDate",
      year: input.year,
      month: input.month,
      day: input.day,
      hour: input.hour,
      minute: input.minute,
      second: input.second ?? 0,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new EventError(
        EventErrorCodes.INVALID_LOCAL_START,
        error.message,
      );
    }
    throw error;
  }

  return {
    year: input.year,
    month: input.month,
    day: input.day,
    hour: input.hour,
    minute: input.minute,
    second: input.second ?? 0,
  };
}

export function validateDurationMinutes(durationMinutes: unknown): number {
  if (
    typeof durationMinutes !== "number" ||
    !Number.isFinite(durationMinutes)
  ) {
    throw new EventError(
      EventErrorCodes.INVALID_DURATION,
      "durationMinutes must be a finite number",
    );
  }

  if (durationMinutes <= 0 || !Number.isInteger(durationMinutes)) {
    throw new EventError(
      EventErrorCodes.INVALID_DURATION,
      "durationMinutes must be a positive integer",
    );
  }

  return durationMinutes;
}

export function computeEventStatus(
  isoUtc: string,
  isoUtcStart: string,
  isoUtcEnd: string,
): EventStatus {
  const now = Date.parse(isoUtc);
  const start = Date.parse(isoUtcStart);
  const end = Date.parse(isoUtcEnd);

  if (now < start) {
    return "upcoming";
  }

  if (now >= start && now < end) {
    return "active";
  }

  return "ended";
}

export function buildEventRecord(
  input: {
    name: unknown;
    venueId: unknown;
    localStart: unknown;
    durationMinutes: unknown;
  },
  timezone: string,
  id: string,
): EventRecord {
  const localStart = validateLocalStart(input.localStart);
  const durationMinutes = validateDurationMinutes(input.durationMinutes);
  const isoUtcStart = localTimeToIsoUtc(localStart, timezone);
  const isoUtcEnd = new Date(
    Date.parse(isoUtcStart) + durationMinutes * 60_000,
  ).toISOString();

  return {
    id,
    name: validateEventName(input.name),
    venueId: validateVenueId(input.venueId),
    localStart: {
      year: localStart.year,
      month: localStart.month,
      day: localStart.day,
      hour: localStart.hour,
      minute: localStart.minute,
      second: localStart.second ?? 0,
    },
    isoUtcStart,
    durationMinutes,
    isoUtcEnd,
  };
}

export function isEventActiveAt(
  event: EventRecord,
  isoUtc: string,
): boolean {
  const now = Date.parse(isoUtc);
  return now >= Date.parse(event.isoUtcStart) && now < Date.parse(event.isoUtcEnd);
}
