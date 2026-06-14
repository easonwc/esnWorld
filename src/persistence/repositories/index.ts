import { getDb } from "../db";
import { runCountryLocationMigration } from "../migrations/migrate-002";
import { MemoryCountryRepository } from "./memory/country.memory";
import { MemoryLocationRepository } from "./memory/location.memory";
import { MemoryVenueRepository } from "./memory/venue.memory";
import { SqliteCountryRepository } from "./sqlite/country.sqlite";
import { SqliteLocationRepository } from "./sqlite/location.sqlite";
import { SqliteVenueRepository } from "./sqlite/venue.sqlite";
import type {
  CountryRepository,
  LocationRepository,
  VenueRepository,
} from "./types";

function useMemoryRepositories(): boolean {
  return process.env.VITEST === "true";
}

function createLocationRepository(): LocationRepository {
  if (useMemoryRepositories()) {
    return new MemoryLocationRepository();
  }
  return new SqliteLocationRepository(getDb());
}

function createVenueRepository(): VenueRepository {
  if (useMemoryRepositories()) {
    return new MemoryVenueRepository();
  }
  return new SqliteVenueRepository(getDb());
}

function createCountryRepository(): CountryRepository {
  if (useMemoryRepositories()) {
    return new MemoryCountryRepository();
  }
  return new SqliteCountryRepository(getDb());
}

export function getDefaultLocationRepository(): LocationRepository {
  return createLocationRepository();
}

export function getDefaultVenueRepository(): VenueRepository {
  return createVenueRepository();
}

export function getDefaultCountryRepository(): CountryRepository {
  return createCountryRepository();
}

export { MemoryCountryRepository } from "./memory/country.memory";
export { MemoryLocationRepository } from "./memory/location.memory";
export { MemoryVenueRepository } from "./memory/venue.memory";
export type {
  CountryRecord,
  CountryRepository,
  LocationRepository,
  VenueRepository,
} from "./types";
