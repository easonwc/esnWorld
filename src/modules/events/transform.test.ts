import { describe, expect, it, beforeEach } from "vitest";
import {
  EventErrorCodes,
  EventStore,
  computeEventStatus,
  eventsOverlap,
  executeEvent,
  resetEventStore,
} from "@/modules/events";
import {
  seedNewYorkLocation,
  seedUnitedStatesCountry,
  resetWorldFixtures,
} from "@/test/world-fixtures";
import { getVenueStore, resetVenueStore } from "@/modules/venues";

describe("computeEventStatus", () => {
  it("returns upcoming, active, and ended", () => {
    expect(
      computeEventStatus(
        "2020-06-14T15:00:00.000Z",
        "2020-06-14T16:00:00.000Z",
        "2020-06-14T18:00:00.000Z",
      ),
    ).toBe("upcoming");

    expect(
      computeEventStatus(
        "2020-06-14T17:00:00.000Z",
        "2020-06-14T16:00:00.000Z",
        "2020-06-14T18:00:00.000Z",
      ),
    ).toBe("active");

    expect(
      computeEventStatus(
        "2020-06-14T19:00:00.000Z",
        "2020-06-14T16:00:00.000Z",
        "2020-06-14T18:00:00.000Z",
      ),
    ).toBe("ended");
  });
});

describe("eventsOverlap", () => {
  it("detects overlap and allows adjacent windows", () => {
    const morning = {
      isoUtcStart: "2020-06-14T14:00:00.000Z",
      isoUtcEnd: "2020-06-14T17:00:00.000Z",
    };
    const afternoon = {
      isoUtcStart: "2020-06-14T16:00:00.000Z",
      isoUtcEnd: "2020-06-14T18:00:00.000Z",
    };
    const evening = {
      isoUtcStart: "2020-06-14T18:00:00.000Z",
      isoUtcEnd: "2020-06-14T20:00:00.000Z",
    };

    expect(eventsOverlap(morning, afternoon)).toBe(true);
    expect(eventsOverlap(morning, evening)).toBe(false);
    expect(eventsOverlap(afternoon, evening)).toBe(false);
  });
});

describe("EventStore", () => {
  let store: EventStore;
  let venueId: string;
  let locationId: string;

  beforeEach(async () => {
    await resetWorldFixtures();
    resetEventStore();
    resetVenueStore();

    const country = await seedUnitedStatesCountry();
    const location = await seedNewYorkLocation(country.id);
    locationId = location.id;

    venueId = (
      await resetVenueStore().create({
        locationId: location.id,
        name: "Madison Square Garden",
        latitude: 40.7505,
        longitude: -73.9934,
        isIndoor: true,
      })
    ).id;

    store = resetEventStore();
  });

  it("creates an event scheduled at venue local time", async () => {
    const event = await store.create({
      name: "Championship Final",
      venueId,
      localStart: {
        year: 2020,
        month: 6,
        day: 14,
        hour: 12,
        minute: 0,
      },
      durationMinutes: 120,
    });

    expect(event.name).toBe("Championship Final");
    expect(event.isoUtcStart).toBe("2020-06-14T16:00:00.000Z");
    expect(event.isoUtcEnd).toBe("2020-06-14T18:00:00.000Z");
    expect(event.localStart.hour).toBe(12);
    expect(event.parentId).toBeNull();
  });

  it("creates nested child events within a parent window", async () => {
    const parent = await store.create({
      name: "US Open",
      venueId,
      localStart: { year: 2020, month: 6, day: 10, hour: 7, minute: 0 },
      durationMinutes: 6 * 24 * 60,
    });

    const round1 = await store.create({
      name: "Round 1",
      venueId,
      parentId: parent.id,
      localStart: { year: 2020, month: 6, day: 10, hour: 7, minute: 0 },
      durationMinutes: 12 * 60,
    });

    const round2 = await store.create({
      name: "Round 2",
      venueId,
      parentId: parent.id,
      localStart: { year: 2020, month: 6, day: 11, hour: 7, minute: 0 },
      durationMinutes: 12 * 60,
    });

    expect(round1.parentId).toBe(parent.id);
    expect(round2.parentId).toBe(parent.id);

    const morning = await store.create({
      name: "Round 2 Morning",
      venueId,
      parentId: round2.id,
      localStart: { year: 2020, month: 6, day: 11, hour: 7, minute: 0 },
      durationMinutes: 4 * 60,
    });

    expect(morning.parentId).toBe(round2.id);
  });

  it("includes parentId and childIds on event output", async () => {
    const parent = await store.create({
      name: "US Open",
      venueId,
      localStart: { year: 2020, month: 6, day: 10, hour: 7, minute: 0 },
      durationMinutes: 6 * 24 * 60,
    });

    const round1 = await store.create({
      name: "Round 1",
      venueId,
      parentId: parent.id,
      localStart: { year: 2020, month: 6, day: 10, hour: 7, minute: 0 },
      durationMinutes: 12 * 60,
    });

    const parentOutput = await executeEvent({ action: "get", id: parent.id });
    const roundOutput = await executeEvent({ action: "get", id: round1.id });

    expect(parentOutput).toMatchObject({
      parentId: null,
      childIds: [round1.id],
    });
    expect(roundOutput).toMatchObject({
      parentId: parent.id,
      childIds: [],
    });
  });

  it("lists direct children sorted by start time", async () => {
    const parent = await store.create({
      name: "US Open",
      venueId,
      localStart: { year: 2020, month: 6, day: 10, hour: 7, minute: 0 },
      durationMinutes: 6 * 24 * 60,
    });

    const round2 = await store.create({
      name: "Round 2",
      venueId,
      parentId: parent.id,
      localStart: { year: 2020, month: 6, day: 11, hour: 7, minute: 0 },
      durationMinutes: 12 * 60,
    });
    const round1 = await store.create({
      name: "Round 1",
      venueId,
      parentId: parent.id,
      localStart: { year: 2020, month: 6, day: 10, hour: 7, minute: 0 },
      durationMinutes: 12 * 60,
    });

    const children = await executeEvent({
      action: "listChildren",
      parentId: parent.id,
    });

    expect(children.map((event) => event.id)).toEqual([round1.id, round2.id]);
  });

  it("rejects a child with a different venue", async () => {
    const otherVenueId = (
      await getVenueStore().create({
        locationId,
        name: "Yankee Stadium",
        latitude: 40.8296,
        longitude: -73.9262,
        isIndoor: false,
      })
    ).id;

    const parent = await store.create({
      name: "US Open",
      venueId,
      localStart: { year: 2020, month: 6, day: 10, hour: 7, minute: 0 },
      durationMinutes: 6 * 24 * 60,
    });

    await expect(
      store.create({
        name: "Round 1",
        venueId: otherVenueId,
        parentId: parent.id,
        localStart: { year: 2020, month: 6, day: 10, hour: 7, minute: 0 },
        durationMinutes: 12 * 60,
      }),
    ).rejects.toThrowError(
      expect.objectContaining({ code: EventErrorCodes.PARENT_VENUE_MISMATCH }),
    );
  });

  it("rejects a child outside the parent time window", async () => {
    const parent = await store.create({
      name: "US Open",
      venueId,
      localStart: { year: 2020, month: 6, day: 10, hour: 7, minute: 0 },
      durationMinutes: 24 * 60,
    });

    await expect(
      store.create({
        name: "Round 2",
        venueId,
        parentId: parent.id,
        localStart: { year: 2020, month: 6, day: 12, hour: 7, minute: 0 },
        durationMinutes: 12 * 60,
      }),
    ).rejects.toThrowError(
      expect.objectContaining({ code: EventErrorCodes.PARENT_TIME_CONTAINMENT }),
    );
  });

  it("deletes a parent and all descendants", async () => {
    const parent = await store.create({
      name: "US Open",
      venueId,
      localStart: { year: 2020, month: 6, day: 10, hour: 7, minute: 0 },
      durationMinutes: 6 * 24 * 60,
    });

    const round1 = await store.create({
      name: "Round 1",
      venueId,
      parentId: parent.id,
      localStart: { year: 2020, month: 6, day: 10, hour: 7, minute: 0 },
      durationMinutes: 12 * 60,
    });

    const session = await store.create({
      name: "Round 1 Morning",
      venueId,
      parentId: round1.id,
      localStart: { year: 2020, month: 6, day: 10, hour: 7, minute: 0 },
      durationMinutes: 4 * 60,
    });

    await store.delete(parent.id);

    expect(await store.count()).toBe(0);
    await expect(store.get(session.id)).rejects.toThrowError(
      expect.objectContaining({ code: EventErrorCodes.EVENT_NOT_FOUND }),
    );
  });

  it("exposes indoor status and weather applicability on event output", async () => {
    const output = await executeEvent({
      action: "get",
      id: (
        await store.create({
          name: "Indoor Final",
          venueId,
          localStart: { year: 2020, month: 6, day: 14, hour: 12, minute: 0 },
          durationMinutes: 120,
        })
      ).id,
    });

    expect(output).toMatchObject({
      isIndoor: true,
      weatherApplies: false,
    });
  });

  it("lists active events in parallel at the same venue for parent and child", async () => {
    const parent = await store.create({
      name: "US Open",
      venueId,
      localStart: { year: 2020, month: 6, day: 14, hour: 10, minute: 0 },
      durationMinutes: 480,
    });

    await store.create({
      name: "Round 1 Afternoon",
      venueId,
      parentId: parent.id,
      localStart: { year: 2020, month: 6, day: 14, hour: 12, minute: 0 },
      durationMinutes: 120,
    });

    const active = await store.listActiveAt("2020-06-14T16:30:00.000Z");
    expect(active.map((e) => e.name)).toEqual([
      "US Open",
      "Round 1 Afternoon",
    ]);
  });

  it("rejects unrelated overlapping events at the same venue", async () => {
    await store.create({
      name: "US Open",
      venueId,
      localStart: { year: 2020, month: 6, day: 10, hour: 7, minute: 0 },
      durationMinutes: 6 * 24 * 60,
    });

    await expect(
      store.create({
        name: "Charity Concert",
        venueId,
        localStart: { year: 2020, month: 6, day: 12, hour: 18, minute: 0 },
        durationMinutes: 180,
      }),
    ).rejects.toThrowError(
      expect.objectContaining({ code: EventErrorCodes.VENUE_SCHEDULE_CONFLICT }),
    );
  });

  it("rejects overlapping sibling events at the same venue", async () => {
    const parent = await store.create({
      name: "US Open",
      venueId,
      localStart: { year: 2020, month: 6, day: 10, hour: 7, minute: 0 },
      durationMinutes: 6 * 24 * 60,
    });

    await store.create({
      name: "Round 1",
      venueId,
      parentId: parent.id,
      localStart: { year: 2020, month: 6, day: 10, hour: 7, minute: 0 },
      durationMinutes: 12 * 60,
    });

    await expect(
      store.create({
        name: "Round 2",
        venueId,
        parentId: parent.id,
        localStart: { year: 2020, month: 6, day: 10, hour: 11, minute: 0 },
        durationMinutes: 12 * 60,
      }),
    ).rejects.toThrowError(
      expect.objectContaining({ code: EventErrorCodes.VENUE_SCHEDULE_CONFLICT }),
    );
  });

  it("rejects overlapping cousin events at the same venue", async () => {
    const parent = await store.create({
      name: "US Open",
      venueId,
      localStart: { year: 2020, month: 6, day: 10, hour: 7, minute: 0 },
      durationMinutes: 6 * 24 * 60,
    });

    const round1 = await store.create({
      name: "Round 1",
      venueId,
      parentId: parent.id,
      localStart: { year: 2020, month: 6, day: 10, hour: 7, minute: 0 },
      durationMinutes: 12 * 60,
    });

    await store.create({
      name: "Round 1 Morning",
      venueId,
      parentId: round1.id,
      localStart: { year: 2020, month: 6, day: 10, hour: 7, minute: 0 },
      durationMinutes: 4 * 60,
    });

    await expect(
      store.create({
        name: "Round 2",
        venueId,
        parentId: parent.id,
        localStart: { year: 2020, month: 6, day: 10, hour: 8, minute: 0 },
        durationMinutes: 12 * 60,
      }),
    ).rejects.toThrowError(
      expect.objectContaining({ code: EventErrorCodes.VENUE_SCHEDULE_CONFLICT }),
    );
  });

  it("allows non-overlapping siblings and adjacent venue bookings", async () => {
    const parent = await store.create({
      name: "US Open",
      venueId,
      localStart: { year: 2020, month: 6, day: 10, hour: 7, minute: 0 },
      durationMinutes: 6 * 24 * 60,
    });

    await store.create({
      name: "Round 1",
      venueId,
      parentId: parent.id,
      localStart: { year: 2020, month: 6, day: 10, hour: 7, minute: 0 },
      durationMinutes: 12 * 60,
    });

    await store.create({
      name: "Round 2",
      venueId,
      parentId: parent.id,
      localStart: { year: 2020, month: 6, day: 11, hour: 7, minute: 0 },
      durationMinutes: 12 * 60,
    });

    expect(await store.count()).toBe(3);
  });

  it("lists events by venue", async () => {
    const event = await store.create({
      name: "Concert",
      venueId,
      localStart: { year: 2020, month: 7, day: 4, hour: 20, minute: 0 },
      durationMinutes: 90,
    });

    const list = await store.listByVenue(venueId);
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(event.id);
  });

  it("rejects invalid venue", async () => {
    await expect(
      store.create({
        name: "Ghost Event",
        venueId: "missing",
        localStart: { year: 2020, month: 1, day: 1, hour: 12, minute: 0 },
        durationMinutes: 60,
      }),
    ).rejects.toThrowError(
      expect.objectContaining({ code: EventErrorCodes.VENUE_NOT_FOUND }),
    );
  });

  it("rejects non-positive duration", async () => {
    await expect(
      store.create({
        name: "Bad Duration",
        venueId,
        localStart: { year: 2020, month: 1, day: 1, hour: 12, minute: 0 },
        durationMinutes: 0,
      }),
    ).rejects.toThrowError(
      expect.objectContaining({ code: EventErrorCodes.INVALID_DURATION }),
    );
  });

  it("renames an event without schedule validation", async () => {
    const event = await store.create({
      name: "US Open",
      venueId,
      localStart: { year: 2020, month: 6, day: 10, hour: 7, minute: 0 },
      durationMinutes: 24 * 60,
    });

    const updated = await store.update({
      id: event.id,
      name: "US Open Championship",
    });

    expect(updated.name).toBe("US Open Championship");
    expect(updated.isoUtcStart).toBe(event.isoUtcStart);
    expect(updated.durationMinutes).toBe(event.durationMinutes);
  });

  it("reschedules a child event to a new day", async () => {
    const parent = await store.create({
      name: "US Open",
      venueId,
      localStart: { year: 2020, month: 6, day: 10, hour: 7, minute: 0 },
      durationMinutes: 6 * 24 * 60,
    });

    const round2 = await store.create({
      name: "Round 2",
      venueId,
      parentId: parent.id,
      localStart: { year: 2020, month: 6, day: 11, hour: 7, minute: 0 },
      durationMinutes: 12 * 60,
    });

    const updated = await store.update({
      id: round2.id,
      localStart: { year: 2020, month: 6, day: 12, hour: 7, minute: 0 },
    });

    expect(updated.isoUtcStart).toBe("2020-06-12T11:00:00.000Z");
  });

  it("extends a parent event when children still fit", async () => {
    const parent = await store.create({
      name: "US Open",
      venueId,
      localStart: { year: 2020, month: 6, day: 10, hour: 7, minute: 0 },
      durationMinutes: 5 * 24 * 60,
    });

    await store.create({
      name: "Round 4",
      venueId,
      parentId: parent.id,
      localStart: { year: 2020, month: 6, day: 14, hour: 7, minute: 0 },
      durationMinutes: 12 * 60,
    });

    const updated = await store.update({
      id: parent.id,
      durationMinutes: 6 * 24 * 60,
    });

    expect(updated.durationMinutes).toBe(6 * 24 * 60);
  });

  it("rejects shrinking a parent below its children", async () => {
    const parent = await store.create({
      name: "US Open",
      venueId,
      localStart: { year: 2020, month: 6, day: 10, hour: 7, minute: 0 },
      durationMinutes: 6 * 24 * 60,
    });

    await store.create({
      name: "Round 4",
      venueId,
      parentId: parent.id,
      localStart: { year: 2020, month: 6, day: 14, hour: 7, minute: 0 },
      durationMinutes: 12 * 60,
    });

    await expect(
      store.update({
        id: parent.id,
        durationMinutes: 3 * 24 * 60,
      }),
    ).rejects.toThrowError(
      expect.objectContaining({ code: EventErrorCodes.CHILD_TIME_CONTAINMENT }),
    );
  });

  it("rejects rescheduling a child into a sibling overlap", async () => {
    const parent = await store.create({
      name: "US Open",
      venueId,
      localStart: { year: 2020, month: 6, day: 10, hour: 7, minute: 0 },
      durationMinutes: 6 * 24 * 60,
    });

    await store.create({
      name: "Round 1",
      venueId,
      parentId: parent.id,
      localStart: { year: 2020, month: 6, day: 10, hour: 7, minute: 0 },
      durationMinutes: 12 * 60,
    });

    const round2 = await store.create({
      name: "Round 2",
      venueId,
      parentId: parent.id,
      localStart: { year: 2020, month: 6, day: 11, hour: 7, minute: 0 },
      durationMinutes: 12 * 60,
    });

    await expect(
      store.update({
        id: round2.id,
        localStart: { year: 2020, month: 6, day: 10, hour: 11, minute: 0 },
      }),
    ).rejects.toThrowError(
      expect.objectContaining({ code: EventErrorCodes.VENUE_SCHEDULE_CONFLICT }),
    );
  });

  it("rejects an empty update", async () => {
    const event = await store.create({
      name: "US Open",
      venueId,
      localStart: { year: 2020, month: 6, day: 10, hour: 7, minute: 0 },
      durationMinutes: 24 * 60,
    });

    await expect(store.update({ id: event.id })).rejects.toThrowError(
      expect.objectContaining({ code: EventErrorCodes.EMPTY_UPDATE }),
    );
  });

  it("updates through executeEvent", async () => {
    const event = await store.create({
      name: "US Open",
      venueId,
      localStart: { year: 2020, month: 6, day: 10, hour: 7, minute: 0 },
      durationMinutes: 24 * 60,
    });

    const output = await executeEvent({
      action: "update",
      id: event.id,
      name: "124th US Open",
    });

    expect(output).toMatchObject({
      id: event.id,
      name: "124th US Open",
    });
  });
});

describe("multi_resource venue scheduling", () => {
  let store: EventStore;
  let locationId: string;
  let multiVenueId: string;
  let court17Id: string;
  let court18Id: string;

  beforeEach(async () => {
    await resetWorldFixtures();
    resetEventStore();
    resetVenueStore();

    const country = await seedUnitedStatesCountry();
    const location = await seedNewYorkLocation(country.id);
    locationId = location.id;

    const venueStore = resetVenueStore();
    multiVenueId = (
      await venueStore.create({
        locationId: location.id,
        name: "USTA Billie Jean King National Tennis Center",
        latitude: 40.75,
        longitude: -73.84,
        isIndoor: false,
        schedulingMode: "multi_resource",
      })
    ).id;

    court17Id = (
      await venueStore.createResource({
        venueId: multiVenueId,
        name: "Court 17",
        resourceType: "court",
      })
    ).id;

    court18Id = (
      await venueStore.createResource({
        venueId: multiVenueId,
        name: "Court 18",
        resourceType: "court",
      })
    ).id;

    store = resetEventStore();
  });

  it("allows parallel matches on different resources at the same time", async () => {
    const tournament = await store.create({
      name: "US Open",
      venueId: multiVenueId,
      localStart: { year: 2020, month: 6, day: 10, hour: 7, minute: 0 },
      durationMinutes: 6 * 24 * 60,
    });

    await store.create({
      name: "Match A",
      venueId: multiVenueId,
      parentId: tournament.id,
      venueResourceId: court17Id,
      localStart: { year: 2020, month: 6, day: 10, hour: 11, minute: 0 },
      durationMinutes: 120,
    });

    await store.create({
      name: "Match B",
      venueId: multiVenueId,
      parentId: tournament.id,
      venueResourceId: court18Id,
      localStart: { year: 2020, month: 6, day: 10, hour: 11, minute: 0 },
      durationMinutes: 120,
    });

    expect(await store.count()).toBe(3);
  });

  it("rejects overlapping events on the same resource", async () => {
    const tournament = await store.create({
      name: "US Open",
      venueId: multiVenueId,
      localStart: { year: 2020, month: 6, day: 10, hour: 7, minute: 0 },
      durationMinutes: 6 * 24 * 60,
    });

    await store.create({
      name: "Match A",
      venueId: multiVenueId,
      parentId: tournament.id,
      venueResourceId: court17Id,
      localStart: { year: 2020, month: 6, day: 10, hour: 11, minute: 0 },
      durationMinutes: 120,
    });

    await expect(
      store.create({
        name: "Match B",
        venueId: multiVenueId,
        parentId: tournament.id,
        venueResourceId: court17Id,
        localStart: { year: 2020, month: 6, day: 10, hour: 12, minute: 0 },
        durationMinutes: 120,
      }),
    ).rejects.toThrowError(
      expect.objectContaining({ code: EventErrorCodes.VENUE_SCHEDULE_CONFLICT }),
    );
  });

  it("allows a container event to overlap resource-bound leaves", async () => {
    const tournament = await store.create({
      name: "US Open",
      venueId: multiVenueId,
      localStart: { year: 2020, month: 6, day: 10, hour: 7, minute: 0 },
      durationMinutes: 6 * 24 * 60,
    });

    await store.create({
      name: "Match A",
      venueId: multiVenueId,
      parentId: tournament.id,
      venueResourceId: court17Id,
      localStart: { year: 2020, month: 6, day: 10, hour: 11, minute: 0 },
      durationMinutes: 120,
    });

    await store.create({
      name: "Round 1",
      venueId: multiVenueId,
      parentId: tournament.id,
      localStart: { year: 2020, month: 6, day: 10, hour: 11, minute: 0 },
      durationMinutes: 12 * 60,
    });

    expect(await store.count()).toBe(3);
  });

  it("rejects overlapping container events that are not ancestors", async () => {
    await store.create({
      name: "US Open",
      venueId: multiVenueId,
      localStart: { year: 2020, month: 6, day: 10, hour: 7, minute: 0 },
      durationMinutes: 6 * 24 * 60,
    });

    await expect(
      store.create({
        name: "Charity Concert",
        venueId: multiVenueId,
        localStart: { year: 2020, month: 6, day: 12, hour: 18, minute: 0 },
        durationMinutes: 180,
      }),
    ).rejects.toThrowError(
      expect.objectContaining({ code: EventErrorCodes.VENUE_SCHEDULE_CONFLICT }),
    );
  });

  it("rejects venueResourceId on exclusive venues", async () => {
    const exclusiveVenueId = (
      await getVenueStore().create({
        locationId,
        name: "Madison Square Garden",
        latitude: 40.7505,
        longitude: -73.9934,
        isIndoor: true,
      })
    ).id;

    await expect(
      store.create({
        name: "Final",
        venueId: exclusiveVenueId,
        venueResourceId: court17Id,
        localStart: { year: 2020, month: 6, day: 14, hour: 12, minute: 0 },
        durationMinutes: 120,
      }),
    ).rejects.toThrowError(
      expect.objectContaining({
        code: EventErrorCodes.VENUE_RESOURCE_NOT_ALLOWED,
      }),
    );
  });

  it("includes venueResourceName on event output", async () => {
    const event = await store.create({
      name: "Match A",
      venueId: multiVenueId,
      venueResourceId: court17Id,
      localStart: { year: 2020, month: 6, day: 10, hour: 11, minute: 0 },
      durationMinutes: 120,
    });

    const output = await executeEvent({ action: "get", id: event.id });
    expect(output).toMatchObject({
      venueResourceId: court17Id,
      venueResourceName: "Court 17",
    });
  });
});
