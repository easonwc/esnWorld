import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { EventStore, resetEventStore } from "@/modules/events";
import { resetLocationStore } from "@/modules/locations";
import { resetVenueStore } from "@/modules/venues";
import { createTickerState } from "@/modules/world-clock/tick";
import { saveWorldClockTickerState, loadWorldClockTickerState } from "@/persistence/world-clock-state";
import {
  closeDb,
  getDb,
  resetDatabaseStartupStateForTests,
} from "@/persistence/db";
import { mergeCountrySeed } from "@/persistence/seed/countries";
import { COUNTRY_SEED_DATA } from "@/persistence/seed/countries.data";
import { mergeLocationSeed } from "@/persistence/seed/locations";
import { LOCATION_SEED_DATA } from "@/persistence/seed/locations.data";
import { SqliteCountryRepository } from "./repositories/sqlite/country.sqlite";
import { SqliteEventRepository } from "./repositories/sqlite/event.sqlite";
import { SqliteLocationRepository } from "./repositories/sqlite/location.sqlite";
import { SqliteVenueRepository } from "./repositories/sqlite/venue.sqlite";

async function seedVenueFixture() {
  const db = getDb();
  const countryRepository = new SqliteCountryRepository(db);
  const locationRepository = new SqliteLocationRepository(db);
  const venueRepository = new SqliteVenueRepository(db);

  const countries = COUNTRY_SEED_DATA.filter(
    (country) => country.name === "United States",
  );
  await mergeCountrySeed(countryRepository, countries);
  await mergeLocationSeed(
    locationRepository,
    countryRepository,
    LOCATION_SEED_DATA.filter(
      (entry) =>
        entry.countryName === "United States" &&
        entry.name === "New York" &&
        entry.region === "New York",
    ),
  );

  const location = (await locationRepository.list()).find(
    (entry) => entry.name === "New York",
  )!;

  const venue = await venueRepository.create({
    id: crypto.randomUUID(),
    locationId: location.id,
    name: "Test Stadium",
    latitude: 40.75,
    longitude: -73.99,
    isIndoor: false,
  });

  return {
    venue,
    countryRepository,
    locationRepository,
    venueRepository,
  };
}

function wireSqliteWorldStores(
  locationRepository: SqliteLocationRepository,
  venueRepository: SqliteVenueRepository,
): void {
  resetLocationStore(locationRepository);
  resetVenueStore(venueRepository);
}

describe("persistence tiers integration", () => {
  const originalDatabasePath = process.env.DATABASE_PATH;
  const originalWorldReset = process.env.WORLD_DATABASE_RESET_ON_STARTUP;
  const originalSessionReset = process.env.SESSION_RESET_ON_STARTUP;
  const originalFullReset = process.env.FULL_DATABASE_RESET_ON_STARTUP;
  let tempDir = "";

  beforeEach(() => {
    tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "esnworld-tier-integration-"),
    );
    process.env.DATABASE_PATH = path.join(tempDir, "world.db");
    process.env.WORLD_DATABASE_RESET_ON_STARTUP = "false";
    process.env.SESSION_RESET_ON_STARTUP = "false";
    process.env.FULL_DATABASE_RESET_ON_STARTUP = "false";
    resetDatabaseStartupStateForTests();
    closeDb();
    getDb();
  });

  afterEach(() => {
    closeDb();
    resetDatabaseStartupStateForTests();
    if (tempDir) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      tempDir = "";
    }
    process.env.DATABASE_PATH = originalDatabasePath;
    process.env.WORLD_DATABASE_RESET_ON_STARTUP = originalWorldReset;
    process.env.SESSION_RESET_ON_STARTUP = originalSessionReset;
    process.env.FULL_DATABASE_RESET_ON_STARTUP = originalFullReset;
  });

  it("persists events across database reconnects", async () => {
    const { venue, locationRepository, venueRepository } =
      await seedVenueFixture();
    wireSqliteWorldStores(locationRepository, venueRepository);
    const eventRepository = new SqliteEventRepository(getDb());
    const store = resetEventStore(eventRepository);

    const created = await store.create({
      name: "US Open",
      venueId: venue.id,
      localStart: { year: 2020, month: 6, day: 10, hour: 7, minute: 0 },
      durationMinutes: 6 * 24 * 60,
    });

    closeDb();
    getDb();
    wireSqliteWorldStores(
      new SqliteLocationRepository(getDb()),
      new SqliteVenueRepository(getDb()),
    );

    const reloadedStore = new EventStore(new SqliteEventRepository(getDb()));
    const fetched = await reloadedStore.get(created.id);

    expect(fetched.name).toBe("US Open");
    expect(await reloadedStore.count()).toBe(1);
  });

  it("clears only session tier data when SESSION_RESET_ON_STARTUP=true", async () => {
    const { venue, countryRepository, locationRepository, venueRepository } =
      await seedVenueFixture();
    wireSqliteWorldStores(locationRepository, venueRepository);
    const eventRepository = new SqliteEventRepository(getDb());
    const store = resetEventStore(eventRepository);

    await store.create({
      name: "US Open",
      venueId: venue.id,
      localStart: { year: 2020, month: 6, day: 10, hour: 7, minute: 0 },
      durationMinutes: 24 * 60,
    });

    saveWorldClockTickerState(
      getDb(),
      createTickerState(Date.parse("2020-06-15T12:00:00.000Z"), 60),
    );

    expect(await countryRepository.count()).toBe(1);
    expect(await eventRepository.count()).toBe(1);
    expect(loadWorldClockTickerState(getDb())).not.toBeNull();

    closeDb();
    resetDatabaseStartupStateForTests();
    process.env.SESSION_RESET_ON_STARTUP = "true";
    getDb();
    wireSqliteWorldStores(
      new SqliteLocationRepository(getDb()),
      new SqliteVenueRepository(getDb()),
    );

    const db = getDb();
    expect(await new SqliteCountryRepository(db).count()).toBe(1);
    expect(await new SqliteEventRepository(db).count()).toBe(0);
    expect(loadWorldClockTickerState(db)).toBeNull();
  });

  it("clears world and session tiers when WORLD_DATABASE_RESET_ON_STARTUP=true", async () => {
    const { venue, countryRepository, locationRepository, venueRepository } =
      await seedVenueFixture();
    wireSqliteWorldStores(locationRepository, venueRepository);
    const eventRepository = new SqliteEventRepository(getDb());

    await resetEventStore(eventRepository).create({
      name: "US Open",
      venueId: venue.id,
      localStart: { year: 2020, month: 6, day: 10, hour: 7, minute: 0 },
      durationMinutes: 24 * 60,
    });

    expect(await countryRepository.count()).toBe(1);
    expect(await eventRepository.count()).toBe(1);

    closeDb();
    resetDatabaseStartupStateForTests();
    process.env.WORLD_DATABASE_RESET_ON_STARTUP = "true";
    getDb();

    const db = getDb();
    expect(await new SqliteCountryRepository(db).count()).toBe(0);
    expect(await new SqliteEventRepository(db).count()).toBe(0);
  });
});
