import { getWorldClockService } from "@/modules/world-clock";
import { getLocationStore, parseIsoUtc } from "@/modules/locations";
import { getVenueStore, VenueError } from "@/modules/venues";
import { paginateArray, type ListOptions } from "@/lib/pagination";
import { EventError, EventErrorCodes } from "./errors";
import {
  assertNoVenueScheduleConflict,
  buildEventRecord,
  computeEventStatus,
  isEventActiveAt,
  validateChildWithinParent,
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

async function toEventOutput(
  event: EventRecord,
  atIsoUtc: string,
  store: EventStore,
): Promise<EventOutput> {
  const venue = await getVenueStore().get(event.venueId);
  const location = await getLocationStore().get(venue.locationId);

  return {
    id: event.id,
    name: event.name,
    venueId: venue.id,
    parentId: event.parentId,
    childIds: store.listDirectChildren(event.id).map((child) => child.id),
    venueName: venue.name,
    isIndoor: venue.isIndoor,
    weatherApplies: !venue.isIndoor,
    locationId: location.id,
    locationName: location.name,
    country: location.countryName,
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

  list(options?: ListOptions): EventRecord[] {
    const sorted = [...this.events.values()].sort((a, b) =>
      a.isoUtcStart.localeCompare(b.isoUtcStart),
    );
    return options ? paginateArray(sorted, options) : sorted;
  }

  count(): number {
    return this.events.size;
  }

  listDirectChildren(parentId: string): EventRecord[] {
    const id = validateId(parentId);
    this.get(id);

    return [...this.events.values()]
      .filter((event) => event.parentId === id)
      .sort((a, b) => a.isoUtcStart.localeCompare(b.isoUtcStart));
  }

  private collectDescendantIds(id: string): string[] {
    const descendantIds: string[] = [];
    const queue = [id];

    while (queue.length > 0) {
      const currentId = queue.shift()!;

      for (const event of this.events.values()) {
        if (event.parentId === currentId) {
          descendantIds.push(event.id);
          queue.push(event.id);
        }
      }
    }

    return descendantIds;
  }

  async listByVenue(venueId: string): Promise<EventRecord[]> {
    const id = validateVenueId(venueId);
    await getVenueStore().get(id);

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

  async create(input: {
    name: unknown;
    venueId: unknown;
    localStart: unknown;
    durationMinutes: unknown;
    parentId?: unknown;
  }): Promise<EventRecord> {
    const venueId = validateVenueId(input.venueId);
    let venue;

    try {
      venue = await getVenueStore().get(venueId);
    } catch (error) {
      if (error instanceof VenueError) {
        throw new EventError(
          EventErrorCodes.VENUE_NOT_FOUND,
          error.message,
        );
      }
      throw error;
    }

    const location = await getLocationStore().get(venue.locationId);
    const id = crypto.randomUUID();
    const event = buildEventRecord(input, location.timezone, id);

    if (event.parentId) {
      let parent: EventRecord;

      try {
        parent = this.get(event.parentId);
      } catch (error) {
        if (error instanceof EventError) {
          throw new EventError(
            EventErrorCodes.PARENT_NOT_FOUND,
            `Parent event not found: ${event.parentId}`,
          );
        }
        throw error;
      }

      validateChildWithinParent(event, parent);
    }

    const eventsAtVenue = [...this.events.values()].filter(
      (existing) => existing.venueId === event.venueId,
    );
    assertNoVenueScheduleConflict(event, eventsAtVenue, this.events);

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

    for (const descendantId of this.collectDescendantIds(id)) {
      this.events.delete(descendantId);
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

export async function executeEvent(input: EventInput): Promise<EventsOutput> {
  const store = getEventStore();
  const atIsoUtc = resolveIsoUtc(
    input.action === "listAtTime" ? input.isoUtc : undefined,
  );

  switch (input.action) {
    case "create": {
      const event = await store.create(input);
      return toEventOutput(event, atIsoUtc, store);
    }

    case "get":
      return toEventOutput(store.get(validateId(input.id)), atIsoUtc, store);

    case "delete":
      return store.delete(validateId(input.id));

    case "listByVenue":
      return Promise.all(
        (await store.listByVenue(validateVenueId(input.venueId))).map(
          (event) => toEventOutput(event, atIsoUtc, store),
        ),
      );

    case "listChildren":
      return Promise.all(
        store
          .listDirectChildren(validateId(input.parentId))
          .map((event) => toEventOutput(event, atIsoUtc, store)),
      );

    case "listActive":
      return Promise.all(
        store
          .listActiveAt(atIsoUtc)
          .map((event) => toEventOutput(event, atIsoUtc, store)),
      );

    case "listAtTime":
      return Promise.all(
        store
          .listActiveAt(atIsoUtc)
          .map((event) => toEventOutput(event, atIsoUtc, store)),
      );

    default: {
      const unknownAction = (input as { action: string }).action;
      throw new EventError(
        EventErrorCodes.INVALID_ACTION,
        `Unknown action: ${unknownAction}`,
      );
    }
  }
}

export async function listEvents(
  atIsoUtc?: string,
  options?: ListOptions,
): Promise<EventOutput[]> {
  const store = getEventStore();
  const isoUtc = resolveIsoUtc(atIsoUtc);
  return Promise.all(
    store.list(options).map((event) => toEventOutput(event, isoUtc, store)),
  );
}

export async function countEvents(): Promise<number> {
  return getEventStore().count();
}

export * from "./types";
export * from "./errors";
export {
  assertNoVenueScheduleConflict,
  buildEventRecord,
  collectAncestorIds,
  computeEventStatus,
  eventsOverlap,
  isEventActiveAt,
  validateChildWithinParent,
  validateDurationMinutes,
  validateLocalStart,
} from "./transform";
