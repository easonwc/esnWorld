import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TeamStore } from "@/modules/teams";
import { closeDb, getDb } from "@/persistence/db";
import { mergeCountrySeed } from "@/persistence/seed/countries";
import { COUNTRY_SEED_DATA } from "@/persistence/seed/countries.data";
import { mergeLocationSeed } from "@/persistence/seed/locations";
import { LOCATION_SEED_DATA } from "@/persistence/seed/locations.data";
import { mergeNflSeed } from "@/persistence/seed/nfl";
import { NFL_LOCATION_SEED_DATA } from "@/persistence/seed/nfl-teams.data";
import { SqliteCountryRepository } from "./country.sqlite";
import { SqliteConferenceRepository } from "./conference.sqlite";
import { SqliteDivisionRepository } from "./division.sqlite";
import { SqliteLeagueRepository } from "./league.sqlite";
import { SqliteLocationRepository } from "./location.sqlite";
import { SqliteTeamRepository } from "./team.sqlite";
import { SqliteVenueRepository } from "./venue.sqlite";

function createSqliteRepositories() {
  const db = getDb();
  return {
    countryRepository: new SqliteCountryRepository(db),
    locationRepository: new SqliteLocationRepository(db),
    leagueRepository: new SqliteLeagueRepository(db),
    conferenceRepository: new SqliteConferenceRepository(db),
    divisionRepository: new SqliteDivisionRepository(db),
    venueRepository: new SqliteVenueRepository(db),
    teamRepository: new SqliteTeamRepository(db),
  };
}

describe("sqlite repository integration", () => {
  const originalDatabasePath = process.env.DATABASE_PATH;
  const originalDatabaseReset = process.env.DATABASE_RESET_ON_STARTUP;
  const originalNflSeed = process.env.NFL_SEED_ON_STARTUP;
  let tempDir = "";

  beforeEach(() => {
    tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "esnworld-sqlite-integration-"),
    );
    process.env.DATABASE_PATH = path.join(tempDir, "world.db");
    process.env.DATABASE_RESET_ON_STARTUP = "false";
    closeDb();
    getDb();
  });

  afterEach(() => {
    closeDb();
    if (tempDir) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      tempDir = "";
    }
    process.env.DATABASE_PATH = originalDatabasePath;
    process.env.DATABASE_RESET_ON_STARTUP = originalDatabaseReset;
    process.env.NFL_SEED_ON_STARTUP = originalNflSeed;
  });

  it("applies migrations and exposes core tables", () => {
    const tables = getDb()
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
      .all() as { name: string }[];

    const tableNames = tables.map((table) => table.name);
    expect(tableNames).toContain("countries");
    expect(tableNames).toContain("locations");
    expect(tableNames).toContain("teams");
    expect(tableNames).toContain("events");
    expect(tableNames).toContain("schema_migrations");
  });

  it("lists locations with joined country names from sqlite", async () => {
    const {
      countryRepository,
      locationRepository,
    } = createSqliteRepositories();
    const countries = COUNTRY_SEED_DATA.filter((country) =>
      ["United States", "Canada", "Mexico"].includes(country.name),
    );

    await mergeCountrySeed(countryRepository, countries);
    await mergeLocationSeed(
      locationRepository,
      countryRepository,
      LOCATION_SEED_DATA.filter((entry) =>
        countries.some((country) => country.name === entry.countryName),
      ).slice(0, 5),
    );

    const locations = await locationRepository.list();
    expect(locations.length).toBeGreaterThan(0);
    for (const location of locations) {
      expect(location.countryName).toBeTruthy();
      expect(location.countryId).toBeTruthy();
    }
  });

  it("aggregates population totals in one grouped query", async () => {
    const {
      countryRepository,
      locationRepository,
    } = createSqliteRepositories();
    const countries = COUNTRY_SEED_DATA.filter((country) =>
      ["United States", "United Kingdom"].includes(country.name),
    );
    const countryNames = new Set(countries.map((country) => country.name));

    await mergeCountrySeed(countryRepository, countries);
    await mergeLocationSeed(
      locationRepository,
      countryRepository,
      LOCATION_SEED_DATA.filter((entry) => countryNames.has(entry.countryName)).slice(
        0,
        6,
      ),
    );

    const totals = await locationRepository.populationTotalsByCountry();
    const countryRecords = await countryRepository.list();
    const allLocations = await locationRepository.list();

    expect(totals.size).toBeGreaterThan(0);
    for (const country of countryRecords) {
      const expected = allLocations
        .filter((location) => location.countryId === country.id)
        .reduce((sum, location) => sum + location.population, 0);
      expect(totals.get(country.id) ?? 0).toBe(expected);
    }
  });

  it("paginates sqlite list queries with limit and offset", async () => {
    const {
      countryRepository,
      locationRepository,
    } = createSqliteRepositories();
    const countries = COUNTRY_SEED_DATA.filter((country) =>
      ["United States", "Canada", "United Kingdom", "Mexico", "France"].includes(
        country.name,
      ),
    );
    const countryNames = new Set(countries.map((country) => country.name));
    const locations = LOCATION_SEED_DATA.filter((entry) =>
      countryNames.has(entry.countryName),
    ).slice(0, 15);

    await mergeCountrySeed(countryRepository, countries);
    await mergeLocationSeed(locationRepository, countryRepository, locations);

    const page = await locationRepository.list({ limit: 5, offset: 2 });
    const total = await locationRepository.count();

    expect(page).toHaveLength(5);
    expect(total).toBe(locations.length);
    expect(total).toBeGreaterThanOrEqual(12);
  });

  it("seeds and reads the NFL hierarchy through sqlite joins", async () => {
    const repositories = createSqliteRepositories();
    process.env.NFL_SEED_ON_STARTUP = "true";

    await mergeCountrySeed(repositories.countryRepository);
    await mergeLocationSeed(
      repositories.locationRepository,
      repositories.countryRepository,
      LOCATION_SEED_DATA,
    );
    await mergeLocationSeed(
      repositories.locationRepository,
      repositories.countryRepository,
      NFL_LOCATION_SEED_DATA,
    );

    const first = await mergeNflSeed(repositories);
    const second = await mergeNflSeed(repositories);

    expect(first.teamsAdded).toBe(32);
    expect(second.teamsAdded).toBe(0);
    expect(await repositories.teamRepository.count()).toBe(32);

    const chiefs = await repositories.teamRepository.getByAbbreviation(
      (await repositories.leagueRepository.getByAbbreviation("NFL"))!.id,
      "KC",
    );

    expect(chiefs).toMatchObject({
      abbreviation: "KC",
      leagueName: "National Football League",
      conferenceAbbreviation: "AFC",
      venueName: expect.any(String),
      locationName: expect.any(String),
    });

    const abbreviations =
      await repositories.teamRepository.listAbbreviationsByLeague(
        chiefs!.leagueId,
      );
    expect(abbreviations.has("KC")).toBe(true);
    expect(abbreviations.size).toBe(32);
  });

  it("serves team list and get paths through the module store on sqlite", async () => {
    const repositories = createSqliteRepositories();
    process.env.NFL_SEED_ON_STARTUP = "true";

    await mergeCountrySeed(repositories.countryRepository);
    await mergeLocationSeed(
      repositories.locationRepository,
      repositories.countryRepository,
      LOCATION_SEED_DATA,
    );
    await mergeLocationSeed(
      repositories.locationRepository,
      repositories.countryRepository,
      NFL_LOCATION_SEED_DATA,
    );
    await mergeNflSeed(repositories);

    const teamStore = new TeamStore(repositories.teamRepository);
    const teams = await teamStore.list({ limit: 10, offset: 0 });
    const total = await teamStore.count();

    expect(teams).toHaveLength(10);
    expect(total).toBe(32);
    expect(teams[0].divisionName).toBeTruthy();
    expect(teams[0].conferenceName).toBeTruthy();
  });

  it("keeps sqlite team list queries within a regression budget", async () => {
    const repositories = createSqliteRepositories();
    process.env.NFL_SEED_ON_STARTUP = "true";

    await mergeCountrySeed(repositories.countryRepository);
    await mergeLocationSeed(
      repositories.locationRepository,
      repositories.countryRepository,
      LOCATION_SEED_DATA,
    );
    await mergeLocationSeed(
      repositories.locationRepository,
      repositories.countryRepository,
      NFL_LOCATION_SEED_DATA,
    );
    await mergeNflSeed(repositories);

    const started = performance.now();
    await repositories.teamRepository.list();
    const elapsedMs = performance.now() - started;

    expect(elapsedMs).toBeLessThan(250);
  });
});
