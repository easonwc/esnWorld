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
import { mergeWnbaSeed } from "./wnba";
import {
  WNBA_CONFERENCE_SEED_DATA,
  WNBA_DIVISION_SEED_DATA,
  WNBA_LOCATION_SEED_DATA,
  WNBA_TEAM_SEED_DATA,
} from "./wnba-teams.data";

describe("wnba seed", () => {
  it("defines the full WNBA catalog", () => {
    expect(WNBA_CONFERENCE_SEED_DATA).toHaveLength(2);
    expect(WNBA_DIVISION_SEED_DATA).toHaveLength(2);
    expect(WNBA_TEAM_SEED_DATA).toHaveLength(13);
    expect(WNBA_LOCATION_SEED_DATA.length).toBeGreaterThan(0);
  });

  it("merges the full WNBA hierarchy with venues and teams", async () => {
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
      WNBA_LOCATION_SEED_DATA,
    );

    const originalEnv = process.env.WNBA_SEED_ON_STARTUP;
    process.env.WNBA_SEED_ON_STARTUP = "true";

    try {
      const result = await mergeWnbaSeed({
        countryRepository,
        locationRepository,
        leagueRepository,
        conferenceRepository,
        divisionRepository,
        venueRepository,
        teamRepository,
      });

      expect(result.enabled).toBe(true);
      expect(result.teamsAdded).toBe(13);
      expect(await leagueRepository.list()).toHaveLength(1);
      expect(await conferenceRepository.list()).toHaveLength(2);
      expect(await divisionRepository.list()).toHaveLength(2);
      expect(await teamRepository.list()).toHaveLength(13);

      const league = await leagueRepository.getByAbbreviation("WNBA");
      expect(league?.logo).toMatch(/^\/logos\/leagues\/wnba\.png$/);

      for (const team of await teamRepository.list()) {
        expect(team.logo).toMatch(/^\/logos\/wnba\/[a-z0-9]+\.png$/);
        expect(team.venueId).toBeTruthy();
        expect(team.leagueName).toBe("Women's National Basketball Association");
      }
    } finally {
      process.env.WNBA_SEED_ON_STARTUP = originalEnv;
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
      WNBA_LOCATION_SEED_DATA,
    );

    const originalEnv = process.env.WNBA_SEED_ON_STARTUP;
    process.env.WNBA_SEED_ON_STARTUP = "true";

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
      await mergeWnbaSeed(repositories);
      const second = await mergeWnbaSeed(repositories);

      expect(second.teamsAdded).toBe(0);
      expect(second.teamsSkipped).toBe(13);
      expect(await teamRepository.list()).toHaveLength(13);
    } finally {
      process.env.WNBA_SEED_ON_STARTUP = originalEnv;
    }
  });
});
