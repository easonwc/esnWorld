import { describe, expect, it, beforeEach } from "vitest";
import { resetLocationStore } from "@/modules/locations";
import {
  VenueErrorCodes,
  VenueStore,
  resetVenueStore,
  validateIsIndoor,
} from "@/modules/venues";

describe("VenueStore", () => {
  let store: VenueStore;
  let locationId: string;

  beforeEach(() => {
    resetLocationStore();
    store = resetVenueStore();

    locationId = resetLocationStore().create({
      name: "New York",
      country: "United States",
      latitude: 40.7128,
      longitude: -74.006,
      timezone: "America/New_York",
      population: 8336817,
    }).id;
  });

  it("creates a venue within a location", () => {
    const venue = store.create({
      locationId,
      name: "Madison Square Garden",
      latitude: 40.7505,
      longitude: -73.9934,
      isIndoor: true,
    });

    expect(venue.name).toBe("Madison Square Garden");
    expect(venue.isIndoor).toBe(true);
    expect(venue.locationId).toBe(locationId);
  });

  it("allows multiple venues in the same location", () => {
    store.create({
      locationId,
      name: "Madison Square Garden",
      latitude: 40.7505,
      longitude: -73.9934,
      isIndoor: true,
    });
    store.create({
      locationId,
      name: "Bethpage Black Course",
      latitude: 40.7446,
      longitude: -73.4658,
      isIndoor: false,
    });

    const venues = store.listByLocation(locationId);
    expect(venues.map((v) => v.name)).toEqual([
      "Bethpage Black Course",
      "Madison Square Garden",
    ]);
  });

  it("rejects invalid isIndoor", () => {
    expect(() => validateIsIndoor("yes")).toThrowError(
      expect.objectContaining({ code: VenueErrorCodes.INVALID_IS_INDOOR }),
    );
  });

  it("rejects venue creation for unknown location", () => {
    expect(() =>
      store.create({
        locationId: "missing-id",
        name: "Ghost Arena",
        latitude: 0,
        longitude: 0,
        isIndoor: false,
      }),
    ).toThrowError(
      expect.objectContaining({ code: VenueErrorCodes.LOCATION_NOT_FOUND }),
    );
  });

  it("returns local time using parent location timezone", () => {
    const venue = store.create({
      locationId,
      name: "Madison Square Garden",
      latitude: 40.7505,
      longitude: -73.9934,
      isIndoor: true,
    });

    const localTime = store.getLocalTime(
      venue.id,
      "2020-06-14T16:00:00.000Z",
    );

    expect(localTime.venueName).toBe("Madison Square Garden");
    expect(localTime.locationName).toBe("New York");
    expect(localTime.country).toBe("United States");
    expect(localTime.local.hour).toBe(12);
  });

  it("counts venues per location", () => {
    store.create({
      locationId,
      name: "Venue A",
      latitude: 0,
      longitude: 0,
      isIndoor: false,
    });

    expect(store.countByLocation(locationId)).toBe(1);
  });
});
