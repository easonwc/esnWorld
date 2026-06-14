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
import { mergeNhlSeed } from "./nhl";
import {
  NHL_CONFERENCE_SEED_DATA,
  NHL_DIVISION_SEED_DATA,
  NHL_LOCATION_SEED_DATA,
  NHL_TEAM_SEED_DATA,
} from "./nhl-teams.data";

describe("nhl seed", () => {
  it("defines the full NHL catalog", () => {
    expect(NHL_CONFERENCE_SEED_DATA).toHaveLength(2);
    expect(NHL_DIVISION_SEED_DATA).toHaveLength(4);
    expect(NHL_TEAM_SEED_DATA).toHaveLength(32);
    expect(NHL_LOCATION_SEED_DATA.length).toBeGreaterThan(0);
  });

  it("merges the full NHL hierarchy with venues and teams", async () => {
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
      NHL_LOCATION_SEED_DATA,
    );

    const originalEnv = process.env.NHL_SEED_ON_STARTUP;
    process.env.NHL_SEED_ON_STARTUP = "true";

    try {
      const result = await mergeNhlSeed({
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
      expect(await divisionRepository.list()).toHaveLength(4);
      expect(await teamRepository.list()).toHaveLength(32);

      const league = await leagueRepository.getByAbbreviation("NHL");
      expect(league?.logo).toMatch(/^\/logos\/leagues\/nhl\.png$/);

      for (const team of await teamRepository.list()) {
        expect(team.logo).toMatch(/^\/logos\/nhl\/[a-z0-9]+\.png$/);
        expect(team.venueId).toBeTruthy();
        expect(team.leagueName).toBe("National Hockey League");
      }
    } finally {
      process.env.NHL_SEED_ON_STARTUP = originalEnv;
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
      NHL_LOCATION_SEED_DATA,
    );

    const originalEnv = process.env.NHL_SEED_ON_STARTUP;
    process.env.NHL_SEED_ON_STARTUP = "true";

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
      await mergeNhlSeed(repositories);
      const second = await mergeNhlSeed(repositories);

      expect(second.teamsAdded).toBe(0);
      expect(second.teamsSkipped).toBe(32);
      expect(await teamRepository.list()).toHaveLength(32);
    } finally {
      process.env.NHL_SEED_ON_STARTUP = originalEnv;
    }
  });
});
