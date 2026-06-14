import { resetVenueStore, getVenueStore } from "@/modules/venues";
import { describe, expect, it, beforeEach } from "vitest";
import {
  LocationErrorCodes,
  LocationStore,
  buildLocation,
  resetLocationStore,
  utcToLocalTime,
  validateCountry,
  validateLatitude,
  validateLongitude,
  validatePopulation,
  validateTimezone,
} from "@/modules/locations";

describe("locations validation", () => {
  it("accepts valid coordinates, country, and timezone", () => {
    expect(validateLatitude(40.7128)).toBe(40.7128);
    expect(validateLongitude(-74.006)).toBe(-74.006);
    expect(validateCountry("United States")).toBe("United States");
    expect(validateTimezone("America/New_York")).toBe("America/New_York");
  });

  it("rejects out-of-range latitude", () => {
    expect(() => validateLatitude(91)).toThrowError(
      expect.objectContaining({ code: LocationErrorCodes.INVALID_LATITUDE }),
    );
  });

  it("rejects out-of-range longitude", () => {
    expect(() => validateLongitude(-181)).toThrowError(
      expect.objectContaining({ code: LocationErrorCodes.INVALID_LONGITUDE }),
    );
  });

  it("rejects invalid timezone", () => {
    expect(() => validateTimezone("Not/A_Zone")).toThrowError(
      expect.objectContaining({ code: LocationErrorCodes.INVALID_TIMEZONE }),
    );
  });

  it("rejects invalid population", () => {
    expect(() => validatePopulation(-1)).toThrowError(
      expect.objectContaining({ code: LocationErrorCodes.INVALID_POPULATION }),
    );
    expect(() => validatePopulation(1.5)).toThrowError(
      expect.objectContaining({ code: LocationErrorCodes.INVALID_POPULATION }),
    );
  });
});

describe("utcToLocalTime", () => {
  it("converts UTC to city local time", () => {
    const local = utcToLocalTime(
      "2020-06-14T16:00:00.000Z",
      "America/New_York",
    );

    expect(local.year).toBe(2020);
    expect(local.month).toBe(6);
    expect(local.day).toBe(14);
    expect(local.hour).toBe(12);
    expect(local.minute).toBe(0);
    expect(local.weekdayName).toBe("Sunday");
  });
});

describe("LocationStore", () => {
  let store: LocationStore;

  beforeEach(() => {
    resetVenueStore();
    store = resetLocationStore();
  });

  it("creates and retrieves a city location", () => {
    const created = store.create({
      name: "New York",
      country: "United States",
      latitude: 40.7128,
      longitude: -74.006,
      timezone: "America/New_York",
      population: 8336817,
    });

    expect(created.id).toBeTruthy();
    expect(created.name).toBe("New York");
    expect(created.country).toBe("United States");
    expect(created.population).toBe(8336817);

    const fetched = store.get(created.id);
    expect(fetched).toEqual(created);
  });

  it("lists locations sorted by city name", () => {
    store.create({
      name: "Zurich",
      country: "Switzerland",
      latitude: 47.3769,
      longitude: 8.5417,
      timezone: "Europe/Zurich",
      population: 415367,
    });
    store.create({
      name: "Amsterdam",
      country: "Netherlands",
      latitude: 52.3676,
      longitude: 4.9041,
      timezone: "Europe/Amsterdam",
      population: 872680,
    });

    const list = store.list();
    expect(list.map((l) => l.name)).toEqual(["Amsterdam", "Zurich"]);
  });

  it("returns local time for a city", () => {
    const created = store.create({
      name: "Los Angeles",
      country: "United States",
      latitude: 34.0522,
      longitude: -118.2437,
      timezone: "America/Los_Angeles",
      population: 3979576,
    });

    const localTime = store.getLocalTime(
      created.id,
      "2020-06-14T19:00:00.000Z",
    );

    expect(localTime.locationName).toBe("Los Angeles");
    expect(localTime.country).toBe("United States");
    expect(localTime.local.hour).toBe(12);
  });

  it("prevents deleting a location that still has venues", () => {
    const created = store.create({
      name: "Chicago",
      country: "United States",
      latitude: 41.8781,
      longitude: -87.6298,
      timezone: "America/Chicago",
      population: 2746388,
    });

    getVenueStore().create({
      locationId: created.id,
      name: "Soldier Field",
      latitude: 41.8623,
      longitude: -87.6167,
      isIndoor: false,
    });

    expect(() => store.delete(created.id)).toThrowError(
      expect.objectContaining({ code: LocationErrorCodes.LOCATION_HAS_VENUES }),
    );
  });
});

describe("buildLocation", () => {
  it("trims name, country, and timezone", () => {
    const location = buildLocation(
      {
        name: "  Tokyo  ",
        country: " Japan ",
        latitude: 35.6762,
        longitude: 139.6503,
        timezone: " Asia/Tokyo ",
        population: 13960000,
      },
      "test-id",
    );

    expect(location.name).toBe("Tokyo");
    expect(location.country).toBe("Japan");
    expect(location.timezone).toBe("Asia/Tokyo");
  });
});
