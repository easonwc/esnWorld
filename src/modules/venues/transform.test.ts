import { describe, expect, it, beforeEach } from "vitest";
import { resetLocationStore } from "@/modules/locations";
import {
  VenueErrorCodes,
  VenueStore,
  resetVenueStore,
  validateIsIndoor,
} from "@/modules/venues";
import {
  seedNewYorkLocation,
  seedUnitedStatesCountry,
  resetWorldFixtures,
} from "@/test/world-fixtures";

describe("VenueStore", () => {
  let store: VenueStore;
  let locationId: string;

  beforeEach(async () => {
    await resetWorldFixtures();
    store = resetVenueStore();

    const country = await seedUnitedStatesCountry();
    locationId = (await seedNewYorkLocation(country.id)).id;
  });

  it("creates a venue within a location", async () => {
    const venue = await store.create({
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

  it("allows multiple venues in the same location", async () => {
    await store.create({
      locationId,
      name: "Madison Square Garden",
      latitude: 40.7505,
      longitude: -73.9934,
      isIndoor: true,
    });
    await store.create({
      locationId,
      name: "Bethpage Black Course",
      latitude: 40.7446,
      longitude: -73.4658,
      isIndoor: false,
    });

    const venues = await store.listByLocation(locationId);
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

  it("rejects venue creation for unknown location", async () => {
    await expect(
      store.create({
        locationId: "missing-id",
        name: "Ghost Arena",
        latitude: 0,
        longitude: 0,
        isIndoor: false,
      }),
    ).rejects.toThrowError(
      expect.objectContaining({ code: VenueErrorCodes.LOCATION_NOT_FOUND }),
    );
  });

  it("returns local time using parent location timezone", async () => {
    const venue = await store.create({
      locationId,
      name: "Madison Square Garden",
      latitude: 40.7505,
      longitude: -73.9934,
      isIndoor: true,
    });

    const localTime = await store.getLocalTime(
      venue.id,
      "2020-06-14T16:00:00.000Z",
    );

    expect(localTime.venueName).toBe("Madison Square Garden");
    expect(localTime.locationName).toBe("New York");
    expect(localTime.country).toBe("United States");
    expect(localTime.local.hour).toBe(12);
  });

  it("counts venues per location", async () => {
    await store.create({
      locationId,
      name: "Venue A",
      latitude: 0,
      longitude: 0,
      isIndoor: false,
    });

    expect(await store.countByLocation(locationId)).toBe(1);
  });
});
