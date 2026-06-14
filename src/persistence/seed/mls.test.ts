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
import { mergeMlsSeed } from "./mls";
import {
  MLS_CONFERENCE_SEED_DATA,
  MLS_DIVISION_SEED_DATA,
  MLS_LOCATION_SEED_DATA,
  MLS_TEAM_SEED_DATA,
} from "./mls-teams.data";

describe("mls seed", () => {
  it("defines the full MLS catalog", () => {
    expect(MLS_CONFERENCE_SEED_DATA).toHaveLength(2);
    expect(MLS_DIVISION_SEED_DATA).toHaveLength(2);
    expect(MLS_TEAM_SEED_DATA).toHaveLength(30);
    expect(MLS_LOCATION_SEED_DATA.length).toBeGreaterThan(0);
  });

  it("merges the full MLS hierarchy with venues and teams", async () => {
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
      MLS_LOCATION_SEED_DATA,
    );

    const originalEnv = process.env.MLS_SEED_ON_STARTUP;
    process.env.MLS_SEED_ON_STARTUP = "true";

    try {
      const result = await mergeMlsSeed({
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
      expect(await divisionRepository.list()).toHaveLength(2);
      expect(await teamRepository.list()).toHaveLength(30);

      const league = await leagueRepository.getByAbbreviation("MLS");
      expect(league?.logo).toMatch(/^\/logos\/leagues\/mls\.png$/);

      for (const team of await teamRepository.list()) {
        expect(team.logo).toMatch(/^\/logos\/mls\/[a-z0-9]+\.png$/);
        expect(team.venueId).toBeTruthy();
        expect(team.leagueName).toBe("Major League Soccer");
      }
    } finally {
      process.env.MLS_SEED_ON_STARTUP = originalEnv;
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
      MLS_LOCATION_SEED_DATA,
    );

    const originalEnv = process.env.MLS_SEED_ON_STARTUP;
    process.env.MLS_SEED_ON_STARTUP = "true";

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
      await mergeMlsSeed(repositories);
      const second = await mergeMlsSeed(repositories);

      expect(second.teamsAdded).toBe(0);
      expect(second.teamsSkipped).toBe(30);
      expect(await teamRepository.list()).toHaveLength(30);
    } finally {
      process.env.MLS_SEED_ON_STARTUP = originalEnv;
    }
  });
});
