import type { College } from "@/modules/colleges/types";
import type { Conference } from "@/modules/conferences/types";
import type { Division } from "@/modules/divisions/types";
import type { League } from "@/modules/leagues/types";
import type { Location } from "@/modules/locations/types";
import type { Team } from "@/modules/teams/types";
import type { Venue } from "@/modules/venues/types";

export interface CountryRecord {
  id: string;
  name: string;
  isoCode: string | null;
  flag: string;
  languages: string[];
}

export interface CountryRepository {
  list(): Promise<CountryRecord[]>;
  get(id: string): Promise<CountryRecord | null>;
  getByName(name: string): Promise<CountryRecord | null>;
  create(country: CountryRecord): Promise<CountryRecord>;
  updateFlag(id: string, flag: string): Promise<void>;
  delete(id: string): Promise<boolean>;
  clear(): Promise<void>;
}

export interface LocationRepository {
  list(): Promise<Location[]>;
  get(id: string): Promise<Location | null>;
  create(location: Location): Promise<Location>;
  delete(id: string): Promise<boolean>;
  countByCountry(countryId: string): Promise<number>;
  sumPopulationByCountry(countryId: string): Promise<number>;
  clear(): Promise<void>;
}

export interface VenueRepository {
  list(): Promise<Venue[]>;
  listByLocation(locationId: string): Promise<Venue[]>;
  countByLocation(locationId: string): Promise<number>;
  get(id: string): Promise<Venue | null>;
  create(venue: Venue): Promise<Venue>;
  delete(id: string): Promise<boolean>;
  clear(): Promise<void>;
}

export interface CollegeRepository {
  list(): Promise<College[]>;
  listByLocation(locationId: string): Promise<College[]>;
  countByLocation(locationId: string): Promise<number>;
  get(id: string): Promise<College | null>;
  create(college: College): Promise<College>;
  delete(id: string): Promise<boolean>;
  clear(): Promise<void>;
}

export interface LeagueRepository {
  list(): Promise<League[]>;
  get(id: string): Promise<League | null>;
  getByName(name: string): Promise<League | null>;
  getByAbbreviation(abbreviation: string): Promise<League | null>;
  create(league: League): Promise<League>;
  updateLogo(id: string, logo: string): Promise<void>;
  delete(id: string): Promise<boolean>;
  clear(): Promise<void>;
}

export interface ConferenceRepository {
  list(): Promise<Conference[]>;
  listByLeague(leagueId: string): Promise<Conference[]>;
  countByLeague(leagueId: string): Promise<number>;
  get(id: string): Promise<Conference | null>;
  getByAbbreviation(
    leagueId: string,
    abbreviation: string,
  ): Promise<Conference | null>;
  create(conference: Conference): Promise<Conference>;
  delete(id: string): Promise<boolean>;
  clear(): Promise<void>;
}

export interface DivisionRepository {
  list(): Promise<Division[]>;
  listByLeague(leagueId: string): Promise<Division[]>;
  listByConference(conferenceId: string): Promise<Division[]>;
  countByConference(conferenceId: string): Promise<number>;
  get(id: string): Promise<Division | null>;
  getByAbbreviation(
    conferenceId: string,
    abbreviation: string,
  ): Promise<Division | null>;
  create(division: Division): Promise<Division>;
  delete(id: string): Promise<boolean>;
  clear(): Promise<void>;
}

export interface TeamRepository {
  list(): Promise<Team[]>;
  listByDivision(divisionId: string): Promise<Team[]>;
  listByLeague(leagueId: string): Promise<Team[]>;
  countByDivision(divisionId: string): Promise<number>;
  countByVenue(venueId: string): Promise<number>;
  get(id: string): Promise<Team | null>;
  getByAbbreviation(leagueId: string, abbreviation: string): Promise<Team | null>;
  create(team: Team): Promise<Team>;
  updateLogo(id: string, logo: string): Promise<void>;
  delete(id: string): Promise<boolean>;
  clear(): Promise<void>;
}
