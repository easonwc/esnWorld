import { describe, expect, it } from "vitest";
import { computeSeasonalBaseline } from "@/modules/weather/seasonal";
import {
  createWeatherSystems,
  haversineKm,
  systemPositionAt,
} from "@/modules/weather/systems";

describe("seasonal baseline", () => {
  it("returns warmer summer than winter for northern cities", () => {
    const summer = computeSeasonalBaseline(40.7, 2020, 6, 14);
    const winter = computeSeasonalBaseline(40.7, 2020, 1, 15);

    expect(summer.temperatureF).toBeGreaterThan(winter.temperatureF);
  });
});

describe("moving weather systems", () => {
  const systems = createWeatherSystems(42, Date.parse("2020-01-01T00:00:00.000Z"));

  it("creates deterministic systems from seed", () => {
    const again = createWeatherSystems(42, Date.parse("2020-01-01T00:00:00.000Z"));
    expect(again).toEqual(systems);
  });

  it("moves system position as world time advances", () => {
    const start = systemPositionAt(systems[0], Date.parse("2020-01-01T00:00:00.000Z"));
    const later = systemPositionAt(
      systems[0],
      Date.parse("2020-01-02T00:00:00.000Z"),
    );

    expect(later.lat).not.toBe(start.lat);
    expect(later.lon).not.toBe(start.lon);
  });

  it("computes distance between coordinates", () => {
    const distance = haversineKm(40.7, -74.0, 34.0, -118.2);
    expect(distance).toBeGreaterThan(3900);
    expect(distance).toBeLessThan(4000);
  });
});
