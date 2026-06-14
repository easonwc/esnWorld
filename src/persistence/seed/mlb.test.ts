import {
  MemoryConferenceRepository,
  MemoryCountryRepository,
  MemoryDivisionRepository,
  MemoryLeagueRepository,
  MemoryLocationRepository,
  MemoryTeamRepository,
  MemoryVenueRepository,
} from "@/persistence/repositories";
import { describe, expect, it } from "vitest";
import { mergeCountrySeed } from "./countries";
import { mergeLocationSeed } from "./locations";
import { LOCATION_SEED_DATA } from "./locations.data";
import { mergeMlbSeed } from "./mlb";
import {
  MLB_CONFERENCE_SEED_DATA,
  MLB_DIVISION_SEED_DATA,
  MLB_LOCATION_SEED_DATA,
  MLB_TEAM_SEED_DATA,
} from "./mlb-teams.data";

describe("mlb seed", () => {
  it("defines the full MLB catalog", () => {
    expect(MLB_CONFERENCE_SEED_DATA).toHaveLength(2);
    expect(MLB_DIVISION_SEED_DATA).toHaveLength(6);
    expect(MLB_TEAM_SEED_DATA).toHaveLength(30);
    expect(MLB_LOCATION_SEED_DATA.length).toBeGreaterThan(0);
  });

  it("merges the full MLB hierarchy with venues and teams", async () => {
    const countryRepository = new MemoryCountryRepository();
    const locationRepository = new MemoryLocationRepository();
    const leagueRepository = new MemoryLeagueRepository();
    const conferenceRepository = new MemoryConferenceRepository();
    const divisionRepository = new MemoryDivisionRepository();
    const venueRepository = new MemoryVenueRepository();
    const teamRepository = new MemoryTeamRepository();

    await mergeCountrySeed(countryRepository);
    await mergeLocationSeed(
      locationRepository,
      countryRepository,
      LOCATION_SEED_DATA,
    );
    await mergeLocationSeed(
      locationRepository,
      countryRepository,
      MLB_LOCATION_SEED_DATA,
    );

    const originalEnv = process.env.MLB_SEED_ON_STARTUP;
    process.env.MLB_SEED_ON_STARTUP = "true";

    try {
      const result = await mergeMlbSeed({
        countryRepository,
        locationRepository,
        leagueRepository,
        conferenceRepository,
        divisionRepository,
        venueRepository,
        teamRepository,
      });

      expect(result.enabled).toBe(true);
      expect(result.teamsAdded).toBe(30);
      expect(await leagueRepository.list()).toHaveLength(1);
      expect(await conferenceRepository.list()).toHaveLength(2);
      expect(await divisionRepository.list()).toHaveLength(6);
      expect(await teamRepository.list()).toHaveLength(30);

      const league = await leagueRepository.getByAbbreviation("MLB");
      expect(league?.logo).toMatch(/^\/logos\/leagues\/mlb\.png$/);

      for (const team of await teamRepository.list()) {
        expect(team.logo).toMatch(/^\/logos\/mlb\/[a-z0-9]+\.png$/);
        expect(team.venueId).toBeTruthy();
        expect(team.leagueName).toBe("Major League Baseball");
      }
    } finally {
      process.env.MLB_SEED_ON_STARTUP = originalEnv;
    }
  });

  it("allows the same abbreviation in different leagues", async () => {
    const countryRepository = new MemoryCountryRepository();
    const locationRepository = new MemoryLocationRepository();
    const leagueRepository = new MemoryLeagueRepository();
    const conferenceRepository = new MemoryConferenceRepository();
    const divisionRepository = new MemoryDivisionRepository();
    const venueRepository = new MemoryVenueRepository();
    const teamRepository = new MemoryTeamRepository();

    await mergeCountrySeed(countryRepository);
    await mergeLocationSeed(
      locationRepository,
      countryRepository,
      LOCATION_SEED_DATA,
    );

    const { NFL_LOCATION_SEED_DATA } = await import("./nfl-teams.data");
    await mergeLocationSeed(
      locationRepository,
      countryRepository,
      NFL_LOCATION_SEED_DATA,
    );
    await mergeLocationSeed(
      locationRepository,
      countryRepository,
      MLB_LOCATION_SEED_DATA,
    );

    const originalNflEnv = process.env.NFL_SEED_ON_STARTUP;
    const originalMlbEnv = process.env.MLB_SEED_ON_STARTUP;
    process.env.NFL_SEED_ON_STARTUP = "true";
    process.env.MLB_SEED_ON_STARTUP = "true";

    const repositories = {
      countryRepository,
      locationRepository,
      leagueRepository,
      conferenceRepository,
      divisionRepository,
      venueRepository,
      teamRepository,
    };

    try {
      const { mergeNflSeed } = await import("./nfl");
      await mergeNflSeed(repositories);
      await mergeMlbSeed(repositories);

      const teams = await teamRepository.list();
      const kcTeams = teams.filter((team) => team.abbreviation === "KC");
      expect(kcTeams).toHaveLength(2);
      expect(kcTeams.map((team) => team.leagueName).sort()).toEqual([
        "Major League Baseball",
        "National Football League",
      ]);
    } finally {
      process.env.NFL_SEED_ON_STARTUP = originalNflEnv;
      process.env.MLB_SEED_ON_STARTUP = originalMlbEnv;
    }
  });
});
