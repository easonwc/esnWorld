import { getDb } from "../db";
import { MemoryCollegeRepository } from "./memory/college.memory";
import { MemoryConferenceRepository } from "./memory/conference.memory";
import { MemoryCountryRepository } from "./memory/country.memory";
import { MemoryDivisionRepository } from "./memory/division.memory";
import { MemoryEventRepository } from "./memory/event.memory";
import { MemoryLeagueRepository } from "./memory/league.memory";
import { MemoryLocationRepository } from "./memory/location.memory";
import { MemoryTeamRepository } from "./memory/team.memory";
import { MemoryVenueRepository } from "./memory/venue.memory";
import { MemoryVenueResourceRepository } from "./memory/venue-resource.memory";
import {
  MemoryGolfSeasonScheduleRepository,
  MemoryGolfTourRepository,
  MemoryGolfTourSchedulerStateRepository,
  MemoryGolfTournamentRepository,
  MemoryGolfTournamentVenueRepository,
} from "./memory/golf.memory";
import {
  MemoryTennisSeasonScheduleRepository,
  MemoryTennisTourRepository,
  MemoryTennisTourSchedulerStateRepository,
  MemoryTennisTournamentRepository,
  MemoryTennisTournamentVenueRepository,
} from "./memory/tennis.memory";
import { SqliteCollegeRepository } from "./sqlite/college.sqlite";
import { SqliteConferenceRepository } from "./sqlite/conference.sqlite";
import { SqliteCountryRepository } from "./sqlite/country.sqlite";
import { SqliteDivisionRepository } from "./sqlite/division.sqlite";
import { SqliteEventRepository } from "./sqlite/event.sqlite";
import { SqliteLeagueRepository } from "./sqlite/league.sqlite";
import { SqliteLocationRepository } from "./sqlite/location.sqlite";
import { SqliteTeamRepository } from "./sqlite/team.sqlite";
import { SqliteVenueRepository } from "./sqlite/venue.sqlite";
import { SqliteVenueResourceRepository } from "./sqlite/venue-resource.sqlite";
import {
  SqliteGolfSeasonScheduleRepository,
  SqliteGolfTourRepository,
  SqliteGolfTourSchedulerStateRepository,
  SqliteGolfTournamentRepository,
  SqliteGolfTournamentVenueRepository,
} from "./sqlite/golf.sqlite";
import {
  SqliteTennisSeasonScheduleRepository,
  SqliteTennisTourRepository,
  SqliteTennisTourSchedulerStateRepository,
  SqliteTennisTournamentRepository,
  SqliteTennisTournamentVenueRepository,
} from "./sqlite/tennis.sqlite";
import type {
  CollegeRepository,
  ConferenceRepository,
  CountryRepository,
  DivisionRepository,
  EventRepository,
  GolfSeasonScheduleRepository,
  GolfTourRepository,
  GolfTourSchedulerStateRepository,
  GolfTournamentRepository,
  GolfTournamentVenueRepository,
  LeagueRepository,
  LocationRepository,
  TeamRepository,
  TennisSeasonScheduleRepository,
  TennisTourRepository,
  TennisTourSchedulerStateRepository,
  TennisTournamentRepository,
  TennisTournamentVenueRepository,
  VenueRepository,
  VenueResourceRepository,
} from "./types";

function useMemoryRepositories(): boolean {
  return process.env.VITEST === "true";
}

function createEventRepository(): EventRepository {
  if (useMemoryRepositories()) {
    return new MemoryEventRepository();
  }
  return new SqliteEventRepository(getDb());
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

function createVenueResourceRepository(): VenueResourceRepository {
  if (useMemoryRepositories()) {
    return new MemoryVenueResourceRepository();
  }
  return new SqliteVenueResourceRepository(getDb());
}

function createCountryRepository(): CountryRepository {
  if (useMemoryRepositories()) {
    return new MemoryCountryRepository();
  }
  return new SqliteCountryRepository(getDb());
}

function createGolfTourRepository(): GolfTourRepository {
  if (useMemoryRepositories()) {
    return new MemoryGolfTourRepository();
  }
  return new SqliteGolfTourRepository(getDb());
}

function createGolfTournamentRepository(): GolfTournamentRepository {
  if (useMemoryRepositories()) {
    return new MemoryGolfTournamentRepository();
  }
  return new SqliteGolfTournamentRepository(getDb());
}

function createGolfTournamentVenueRepository(): GolfTournamentVenueRepository {
  if (useMemoryRepositories()) {
    return new MemoryGolfTournamentVenueRepository();
  }
  return new SqliteGolfTournamentVenueRepository(getDb());
}

function createGolfSeasonScheduleRepository(): GolfSeasonScheduleRepository {
  if (useMemoryRepositories()) {
    return new MemoryGolfSeasonScheduleRepository();
  }
  return new SqliteGolfSeasonScheduleRepository(getDb());
}

function createGolfTourSchedulerStateRepository(): GolfTourSchedulerStateRepository {
  if (useMemoryRepositories()) {
    return new MemoryGolfTourSchedulerStateRepository();
  }
  return new SqliteGolfTourSchedulerStateRepository(getDb());
}

function createTennisTourRepository(): TennisTourRepository {
  if (useMemoryRepositories()) {
    return new MemoryTennisTourRepository();
  }
  return new SqliteTennisTourRepository(getDb());
}

function createTennisTournamentRepository(): TennisTournamentRepository {
  if (useMemoryRepositories()) {
    return new MemoryTennisTournamentRepository();
  }
  return new SqliteTennisTournamentRepository(getDb());
}

function createTennisTournamentVenueRepository(): TennisTournamentVenueRepository {
  if (useMemoryRepositories()) {
    return new MemoryTennisTournamentVenueRepository();
  }
  return new SqliteTennisTournamentVenueRepository(getDb());
}

function createTennisSeasonScheduleRepository(): TennisSeasonScheduleRepository {
  if (useMemoryRepositories()) {
    return new MemoryTennisSeasonScheduleRepository();
  }
  return new SqliteTennisSeasonScheduleRepository(getDb());
}

function createTennisTourSchedulerStateRepository(): TennisTourSchedulerStateRepository {
  if (useMemoryRepositories()) {
    return new MemoryTennisTourSchedulerStateRepository();
  }
  return new SqliteTennisTourSchedulerStateRepository(getDb());
}

export function getDefaultEventRepository(): EventRepository {
  return createEventRepository();
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

export function getDefaultVenueResourceRepository(): VenueResourceRepository {
  return createVenueResourceRepository();
}

export function getDefaultCountryRepository(): CountryRepository {
  return createCountryRepository();
}

export function getDefaultGolfTourRepository(): GolfTourRepository {
  return createGolfTourRepository();
}

export function getDefaultGolfTournamentRepository(): GolfTournamentRepository {
  return createGolfTournamentRepository();
}

export function getDefaultGolfTournamentVenueRepository(): GolfTournamentVenueRepository {
  return createGolfTournamentVenueRepository();
}

export function getDefaultGolfSeasonScheduleRepository(): GolfSeasonScheduleRepository {
  return createGolfSeasonScheduleRepository();
}

export function getDefaultGolfTourSchedulerStateRepository(): GolfTourSchedulerStateRepository {
  return createGolfTourSchedulerStateRepository();
}

export function getDefaultTennisTourRepository(): TennisTourRepository {
  return createTennisTourRepository();
}

export function getDefaultTennisTournamentRepository(): TennisTournamentRepository {
  return createTennisTournamentRepository();
}

export function getDefaultTennisTournamentVenueRepository(): TennisTournamentVenueRepository {
  return createTennisTournamentVenueRepository();
}

export function getDefaultTennisSeasonScheduleRepository(): TennisSeasonScheduleRepository {
  return createTennisSeasonScheduleRepository();
}

export function getDefaultTennisTourSchedulerStateRepository(): TennisTourSchedulerStateRepository {
  return createTennisTourSchedulerStateRepository();
}

export { MemoryCollegeRepository } from "./memory/college.memory";
export { MemoryConferenceRepository } from "./memory/conference.memory";
export { MemoryCountryRepository } from "./memory/country.memory";
export { MemoryDivisionRepository } from "./memory/division.memory";
export { MemoryEventRepository } from "./memory/event.memory";
export { MemoryLeagueRepository } from "./memory/league.memory";
export { MemoryLocationRepository } from "./memory/location.memory";
export { MemoryTeamRepository } from "./memory/team.memory";
export { MemoryVenueRepository } from "./memory/venue.memory";
export { MemoryVenueResourceRepository } from "./memory/venue-resource.memory";
export {
  MemoryGolfSeasonScheduleRepository,
  MemoryGolfTourRepository,
  MemoryGolfTourSchedulerStateRepository,
  MemoryGolfTournamentRepository,
  MemoryGolfTournamentVenueRepository,
} from "./memory/golf.memory";
export {
  MemoryTennisSeasonScheduleRepository,
  MemoryTennisTourRepository,
  MemoryTennisTourSchedulerStateRepository,
  MemoryTennisTournamentRepository,
  MemoryTennisTournamentVenueRepository,
} from "./memory/tennis.memory";
export type {
  CollegeRepository,
  ConferenceRepository,
  CountryRecord,
  CountryRepository,
  DivisionRepository,
  EventRepository,
  GolfSeasonScheduleRepository,
  GolfTourRepository,
  GolfTourSchedulerStateRepository,
  GolfTournamentRepository,
  GolfTournamentVenueRepository,
  LeagueRepository,
  LocationRepository,
  TeamRepository,
  TennisSeasonScheduleRepository,
  TennisTourRepository,
  TennisTourSchedulerStateRepository,
  TennisTournamentRepository,
  TennisTournamentVenueRepository,
  VenueRepository,
  VenueResourceRepository,
} from "./types";
