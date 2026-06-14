import { resetVenueStore, getVenueStore } from "@/modules/venues";
import { describe, expect, it, beforeEach } from "vitest";
import {
  LocationErrorCodes,
  LocationStore,
  buildLocation,
  resetLocationStore,
  utcToLocalTime,
  validateCountryId,
  validateLatitude,
  validateLongitude,
  validatePopulation,
  validateTimezone,
} from "@/modules/locations";
import { getCountryStore, resetCountryStore } from "@/modules/countries";
import {
  seedNewYorkLocation,
  seedUnitedStatesCountry,
  seedUnitedStatesWithNewYork,
} from "@/test/world-fixtures";

describe("locations validation", () => {
  it("accepts valid coordinates, countryId, and timezone", () => {
    expect(validateLatitude(40.7128)).toBe(40.7128);
    expect(validateLongitude(-74.006)).toBe(-74.006);
    expect(validateCountryId("country-123")).toBe("country-123");
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
  let countryId: string;

  beforeEach(async () => {
    resetVenueStore();
    resetLocationStore();
    resetCountryStore();
    store = resetLocationStore();
    countryId = (await seedUnitedStatesCountry()).id;
  });

  it("creates and retrieves a city location", async () => {
    const created = await store.create({
      name: "New York",
      countryId,
      latitude: 40.7128,
      longitude: -74.006,
      timezone: "America/New_York",
      population: 8336817,
    });

    expect(created.id).toBeTruthy();
    expect(created.name).toBe("New York");
    expect(created.region).toBeNull();
    expect(created.countryName).toBe("United States");
    expect(created.population).toBe(8336817);

    const fetched = await store.get(created.id);
    expect(fetched).toEqual(created);
  });

  it("lists locations sorted by city name", async () => {
    const switzerland = await getCountryStore().create({
      name: "Switzerland",
      isoCode: "CH",
      languages: ["German", "French", "Italian"],
    });
    const netherlands = await getCountryStore().create({
      name: "Netherlands",
      isoCode: "NL",
      languages: ["Dutch"],
    });

    await store.create({
      name: "Zurich",
      countryId: switzerland.id,
      latitude: 47.3769,
      longitude: 8.5417,
      timezone: "Europe/Zurich",
      population: 415367,
    });
    await store.create({
      name: "Amsterdam",
      countryId: netherlands.id,
      latitude: 52.3676,
      longitude: 4.9041,
      timezone: "Europe/Amsterdam",
      population: 872680,
    });

    const list = await store.list();
    expect(list.map((l) => l.name)).toEqual(["Amsterdam", "Zurich"]);
  });

  it("returns local time for a city", async () => {
    const created = await store.create({
      name: "Los Angeles",
      countryId,
      latitude: 34.0522,
      longitude: -118.2437,
      timezone: "America/Los_Angeles",
      population: 3979576,
    });

    const localTime = await store.getLocalTime(
      created.id,
      "2020-06-14T19:00:00.000Z",
    );

    expect(localTime.locationName).toBe("Los Angeles");
    expect(localTime.countryName).toBe("United States");
    expect(localTime.local.hour).toBe(12);
  });

  it("allows duplicate city names in the same country when region differs", async () => {
    const missouri = await store.create({
      name: "Columbia",
      countryId,
      region: "Missouri",
      latitude: 38.9517,
      longitude: -92.3341,
      timezone: "America/Chicago",
      population: 126_000,
    });
    const southCarolina = await store.create({
      name: "Columbia",
      countryId,
      region: "South Carolina",
      latitude: 34.0007,
      longitude: -81.0348,
      timezone: "America/New_York",
      population: 137_000,
    });

    expect(missouri.region).toBe("Missouri");
    expect(southCarolina.region).toBe("South Carolina");
    expect(await store.list()).toHaveLength(2);
  });

  it("prevents deleting a location that still has venues", async () => {
    const created = await store.create({
      name: "Chicago",
      countryId,
      latitude: 41.8781,
      longitude: -87.6298,
      timezone: "America/Chicago",
      population: 2746388,
    });

    await getVenueStore().create({
      locationId: created.id,
      name: "Soldier Field",
      latitude: 41.8623,
      longitude: -87.6167,
      isIndoor: false,
    });

    await expect(store.delete(created.id)).rejects.toThrowError(
      expect.objectContaining({ code: LocationErrorCodes.LOCATION_HAS_VENUES }),
    );
  });

  it("rejects create when countryId is omitted", async () => {
    await expect(
      store.create({
        name: "Ghost City",
        latitude: 0,
        longitude: 0,
        timezone: "UTC",
        population: 1,
      }),
    ).rejects.toThrowError(
      expect.objectContaining({ code: LocationErrorCodes.COUNTRY_REQUIRED }),
    );
  });

  it("rejects legacy country string instead of countryId", async () => {
    await expect(
      store.create({
        name: "Ghost City",
        country: "United States",
        latitude: 0,
        longitude: 0,
        timezone: "UTC",
        population: 1,
      }),
    ).rejects.toThrowError(
      expect.objectContaining({ code: LocationErrorCodes.INVALID_COUNTRY_ID }),
    );
  });

  it("rejects unknown country on create", async () => {
    await expect(
      store.create({
        name: "Ghost City",
        countryId: "missing-country",
        latitude: 0,
        longitude: 0,
        timezone: "UTC",
        population: 1,
      }),
    ).rejects.toThrowError(
      expect.objectContaining({ code: LocationErrorCodes.COUNTRY_NOT_FOUND }),
    );
  });
});

describe("buildLocation", () => {
  it("trims name and timezone", () => {
    const location = buildLocation(
      {
        name: "  Tokyo  ",
        countryId: "country-id",
        latitude: 35.6762,
        longitude: 139.6503,
        timezone: " Asia/Tokyo ",
        population: 13960000,
      },
      "test-id",
      " Japan ",
    );

    expect(location.name).toBe("Tokyo");
    expect(location.region).toBeNull();
    expect(location.countryName).toBe("Japan");
    expect(location.timezone).toBe("Asia/Tokyo");
  });
});
