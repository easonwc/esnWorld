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
import { mergeNflSeed } from "./nfl";
import {
  NFL_CONFERENCE_SEED_DATA,
  NFL_DIVISION_SEED_DATA,
  NFL_LOCATION_SEED_DATA,
  NFL_TEAM_SEED_DATA,
} from "./nfl-teams.data";

describe("nfl seed", () => {
  it("defines the full NFL catalog", () => {
    expect(NFL_CONFERENCE_SEED_DATA).toHaveLength(2);
    expect(NFL_DIVISION_SEED_DATA).toHaveLength(8);
    expect(NFL_TEAM_SEED_DATA).toHaveLength(32);
    expect(NFL_LOCATION_SEED_DATA.length).toBeGreaterThan(0);
  });

  it("merges the full NFL hierarchy with venues and teams", async () => {
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
      NFL_LOCATION_SEED_DATA,
    );

    const originalEnv = process.env.NFL_SEED_ON_STARTUP;
    process.env.NFL_SEED_ON_STARTUP = "true";

    try {
      const result = await mergeNflSeed({
        countryRepository,
        locationRepository,
        leagueRepository,
        conferenceRepository,
        divisionRepository,
        venueRepository,
        teamRepository,
      });

      expect(result.enabled).toBe(true);
      expect(result.teamsAdded).toBe(32);
      expect(await leagueRepository.list()).toHaveLength(1);
      expect(await conferenceRepository.list()).toHaveLength(2);
      expect(await divisionRepository.list()).toHaveLength(8);
      expect(await venueRepository.list().then((v) => v.length)).toBeLessThanOrEqual(30);
      expect(await venueRepository.list().then((v) => v.length)).toBeGreaterThanOrEqual(28);
      expect(await teamRepository.list()).toHaveLength(32);

      const league = await leagueRepository.getByAbbreviation("NFL");
      expect(league?.logo).toMatch(/^\/logos\/leagues\/nfl\.png$/);

      for (const team of await teamRepository.list()) {
        expect(team.logo).toMatch(/^\/logos\/nfl\/[a-z0-9]+\.png$/);
        expect(team.venueId).toBeTruthy();
        expect(team.leagueName).toBe("National Football League");
      }
    } finally {
      process.env.NFL_SEED_ON_STARTUP = originalEnv;
    }
  });

  it("is idempotent on a second merge", async () => {
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
      NFL_LOCATION_SEED_DATA,
    );

    const originalEnv = process.env.NFL_SEED_ON_STARTUP;
    process.env.NFL_SEED_ON_STARTUP = "true";

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
      await mergeNflSeed(repositories);
      const second = await mergeNflSeed(repositories);

      expect(second.teamsAdded).toBe(0);
      expect(second.teamsSkipped).toBe(32);
      expect(await teamRepository.list()).toHaveLength(32);
    } finally {
      process.env.NFL_SEED_ON_STARTUP = originalEnv;
    }
  });
});
