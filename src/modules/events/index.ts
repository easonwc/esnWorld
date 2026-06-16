import { getWorldClockService } from "@/modules/world-clock";
import { getLocationStore, parseIsoUtc } from "@/modules/locations";
import { getVenueStore, VenueError, VenueErrorCodes } from "@/modules/venues";
import {
  getDefaultEventRepository,
  type EventRepository,
} from "@/persistence/repositories";
import { paginateArray, type ListOptions } from "@/lib/pagination";
import { EventError, EventErrorCodes } from "./errors";
import {
  applyEventScheduleUpdate,
  assertNoVenueScheduleConflict,
  assertParentContainsChildren,
  buildEventRecord,
  collectDescendantIds,
  computeEventStatus,
  isEventActiveAt,
  validateChildWithinParent,
  validateEventName,
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
  const children = await store.listDirectChildren(event.id);
  const venueResource = event.venueResourceId
    ? await getVenueStore()
        .getResource(event.venueResourceId)
        .catch(() => null)
    : null;

  return {
    id: event.id,
    name: event.name,
    venueId: venue.id,
    venueResourceId: event.venueResourceId,
    venueResourceName: venueResource?.name ?? null,
    parentId: event.parentId,
    childIds: children.map((child) => child.id),
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
  constructor(private readonly repository: EventRepository) {}

  async list(options?: ListOptions): Promise<EventRecord[]> {
    return this.repository.list(options);
  }

  async count(): Promise<number> {
    return this.repository.count();
  }

  async listDirectChildren(parentId: string): Promise<EventRecord[]> {
    const id = validateId(parentId);
    await this.get(id);
    return this.repository.listDirectChildren(id);
  }

  private async buildEventsById(): Promise<Map<string, EventRecord>> {
    const events = await this.repository.list();
    return new Map(events.map((event) => [event.id, event]));
  }

  private async collectDescendantIds(id: string): Promise<string[]> {
    const eventsById = await this.buildEventsById();
    return [...collectDescendantIds(id, eventsById)];
  }

  async listByVenue(venueId: string): Promise<EventRecord[]> {
    const id = validateVenueId(venueId);
    await getVenueStore().get(id);
    return this.repository.listByVenue(id);
  }

  async listActiveAt(isoUtc: string): Promise<EventRecord[]> {
    return this.repository.listActiveAt(isoUtc);
  }

  async countByVenue(venueId: string): Promise<number> {
    const events = await this.repository.listByVenue(venueId);
    return events.length;
  }

  async get(id: string): Promise<EventRecord> {
    const event = await this.repository.get(validateId(id));

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
    venueResourceId?: unknown;
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

    if (venue.schedulingMode === "exclusive" && event.venueResourceId) {
      throw new EventError(
        EventErrorCodes.VENUE_RESOURCE_NOT_ALLOWED,
        "venueResourceId is only supported for multi_resource venues",
      );
    }

    if (event.venueResourceId) {
      let resource;

      try {
        resource = await getVenueStore().getResource(event.venueResourceId);
      } catch (error) {
        if (
          error instanceof VenueError &&
          error.code === VenueErrorCodes.RESOURCE_NOT_FOUND
        ) {
          throw new EventError(
            EventErrorCodes.VENUE_RESOURCE_NOT_FOUND,
            `Venue resource not found: ${event.venueResourceId}`,
          );
        }
        throw error;
      }

      if (resource.venueId !== venue.id) {
        throw new EventError(
          EventErrorCodes.VENUE_RESOURCE_VENUE_MISMATCH,
          "Venue resource must belong to the event venue",
        );
      }
    }

    if (event.parentId) {
      let parent: EventRecord;

      try {
        parent = await this.get(event.parentId);
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

    const eventsAtVenue = await this.repository.listByVenue(event.venueId);
    const eventsById = await this.buildEventsById();
    assertNoVenueScheduleConflict(
      event,
      eventsAtVenue,
      eventsById,
      venue.schedulingMode,
    );

    await this.repository.create(event);
    return event;
  }

  async update(input: {
    id: unknown;
    name?: unknown;
    localStart?: unknown;
    durationMinutes?: unknown;
  }): Promise<EventRecord> {
    const id = validateId(input.id);
    const existing = await this.get(id);
    const scheduleChanging =
      input.localStart !== undefined || input.durationMinutes !== undefined;
    const nameChanging = input.name !== undefined;

    if (!scheduleChanging && !nameChanging) {
      throw new EventError(
        EventErrorCodes.EMPTY_UPDATE,
        "At least one of name, localStart, or durationMinutes must be provided",
      );
    }

    let updated = existing;

    if (scheduleChanging) {
      const venue = await getVenueStore().get(existing.venueId);
      const location = await getLocationStore().get(venue.locationId);
      updated = applyEventScheduleUpdate(existing, input, location.timezone);
    } else {
      updated = {
        ...existing,
        name: validateEventName(input.name),
      };
    }

    if (scheduleChanging) {
      if (updated.parentId) {
        validateChildWithinParent(updated, await this.get(updated.parentId));
      }

      const descendants = await Promise.all(
        (await this.collectDescendantIds(id)).map((descendantId) =>
          this.get(descendantId),
        ),
      );
      assertParentContainsChildren(updated, descendants);

      const eventsAtVenue = await this.repository.listByVenue(updated.venueId);
      const eventsById = await this.buildEventsById();
      const venue = await getVenueStore().get(updated.venueId);
      assertNoVenueScheduleConflict(
        updated,
        eventsAtVenue,
        eventsById,
        venue.schedulingMode,
        collectDescendantIds(id, eventsById),
      );
    }

    await this.repository.update(updated);
    return updated;
  }

  async delete(id: string): Promise<{ deleted: true; id: string }> {
    const normalizedId = validateId(id);
    await this.get(normalizedId);

    for (const descendantId of await this.collectDescendantIds(normalizedId)) {
      await this.repository.delete(descendantId);
    }

    await this.repository.delete(normalizedId);
    return { deleted: true, id: normalizedId };
  }

  async clear(): Promise<void> {
    await this.repository.clear();
  }
}

const globalForEvents = globalThis as typeof globalThis & {
  __eventStore?: EventStore;
};

export function getEventStore(): EventStore {
  if (!globalForEvents.__eventStore) {
    globalForEvents.__eventStore = new EventStore(getDefaultEventRepository());
  }
  return globalForEvents.__eventStore;
}

export function resetEventStore(repository?: EventRepository): EventStore {
  const store = new EventStore(repository ?? getDefaultEventRepository());
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
      return toEventOutput(
        await store.get(validateId(input.id)),
        atIsoUtc,
        store,
      );

    case "update": {
      const event = await store.update(input);
      return toEventOutput(event, atIsoUtc, store);
    }

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
        (await store.listDirectChildren(validateId(input.parentId))).map(
          (event) => toEventOutput(event, atIsoUtc, store),
        ),
      );

    case "listActive":
      return Promise.all(
        (await store.listActiveAt(atIsoUtc)).map((event) =>
          toEventOutput(event, atIsoUtc, store),
        ),
      );

    case "listAtTime":
      return Promise.all(
        (await store.listActiveAt(atIsoUtc)).map((event) =>
          toEventOutput(event, atIsoUtc, store),
        ),
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
    (await store.list(options)).map((event) =>
      toEventOutput(event, isoUtc, store),
    ),
  );
}

export async function countEvents(): Promise<number> {
  return getEventStore().count();
}

export * from "./types";
export * from "./errors";
export {
  applyEventScheduleUpdate,
  assertNoVenueScheduleConflict,
  assertParentContainsChildren,
  buildEventRecord,
  collectAncestorIds,
  collectDescendantIds,
  computeEventStatus,
  eventsOverlap,
  isEventActiveAt,
  validateChildWithinParent,
  validateDurationMinutes,
  validateLocalStart,
} from "./transform";
