import { getWorldClockService } from "@/modules/world-clock";
import { getLocationStore, parseIsoUtc } from "@/modules/locations";
import { getVenueStore, VenueError } from "@/modules/venues";
import { EventError, EventErrorCodes } from "./errors";
import {
  buildEventRecord,
  computeEventStatus,
  isEventActiveAt,
  validateId,
  validateVenueId,
} from "./transform";
import type {
  EventInput,
  EventOutput,
  EventRecord,
  EventsOutput,
} from "./types";

function resolveIsoUtc(isoUtc?: string): string {
  return isoUtc === undefined
    ? getWorldClockService().getCurrentOutput().isoUtc
    : parseIsoUtc(isoUtc);
}

function toEventOutput(event: EventRecord, atIsoUtc: string): EventOutput {
  const venue = getVenueStore().get(event.venueId);
  const location = getLocationStore().get(venue.locationId);

  return {
    id: event.id,
    name: event.name,
    venueId: venue.id,
    venueName: venue.name,
    isIndoor: venue.isIndoor,
    weatherApplies: !venue.isIndoor,
    locationId: location.id,
    locationName: location.name,
    country: location.country,
    timezone: location.timezone,
    localStart: event.localStart,
    isoUtcStart: event.isoUtcStart,
    durationMinutes: event.durationMinutes,
    isoUtcEnd: event.isoUtcEnd,
    status: computeEventStatus(atIsoUtc, event.isoUtcStart, event.isoUtcEnd),
  };
}

export class EventStore {
  private readonly events = new Map<string, EventRecord>();

  list(): EventRecord[] {
    return [...this.events.values()].sort((a, b) =>
      a.isoUtcStart.localeCompare(b.isoUtcStart),
    );
  }

  listByVenue(venueId: string): EventRecord[] {
    const id = validateVenueId(venueId);
    getVenueStore().get(id);

    return this.list().filter((event) => event.venueId === id);
  }

  listActiveAt(isoUtc: string): EventRecord[] {
    return this.list().filter((event) => isEventActiveAt(event, isoUtc));
  }

  countByVenue(venueId: string): number {
    return [...this.events.values()].filter((e) => e.venueId === venueId)
      .length;
  }

  get(id: string): EventRecord {
    const event = this.events.get(id);

    if (!event) {
      throw new EventError(
        EventErrorCodes.EVENT_NOT_FOUND,
        `Event not found: ${id}`,
      );
    }

    return event;
  }

  create(input: {
    name: unknown;
    venueId: unknown;
    localStart: unknown;
    durationMinutes: unknown;
  }): EventRecord {
    const venueId = validateVenueId(input.venueId);
    let venue;

    try {
      venue = getVenueStore().get(venueId);
    } catch (error) {
      if (error instanceof VenueError) {
        throw new EventError(
          EventErrorCodes.VENUE_NOT_FOUND,
          error.message,
        );
      }
      throw error;
    }

    const location = getLocationStore().get(venue.locationId);
    const id = crypto.randomUUID();
    const event = buildEventRecord(input, location.timezone, id);
    this.events.set(id, event);
    return event;
  }

  delete(id: string): { deleted: true; id: string } {
    validateId(id);

    if (!this.events.has(id)) {
      throw new EventError(
        EventErrorCodes.EVENT_NOT_FOUND,
        `Event not found: ${id}`,
      );
    }

    this.events.delete(id);
    return { deleted: true, id };
  }

  clear(): void {
    this.events.clear();
  }
}

const globalForEvents = globalThis as typeof globalThis & {
  __eventStore?: EventStore;
};

export function getEventStore(): EventStore {
  if (!globalForEvents.__eventStore) {
    globalForEvents.__eventStore = new EventStore();
  }
  return globalForEvents.__eventStore;
}

export function resetEventStore(): EventStore {
  const store = new EventStore();
  globalForEvents.__eventStore = store;
  return store;
}

export function executeEvent(input: EventInput): EventsOutput {
  const store = getEventStore();
  const atIsoUtc = resolveIsoUtc(
    input.action === "listAtTime" ? input.isoUtc : undefined,
  );

  switch (input.action) {
    case "create": {
      const event = store.create(input);
      return toEventOutput(event, atIsoUtc);
    }

    case "get":
      return toEventOutput(store.get(validateId(input.id)), atIsoUtc);

    case "delete":
      return store.delete(validateId(input.id));

    case "listByVenue":
      return store
        .listByVenue(validateVenueId(input.venueId))
        .map((event) => toEventOutput(event, atIsoUtc));

    case "listActive":
      return store
        .listActiveAt(atIsoUtc)
        .map((event) => toEventOutput(event, atIsoUtc));

    case "listAtTime":
      return store
        .listActiveAt(atIsoUtc)
        .map((event) => toEventOutput(event, atIsoUtc));

    default: {
      const unknownAction = (input as { action: string }).action;
      throw new EventError(
        EventErrorCodes.INVALID_ACTION,
        `Unknown action: ${unknownAction}`,
      );
    }
  }
}

export function listEvents(atIsoUtc?: string): EventOutput[] {
  const store = getEventStore();
  const isoUtc = resolveIsoUtc(atIsoUtc);
  return store.list().map((event) => toEventOutput(event, isoUtc));
}

export * from "./types";
export * from "./errors";
export {
  buildEventRecord,
  computeEventStatus,
  isEventActiveAt,
  validateDurationMinutes,
  validateLocalStart,
} from "./transform";
