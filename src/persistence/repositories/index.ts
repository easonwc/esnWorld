import { getDb } from "../db";
import { MemoryCollegeRepository } from "./memory/college.memory";
import { MemoryConferenceRepository } from "./memory/conference.memory";
import { MemoryCountryRepository } from "./memory/country.memory";
import { MemoryDivisionRepository } from "./memory/division.memory";
import { MemoryLeagueRepository } from "./memory/league.memory";
import { MemoryLocationRepository } from "./memory/location.memory";
import { MemoryTeamRepository } from "./memory/team.memory";
import { MemoryVenueRepository } from "./memory/venue.memory";
import { SqliteCollegeRepository } from "./sqlite/college.sqlite";
import { SqliteConferenceRepository } from "./sqlite/conference.sqlite";
import { SqliteCountryRepository } from "./sqlite/country.sqlite";
import { SqliteDivisionRepository } from "./sqlite/division.sqlite";
import { SqliteLeagueRepository } from "./sqlite/league.sqlite";
import { SqliteLocationRepository } from "./sqlite/location.sqlite";
import { SqliteTeamRepository } from "./sqlite/team.sqlite";
import { SqliteVenueRepository } from "./sqlite/venue.sqlite";
import type {
  CollegeRepository,
  ConferenceRepository,
  CountryRepository,
  DivisionRepository,
  LeagueRepository,
  LocationRepository,
  TeamRepository,
  VenueRepository,
} from "./types";

function useMemoryRepositories(): boolean {
  return process.env.VITEST === "true";
}

function createTeamRepository(): TeamRepository {
  if (useMemoryRepositories()) {
    return new MemoryTeamRepository();
  }
  return new SqliteTeamRepository(getDb());
}

function createDivisionRepository(): DivisionRepository {
  if (useMemoryRepositories()) {
    return new MemoryDivisionRepository();
  }
  return new SqliteDivisionRepository(getDb());
}

function createConferenceRepository(): ConferenceRepository {
  if (useMemoryRepositories()) {
    return new MemoryConferenceRepository();
  }
  return new SqliteConferenceRepository(getDb());
}

function createLeagueRepository(): LeagueRepository {
  if (useMemoryRepositories()) {
    return new MemoryLeagueRepository();
  }
  return new SqliteLeagueRepository(getDb());
}

function createCollegeRepository(): CollegeRepository {
  if (useMemoryRepositories()) {
    return new MemoryCollegeRepository();
  }
  return new SqliteCollegeRepository(getDb());
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

export function getDefaultTeamRepository(): TeamRepository {
  return createTeamRepository();
}

export function getDefaultDivisionRepository(): DivisionRepository {
  return createDivisionRepository();
}

export function getDefaultConferenceRepository(): ConferenceRepository {
  return createConferenceRepository();
}

export function getDefaultLeagueRepository(): LeagueRepository {
  return createLeagueRepository();
}

export function getDefaultCollegeRepository(): CollegeRepository {
  return createCollegeRepository();
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

export { MemoryCollegeRepository } from "./memory/college.memory";
export { MemoryConferenceRepository } from "./memory/conference.memory";
export { MemoryCountryRepository } from "./memory/country.memory";
export { MemoryDivisionRepository } from "./memory/division.memory";
export { MemoryLeagueRepository } from "./memory/league.memory";
export { MemoryLocationRepository } from "./memory/location.memory";
export { MemoryTeamRepository } from "./memory/team.memory";
export { MemoryVenueRepository } from "./memory/venue.memory";
export type {
  CollegeRepository,
  ConferenceRepository,
  CountryRecord,
  CountryRepository,
  DivisionRepository,
  LeagueRepository,
  LocationRepository,
  TeamRepository,
  VenueRepository,
} from "./types";
