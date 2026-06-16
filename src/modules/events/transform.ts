import { transformCalendar } from "@/modules/calendar";
import {
  localTimeToIsoUtc,
  validateName,
  type LocalDateTimeInput,
} from "@/modules/locations";
import { EventError, EventErrorCodes } from "./errors";
import type { EventLocalStartInput, EventRecord, EventStatus } from "./types";
import type { VenueSchedulingMode } from "@/modules/venues/types";

export function validateId(id: unknown): string {
  if (typeof id !== "string" || id.trim().length === 0) {
    throw new EventError(
      EventErrorCodes.MISSING_ID,
      "id is required",
    );
  }

  return id.trim();
}

export function validateOptionalParentId(parentId: unknown): string | null {
  if (parentId === undefined || parentId === null) {
    return null;
  }

  return validateId(parentId);
}

export function validateChildWithinParent(
  child: Pick<EventRecord, "venueId" | "isoUtcStart" | "isoUtcEnd">,
  parent: EventRecord,
): void {
  if (child.venueId !== parent.venueId) {
    throw new EventError(
      EventErrorCodes.PARENT_VENUE_MISMATCH,
      "Child event venue must match parent event venue",
    );
  }

  const childStart = Date.parse(child.isoUtcStart);
  const childEnd = Date.parse(child.isoUtcEnd);
  const parentStart = Date.parse(parent.isoUtcStart);
  const parentEnd = Date.parse(parent.isoUtcEnd);

  if (childStart < parentStart || childEnd > parentEnd) {
    throw new EventError(
      EventErrorCodes.PARENT_TIME_CONTAINMENT,
      "Child event must start and end within the parent event time window",
    );
  }
}

export function validateOptionalVenueResourceId(
  venueResourceId: unknown,
): string | null {
  if (venueResourceId === undefined || venueResourceId === null) {
    return null;
  }

  return validateId(venueResourceId);
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
    parentId?: unknown;
    venueResourceId?: unknown;
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
    venueResourceId: validateOptionalVenueResourceId(input.venueResourceId),
    parentId: validateOptionalParentId(input.parentId),
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

export function applyEventScheduleUpdate(
  existing: EventRecord,
  input: {
    name?: unknown;
    localStart?: unknown;
    durationMinutes?: unknown;
  },
  timezone: string,
): EventRecord {
  const name =
    input.name !== undefined
      ? validateEventName(input.name)
      : existing.name;

  const localStartInput =
    input.localStart !== undefined
      ? validateLocalStart(input.localStart)
      : existing.localStart;

  const durationMinutes =
    input.durationMinutes !== undefined
      ? validateDurationMinutes(input.durationMinutes)
      : existing.durationMinutes;

  const isoUtcStart = localTimeToIsoUtc(localStartInput, timezone);
  const isoUtcEnd = new Date(
    Date.parse(isoUtcStart) + durationMinutes * 60_000,
  ).toISOString();

  return {
    ...existing,
    name,
    localStart: {
      year: localStartInput.year,
      month: localStartInput.month,
      day: localStartInput.day,
      hour: localStartInput.hour,
      minute: localStartInput.minute,
      second: localStartInput.second ?? 0,
    },
    durationMinutes,
    isoUtcStart,
    isoUtcEnd,
  };
}

export function collectDescendantIds(
  eventId: string,
  eventsById: ReadonlyMap<string, EventRecord>,
): Set<string> {
  const descendants = new Set<string>();
  const queue = [eventId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    for (const event of eventsById.values()) {
      if (event.parentId === currentId && !descendants.has(event.id)) {
        descendants.add(event.id);
        queue.push(event.id);
      }
    }
  }

  return descendants;
}

export function assertParentContainsChildren(
  parent: EventRecord,
  children: readonly EventRecord[],
): void {
  const parentStart = Date.parse(parent.isoUtcStart);
  const parentEnd = Date.parse(parent.isoUtcEnd);

  for (const child of children) {
    const childStart = Date.parse(child.isoUtcStart);
    const childEnd = Date.parse(child.isoUtcEnd);

    if (childStart < parentStart || childEnd > parentEnd) {
      throw new EventError(
        EventErrorCodes.CHILD_TIME_CONTAINMENT,
        `Cannot reschedule parent: child "${child.name}" would fall outside the new window`,
      );
    }
  }
}

export function eventsOverlap(
  left: Pick<EventRecord, "isoUtcStart" | "isoUtcEnd">,
  right: Pick<EventRecord, "isoUtcStart" | "isoUtcEnd">,
): boolean {
  const leftStart = Date.parse(left.isoUtcStart);
  const leftEnd = Date.parse(left.isoUtcEnd);
  const rightStart = Date.parse(right.isoUtcStart);
  const rightEnd = Date.parse(right.isoUtcEnd);

  return leftStart < rightEnd && rightStart < leftEnd;
}

export function collectAncestorIds(
  event: Pick<EventRecord, "parentId">,
  eventsById: ReadonlyMap<string, EventRecord>,
): Set<string> {
  const ancestors = new Set<string>();
  let parentId = event.parentId;

  while (parentId) {
    ancestors.add(parentId);
    const parent = eventsById.get(parentId);
    if (!parent) {
      break;
    }
    parentId = parent.parentId;
  }

  return ancestors;
}

export function assertNoVenueScheduleConflict(
  event: EventRecord,
  eventsAtVenue: readonly EventRecord[],
  eventsById: ReadonlyMap<string, EventRecord>,
  venueSchedulingMode: VenueSchedulingMode,
  additionalExemptIds: ReadonlySet<string> = new Set(),
): void {
  const ancestorIds = collectAncestorIds(event, eventsById);
  const exemptIds = new Set([
    event.id,
    ...ancestorIds,
    ...additionalExemptIds,
  ]);

  if (venueSchedulingMode === "multi_resource") {
    if (event.venueResourceId) {
      for (const existing of eventsAtVenue) {
        if (!existing.venueResourceId) {
          continue;
        }
        if (existing.venueResourceId !== event.venueResourceId) {
          continue;
        }
        if (exemptIds.has(existing.id)) {
          continue;
        }
        if (!eventsOverlap(event, existing)) {
          continue;
        }

        throw new EventError(
          EventErrorCodes.VENUE_SCHEDULE_CONFLICT,
          `Venue resource is already scheduled for "${existing.name}" during this time window`,
        );
      }
      return;
    }

    for (const existing of eventsAtVenue) {
      if (exemptIds.has(existing.id)) {
        continue;
      }
      if (existing.venueResourceId) {
        continue;
      }
      if (!eventsOverlap(event, existing)) {
        continue;
      }

      throw new EventError(
        EventErrorCodes.VENUE_SCHEDULE_CONFLICT,
        `Venue is already scheduled for "${existing.name}" during this time window`,
      );
    }
    return;
  }

  if (event.venueResourceId) {
    throw new EventError(
      EventErrorCodes.VENUE_RESOURCE_NOT_ALLOWED,
      "venueResourceId is only supported for multi_resource venues",
    );
  }

  for (const existing of eventsAtVenue) {
    if (exemptIds.has(existing.id)) {
      continue;
    }

    if (!eventsOverlap(event, existing)) {
      continue;
    }

    throw new EventError(
      EventErrorCodes.VENUE_SCHEDULE_CONFLICT,
      `Venue is already scheduled for "${existing.name}" during this time window`,
    );
  }
}

export function isEventActiveAt(
  event: EventRecord,
  isoUtc: string,
): boolean {
  const now = Date.parse(isoUtc);
  return now >= Date.parse(event.isoUtcStart) && now < Date.parse(event.isoUtcEnd);
}
