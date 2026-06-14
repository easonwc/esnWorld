import { describe, expect, it, beforeEach } from "vitest";
import { resetEventStore } from "@/modules/events";
import { resetVenueStore } from "@/modules/venues";
import {
  WeatherService,
  executeWeather,
  resetWeatherService,
  transformWeatherAtPoint,
} from "@/modules/weather";
import { createWeatherSystems } from "@/modules/weather/systems";
import {
  seedNewYorkLocation,
  seedUnitedStatesCountry,
  resetWorldFixtures,
} from "@/test/world-fixtures";

describe("weather transform", () => {
  const systems = createWeatherSystems(42, Date.parse("2020-01-01T00:00:00.000Z"));
  const service = new WeatherService(systems);

  it("combines seasonal baseline with system influence", () => {
    const output = transformWeatherAtPoint(
      {
        latitude: 40.7505,
        longitude: -73.9934,
        isoUtc: "2020-06-14T16:00:00.000Z",
        locationId: "loc-1",
        locationName: "New York",
        country: "United States",
        timezone: "America/New_York",
        venueId: "venue-1",
        venueName: "Madison Square Garden",
        isIndoor: true,
        weatherApplies: false,
      },
      service.getSystems(),
      service.getConfig(),
    );

    expect(output.conditions.temperatureUnit).toBe("fahrenheit");
    expect(output.conditions.summary).toBeTruthy();
    expect(output.seasonalBaseline.temperature).toBeTruthy();
    expect(output.dayOfYear).toBe(166);
  });

  it("produces the same forecast for the same seed and time", () => {
    const point = {
      latitude: 40.75,
      longitude: -73.99,
      isoUtc: "2020-06-14T16:00:00.000Z",
      locationId: "loc-1",
      locationName: "New York",
      country: "United States",
      timezone: "America/New_York",
      weatherApplies: true,
    };

    const first = transformWeatherAtPoint(
      point,
      systems,
      service.getConfig(),
    );
    const second = transformWeatherAtPoint(
      point,
      systems,
      service.getConfig(),
    );

    expect(second).toEqual(first);
  });
});

describe("executeWeather", () => {
  let venueId: string;
  let eventId: string;

  beforeEach(async () => {
    await resetWorldFixtures();
    resetEventStore();
    resetVenueStore();
    resetWeatherService();

    const country = await seedUnitedStatesCountry();
    const location = await seedNewYorkLocation(country.id);

    venueId = (
      await resetVenueStore().create({
        locationId: location.id,
        name: "Madison Square Garden",
        latitude: 40.7505,
        longitude: -73.9934,
        isIndoor: true,
      })
    ).id;

    eventId = (
      await resetEventStore().create({
        name: "Championship Final",
        venueId,
        localStart: { year: 2020, month: 6, day: 14, hour: 12, minute: 0 },
        durationMinutes: 120,
      })
    ).id;
  });

  it("gets weather at a venue", async () => {
    const result = await executeWeather({
      action: "getAtVenue",
      venueId,
      isoUtc: "2020-06-14T16:00:00.000Z",
    });

    expect(result).toMatchObject({
      venueId,
      venueName: "Madison Square Garden",
      locationName: "New York",
      isIndoor: true,
      weatherApplies: false,
    });
  });

  it("gets weather for an event at start", async () => {
    const result = await executeWeather({
      action: "getForEvent",
      eventId,
      phase: "start",
    });

    expect(result).toMatchObject({
      venueId,
      isoUtc: "2020-06-14T16:00:00.000Z",
      weatherApplies: false,
    });
  });

  it("lists moving systems at a time", async () => {
    const result = await executeWeather({
      action: "listSystems",
      isoUtc: "2020-06-14T16:00:00.000Z",
    });

    expect(result).toMatchObject({
      isoUtc: "2020-06-14T16:00:00.000Z",
    });
    expect("systems" in result && result.systems.length).toBe(3);
  });
});
