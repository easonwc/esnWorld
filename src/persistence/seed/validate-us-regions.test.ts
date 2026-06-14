import { describe, expect, it } from "vitest";
import { COLLEGE_SEED_DATA } from "./colleges.data";
import { LOCATION_SEED_DATA } from "./locations.data";
import { NCAA_LOCATION_SEED_DATA } from "./ncaa-locations.data";
import { TENNIS_GOLF_LOCATION_SEED_DATA } from "./tennis-golf-locations.data";
import { MLB_TEAM_SEED_DATA } from "./mlb-teams.data";
import { MLS_TEAM_SEED_DATA } from "./mls-teams.data";
import { NBA_TEAM_SEED_DATA } from "./nba-teams.data";
import { NFL_TEAM_SEED_DATA } from "./nfl-teams.data";
import { NHL_TEAM_SEED_DATA } from "./nhl-teams.data";
import { WNBA_TEAM_SEED_DATA } from "./wnba-teams.data";
import type { LocationSeedEntry } from "./types";
import {
  UNITED_STATES,
  requireUsSeedRegion,
} from "./validate-us-regions";

function assertUsLocationSeedRegions(
  entries: readonly LocationSeedEntry[],
  source: string,
) {
  for (const entry of entries) {
    if (entry.countryName !== UNITED_STATES) {
      continue;
    }

    expect(
      entry.region?.trim(),
      `${source}: ${entry.name} is missing a US state region`,
    ).toBeTruthy();
  }
}

describe("US seed region requirements", () => {
  it("requires a state region for every United States city in location catalogs", () => {
    assertUsLocationSeedRegions(LOCATION_SEED_DATA, "LOCATION_SEED_DATA");
    assertUsLocationSeedRegions(NCAA_LOCATION_SEED_DATA, "NCAA_LOCATION_SEED_DATA");
    assertUsLocationSeedRegions(
      TENNIS_GOLF_LOCATION_SEED_DATA,
      "TENNIS_GOLF_LOCATION_SEED_DATA",
    );
  });

  it("requires a state region for every United States college campus", () => {
    for (const entry of COLLEGE_SEED_DATA) {
      if (entry.countryName !== UNITED_STATES) {
        continue;
      }

      expect(
        entry.locationRegion?.trim(),
        `College ${entry.name} is missing a US state region`,
      ).toBeTruthy();
    }
  });

  it("requires a state region for every United States sports team home city", () => {
    const teamCatalogs = [
      ["NFL", NFL_TEAM_SEED_DATA],
      ["NBA", NBA_TEAM_SEED_DATA],
      ["MLB", MLB_TEAM_SEED_DATA],
      ["NHL", NHL_TEAM_SEED_DATA],
      ["MLS", MLS_TEAM_SEED_DATA],
      ["WNBA", WNBA_TEAM_SEED_DATA],
    ] as const;

    for (const [league, teams] of teamCatalogs) {
      for (const team of teams) {
        if (team.countryName !== UNITED_STATES) {
          continue;
        }

        expect(
          team.locationRegion?.trim(),
          `${league} ${team.name} is missing a US state region`,
        ).toBeTruthy();
      }
    }
  });

  it("allows optional regions for non-US countries in seed validation helper", () => {
    expect(
      requireUsSeedRegion("Canada", undefined, "Toronto"),
    ).toBeNull();
    expect(
      requireUsSeedRegion("Canada", "Ontario", "Toronto"),
    ).toBe("Ontario");
  });

  it("rejects missing US regions in seed validation helper", () => {
    expect(() =>
      requireUsSeedRegion(UNITED_STATES, "", "Seed location Boston"),
    ).toThrow(/US state required in seed data/);
  });
});
