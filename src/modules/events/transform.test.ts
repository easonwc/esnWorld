import { describe, expect, it, beforeEach } from "vitest";
import {
  EventErrorCodes,
  EventStore,
  computeEventStatus,
  executeEvent,
  resetEventStore,
} from "@/modules/events";
import { resetLocationStore } from "@/modules/locations";
import { resetVenueStore } from "@/modules/venues";

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

describe("EventStore", () => {
  let store: EventStore;
  let venueId: string;

  beforeEach(() => {
    resetEventStore();
    resetVenueStore();
    resetLocationStore();

    const locationId = resetLocationStore().create({
      name: "New York",
      country: "United States",
      latitude: 40.7128,
      longitude: -74.006,
      timezone: "America/New_York",
      population: 8336817,
    }).id;

    venueId = resetVenueStore().create({
      locationId,
      name: "Madison Square Garden",
      latitude: 40.7505,
      longitude: -73.9934,
      isIndoor: true,
    }).id;

    store = resetEventStore();
  });

  it("creates an event scheduled at venue local time", () => {
    const event = store.create({
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
  });

  it("exposes indoor status and weather applicability on event output", () => {
    const output = executeEvent({
      action: "get",
      id: store.create({
        name: "Indoor Final",
        venueId,
        localStart: { year: 2020, month: 6, day: 14, hour: 12, minute: 0 },
        durationMinutes: 120,
      }).id,
    });

    expect(output).toMatchObject({
      isIndoor: true,
      weatherApplies: false,
    });
  });

  it("lists active events in parallel", () => {
    store.create({
      name: "Morning Session",
      venueId,
      localStart: { year: 2020, month: 6, day: 14, hour: 10, minute: 0 },
      durationMinutes: 180,
    });
    store.create({
      name: "Afternoon Session",
      venueId,
      localStart: { year: 2020, month: 6, day: 14, hour: 12, minute: 0 },
      durationMinutes: 120,
    });

    const active = store.listActiveAt("2020-06-14T16:30:00.000Z");
    expect(active.map((e) => e.name)).toEqual([
      "Morning Session",
      "Afternoon Session",
    ]);
  });

  it("lists events by venue", () => {
    const event = store.create({
      name: "Concert",
      venueId,
      localStart: { year: 2020, month: 7, day: 4, hour: 20, minute: 0 },
      durationMinutes: 90,
    });

    const list = store.listByVenue(venueId);
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(event.id);
  });

  it("rejects invalid venue", () => {
    expect(() =>
      store.create({
        name: "Ghost Event",
        venueId: "missing",
        localStart: { year: 2020, month: 1, day: 1, hour: 12, minute: 0 },
        durationMinutes: 60,
      }),
    ).toThrowError(
      expect.objectContaining({ code: EventErrorCodes.VENUE_NOT_FOUND }),
    );
  });

  it("rejects non-positive duration", () => {
    expect(() =>
      store.create({
        name: "Bad Duration",
        venueId,
        localStart: { year: 2020, month: 1, day: 1, hour: 12, minute: 0 },
        durationMinutes: 0,
      }),
    ).toThrowError(
      expect.objectContaining({ code: EventErrorCodes.INVALID_DURATION }),
    );
  });
});
