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
import { mergeNbaSeed } from "./nba";
import {
  NBA_CONFERENCE_SEED_DATA,
  NBA_DIVISION_SEED_DATA,
  NBA_LOCATION_SEED_DATA,
  NBA_TEAM_SEED_DATA,
} from "./nba-teams.data";

describe("nba seed", () => {
  it("defines the full NBA catalog", () => {
    expect(NBA_CONFERENCE_SEED_DATA).toHaveLength(2);
    expect(NBA_DIVISION_SEED_DATA).toHaveLength(6);
    expect(NBA_TEAM_SEED_DATA).toHaveLength(30);
    expect(NBA_LOCATION_SEED_DATA.length).toBeGreaterThan(0);
  });

  it("merges the full NBA hierarchy with venues and teams", async () => {
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
      NBA_LOCATION_SEED_DATA,
    );

    const originalEnv = process.env.NBA_SEED_ON_STARTUP;
    process.env.NBA_SEED_ON_STARTUP = "true";

    try {
      const result = await mergeNbaSeed({
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

      const league = await leagueRepository.getByAbbreviation("NBA");
      expect(league?.logo).toMatch(/^\/logos\/leagues\/nba\.png$/);

      for (const team of await teamRepository.list()) {
        expect(team.logo).toMatch(/^\/logos\/nba\/[a-z0-9]+\.png$/);
        expect(team.venueId).toBeTruthy();
        expect(team.leagueName).toBe("National Basketball Association");
      }
    } finally {
      process.env.NBA_SEED_ON_STARTUP = originalEnv;
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
      NBA_LOCATION_SEED_DATA,
    );

    const originalEnv = process.env.NBA_SEED_ON_STARTUP;
    process.env.NBA_SEED_ON_STARTUP = "true";

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
      await mergeNbaSeed(repositories);
      const second = await mergeNbaSeed(repositories);

      expect(second.teamsAdded).toBe(0);
      expect(second.teamsSkipped).toBe(30);
      expect(await teamRepository.list()).toHaveLength(30);
    } finally {
      process.env.NBA_SEED_ON_STARTUP = originalEnv;
    }
  });
});
