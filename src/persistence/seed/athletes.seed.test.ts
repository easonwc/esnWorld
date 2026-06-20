import { resetCountryStore } from "@/modules/countries";
import { getGolferStore, resetGolferStore } from "@/modules/golfers";
import { resetHumanStore } from "@/modules/humans";
import { resetLocationStore } from "@/modules/locations";
import { getTennisPlayerStore, resetTennisPlayerStore } from "@/modules/tennis-players";
import { resetWorldClockService } from "@/modules/world-clock";
import { seedUnitedStatesCountry } from "@/test/world-fixtures";
import { beforeEach, describe, expect, it } from "vitest";
import { loadGolfersSeedConfig, loadTennisPlayersSeedConfig } from "./athletes-config";
import { mergeGolfersSeed } from "./golfers";
import { mergeTennisPlayersSeed } from "./tennis-players";

describe("athletes seed config", () => {
  it("loads golfer counts from env", () => {
    expect(
      loadGolfersSeedConfig({
        GOLFERS_SEED_ON_STARTUP: "true",
        GOLFERS_SEED_MALE_COUNT: "200",
        GOLFERS_SEED_FEMALE_COUNT: "144",
        ATHLETES_SEED: "7",
      }),
    ).toEqual({
      enabled: true,
      maleCount: 200,
      femaleCount: 144,
      baseSeed: 7,
    });
  });

  it("loads tennis player counts from env", () => {
    expect(
      loadTennisPlayersSeedConfig({
        TENNIS_PLAYERS_SEED_ON_STARTUP: "true",
        TENNIS_PLAYERS_SEED_MALE_COUNT: "96",
        TENNIS_PLAYERS_SEED_FEMALE_COUNT: "96",
      }),
    ).toEqual({
      enabled: true,
      maleCount: 96,
      femaleCount: 96,
      baseSeed: 42,
    });
  });
});

describe("mergeGolfersSeed", () => {
  beforeEach(async () => {
    resetWorldClockService();
    resetCountryStore();
    resetLocationStore();
    resetHumanStore();
    resetGolferStore();

    const country = await seedUnitedStatesCountry();
    await resetLocationStore().create({
      name: "Dallas",
      countryId: country.id,
      region: "Texas",
      latitude: 32.7767,
      longitude: -96.797,
      timezone: "America/Chicago",
      population: 1_300_000,
    });
  });

  it("creates procedural humans and golfer profiles by gender", async () => {
    const result = await mergeGolfersSeed({
      enabled: true,
      maleCount: 3,
      femaleCount: 2,
      baseSeed: 99,
    });

    expect(result).toMatchObject({
      enabled: true,
      humansAdded: 5,
      golfersAdded: 5,
      missingLocations: false,
    });

    const golfers = await getGolferStore().list();
    expect(golfers.filter((g) => g.humanGender === "male")).toHaveLength(3);
    expect(golfers.filter((g) => g.humanGender === "female")).toHaveLength(2);
  });

  it("is idempotent when targets are already met", async () => {
    const config = {
      enabled: true,
      maleCount: 2,
      femaleCount: 1,
      baseSeed: 11,
    };

    await mergeGolfersSeed(config);
    const second = await mergeGolfersSeed(config);

    expect(second.humansAdded).toBe(0);
    expect(second.golfersAdded).toBe(0);
    expect(await getGolferStore().count()).toBe(3);
  });
});

describe("mergeTennisPlayersSeed", () => {
  beforeEach(async () => {
    resetWorldClockService();
    resetCountryStore();
    resetLocationStore();
    resetHumanStore();
    resetTennisPlayerStore();

    const country = await seedUnitedStatesCountry();
    await resetLocationStore().create({
      name: "Orlando",
      countryId: country.id,
      region: "Florida",
      latitude: 28.5383,
      longitude: -81.3792,
      timezone: "America/New_York",
      population: 300_000,
    });
  });

  it("creates procedural humans and tennis player profiles by gender", async () => {
    const result = await mergeTennisPlayersSeed({
      enabled: true,
      maleCount: 2,
      femaleCount: 3,
      baseSeed: 55,
    });

    expect(result).toMatchObject({
      enabled: true,
      humansAdded: 5,
      tennisPlayersAdded: 5,
      missingLocations: false,
    });

    const players = await getTennisPlayerStore().list();
    expect(players.filter((p) => p.humanGender === "male")).toHaveLength(2);
    expect(players.filter((p) => p.humanGender === "female")).toHaveLength(3);
    expect(players[0]?.serve.serve).toBeGreaterThanOrEqual(0);
    expect(players[0]?.surfacePreference).not.toBeNull();
  });
});
