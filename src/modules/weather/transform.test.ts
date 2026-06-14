import { describe, expect, it, beforeEach } from "vitest";
import { resetEventStore } from "@/modules/events";
import { resetLocationStore } from "@/modules/locations";
import { resetVenueStore } from "@/modules/venues";
import {
  WeatherService,
  executeWeather,
  resetWeatherService,
  transformWeatherAtPoint,
} from "@/modules/weather";
import { createWeatherSystems } from "@/modules/weather/systems";

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

  beforeEach(() => {
    resetLocationStore();
    resetVenueStore();
    resetEventStore();
    resetWeatherService();

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
    }).id;

    eventId = resetEventStore().create({
      name: "Championship Final",
      venueId,
      localStart: { year: 2020, month: 6, day: 14, hour: 12, minute: 0 },
      durationMinutes: 120,
    }).id;
  });

  it("gets weather at a venue", () => {
    const result = executeWeather({
      action: "getAtVenue",
      venueId,
      isoUtc: "2020-06-14T16:00:00.000Z",
    });

    expect(result).toMatchObject({
      venueId,
      venueName: "Madison Square Garden",
      locationName: "New York",
    });
  });

  it("gets weather for an event at start", () => {
    const result = executeWeather({
      action: "getForEvent",
      eventId,
      phase: "start",
    });

    expect(result).toMatchObject({
      venueId,
      isoUtc: "2020-06-14T16:00:00.000Z",
    });
  });

  it("lists moving systems at a time", () => {
    const result = executeWeather({
      action: "listSystems",
      isoUtc: "2020-06-14T16:00:00.000Z",
    });

    expect(result).toMatchObject({
      isoUtc: "2020-06-14T16:00:00.000Z",
    });
    expect("systems" in result && result.systems.length).toBe(3);
  });
});
