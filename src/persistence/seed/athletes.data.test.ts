import type { Location } from "@/modules/locations/types";
import { COUNTRY_SEED_DATA } from "./countries.data";
import { describe, expect, it } from "vitest";
import {
  athleteHumanIdentityKey,
  athleteGivenName,
  athleteFamilyName,
  athleteNameCultureUsesPool,
  listUnmappedAthleteNameCountries,
  resolveAthleteNameCulture,
} from "./athletes.data";
import { buildProceduralHumanSeedInput } from "./athletes-generate";

const mockLocations: Location[] = Array.from({ length: 50 }, (_, index) => ({
  id: `loc-${index}`,
  name: index === 0 ? "Miami" : `City-${index}`,
  countryId: "usa",
  countryName: "United States",
  region: index === 0 ? "Florida" : "Region",
  latitude: 25 + index * 0.1,
  longitude: -80 - index * 0.1,
  timezone: "America/New_York",
  population: 100_000 + index,
}));

function collectHumanIdentities(input: {
  sport: "golfer" | "tennis";
  gender: "male" | "female";
  count: number;
  baseSeed: number;
  asOfYear: number;
}) {
  const keys = new Set<string>();
  const displayNames = new Map<string, number>();

  for (let index = 0; index < input.count; index += 1) {
    const human = buildProceduralHumanSeedInput({
      sport: input.sport,
      gender: input.gender,
      index,
      baseSeed: input.baseSeed,
      asOfYear: input.asOfYear,
      locations: mockLocations,
    });

    expect(human).not.toBeNull();

    const identityKey = athleteHumanIdentityKey({
      givenName: human!.givenName,
      familyName: human!.familyName,
      gender: human!.gender,
      birthDate: human!.birthDate,
      birthLocationId: human!.birthLocationId,
    });

    expect(keys.has(identityKey)).toBe(false);
    keys.add(identityKey);

    const displayName = `${human!.givenName} ${human!.familyName}`;
    displayNames.set(displayName, (displayNames.get(displayName) ?? 0) + 1);
  }

  return { keys, displayNames };
}

describe("athlete name country mapping", () => {
  it("maps all 200 seeded countries to a name culture", () => {
    expect(COUNTRY_SEED_DATA).toHaveLength(200);
    expect(listUnmappedAthleteNameCountries(COUNTRY_SEED_DATA)).toEqual([]);
  });
});

describe("athlete human identity generation", () => {
  it("allows repeated given names when index wraps the pool", () => {
    const culture = resolveAthleteNameCulture("United States");
    expect(athleteGivenName("male", 0, culture)).toBe(
      athleteGivenName("male", 32, culture),
    );
  });

  it("uses Japanese names for births in Japan", () => {
    const tokyo: Location = {
      id: "tokyo",
      name: "Tokyo",
      countryId: "jp",
      countryName: "Japan",
      region: null,
      latitude: 35.6762,
      longitude: 139.6503,
      timezone: "Asia/Tokyo",
      population: 37_000_000,
    };

    const human = buildProceduralHumanSeedInput({
      sport: "golfer",
      gender: "male",
      index: 0,
      baseSeed: 42,
      asOfYear: 2026,
      locations: [tokyo],
    });

    expect(human).not.toBeNull();
    expect(resolveAthleteNameCulture("Japan")).toBe("japanese");
    expect(athleteNameCultureUsesPool("japanese", human!.givenName)).toBe(true);
    expect(athleteNameCultureUsesPool("english_american", human!.givenName)).toBe(
      false,
    );
  });

  it("uses American names for births in the United States", () => {
    const human = buildProceduralHumanSeedInput({
      sport: "golfer",
      gender: "male",
      index: 0,
      baseSeed: 42,
      asOfYear: 2026,
      locations: mockLocations,
    });

    expect(human).not.toBeNull();
    expect(athleteNameCultureUsesPool("english_american", human!.givenName)).toBe(
      true,
    );
  });

  it("keeps gender + name + birth date + birthplace unique for 200 male golfers", () => {
    const { keys } = collectHumanIdentities({
      sport: "golfer",
      gender: "male",
      count: 200,
      baseSeed: 42,
      asOfYear: 2026,
    });

    expect(keys.size).toBe(200);
  });

  it("keeps gender + name + birth date + birthplace unique for 144 female golfers", () => {
    const { keys } = collectHumanIdentities({
      sport: "golfer",
      gender: "female",
      count: 144,
      baseSeed: 42,
      asOfYear: 2026,
    });

    expect(keys.size).toBe(144);
  });

  it("keeps gender + name + birth date + birthplace unique for 128 tennis players per gender", () => {
    for (const gender of ["male", "female"] as const) {
      const { keys } = collectHumanIdentities({
        sport: "tennis",
        gender,
        count: 128,
        baseSeed: 7,
        asOfYear: 2026,
      });

      expect(keys.size).toBe(128);
    }
  });
});
