import type { College } from "@/modules/colleges/types";
import type { Conference } from "@/modules/conferences/types";
import type { Division } from "@/modules/divisions/types";
import type { EventRecord } from "@/modules/events/types";
import type { League } from "@/modules/leagues/types";
import type { Location } from "@/modules/locations/types";
import type { Team } from "@/modules/teams/types";
import type { Venue, VenueResource, VenueResourceType } from "@/modules/venues/types";
import type { ListOptions } from "@/lib/pagination";

export interface CountryRecord {
  id: string;
  name: string;
  isoCode: string | null;
  flag: string;
  languages: string[];
}

export interface CountryRepository {
  list(options?: ListOptions): Promise<CountryRecord[]>;
  count(): Promise<number>;
  get(id: string): Promise<CountryRecord | null>;
  getByName(name: string): Promise<CountryRecord | null>;
  create(country: CountryRecord): Promise<CountryRecord>;
  updateFlag(id: string, flag: string): Promise<void>;
  delete(id: string): Promise<boolean>;
  clear(): Promise<void>;
}

export interface LocationRepository {
  list(options?: ListOptions): Promise<Location[]>;
  count(): Promise<number>;
  get(id: string): Promise<Location | null>;
  create(location: Location): Promise<Location>;
  delete(id: string): Promise<boolean>;
  countByCountry(countryId: string): Promise<number>;
  sumPopulationByCountry(countryId: string): Promise<number>;
  populationTotalsByCountry(): Promise<ReadonlyMap<string, number>>;
  clear(): Promise<void>;
}

export interface VenueRepository {
  list(options?: ListOptions): Promise<Venue[]>;
  count(): Promise<number>;
  listByLocation(locationId: string): Promise<Venue[]>;
  countByLocation(locationId: string): Promise<number>;
  get(id: string): Promise<Venue | null>;
  create(venue: Venue): Promise<Venue>;
  delete(id: string): Promise<boolean>;
  clear(): Promise<void>;
}

export interface VenueResourceRepository {
  listByVenue(venueId: string): Promise<VenueResource[]>;
  get(id: string): Promise<VenueResource | null>;
  create(resource: VenueResource): Promise<VenueResource>;
  delete(id: string): Promise<boolean>;
  clear(): Promise<void>;
}

export interface CollegeRepository {
  list(options?: ListOptions): Promise<College[]>;
  count(): Promise<number>;
  listByLocation(locationId: string): Promise<College[]>;
  countByLocation(locationId: string): Promise<number>;
  get(id: string): Promise<College | null>;
  create(college: College): Promise<College>;
  updateLogo(id: string, logo: string): Promise<void>;
  delete(id: string): Promise<boolean>;
  clear(): Promise<void>;
}

export interface LeagueRepository {
  list(options?: ListOptions): Promise<League[]>;
  count(): Promise<number>;
  get(id: string): Promise<League | null>;
  getByName(name: string): Promise<League | null>;
  getByAbbreviation(abbreviation: string): Promise<League | null>;
  create(league: League): Promise<League>;
  updateLogo(id: string, logo: string): Promise<void>;
  delete(id: string): Promise<boolean>;
  clear(): Promise<void>;
}

export interface ConferenceRepository {
  list(options?: ListOptions): Promise<Conference[]>;
  count(): Promise<number>;
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
  list(options?: ListOptions): Promise<Division[]>;
  count(): Promise<number>;
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
  list(options?: ListOptions): Promise<Team[]>;
  count(): Promise<number>;
  listByDivision(divisionId: string): Promise<Team[]>;
  listByLeague(leagueId: string): Promise<Team[]>;
  listAbbreviationsByLeague(leagueId: string): Promise<ReadonlySet<string>>;
  countByDivision(divisionId: string): Promise<number>;
  countByVenue(venueId: string): Promise<number>;
  get(id: string): Promise<Team | null>;
  getByAbbreviation(leagueId: string, abbreviation: string): Promise<Team | null>;
  create(team: Team): Promise<Team>;
  updateLogo(id: string, logo: string): Promise<void>;
  delete(id: string): Promise<boolean>;
  clear(): Promise<void>;
}

export interface EventRepository {
  list(options?: ListOptions): Promise<EventRecord[]>;
  count(): Promise<number>;
  listByVenue(venueId: string): Promise<EventRecord[]>;
  listDirectChildren(parentId: string): Promise<EventRecord[]>;
  listActiveAt(isoUtc: string): Promise<EventRecord[]>;
  get(id: string): Promise<EventRecord | null>;
  create(event: EventRecord): Promise<EventRecord>;
  update(event: EventRecord): Promise<EventRecord>;
  delete(id: string): Promise<boolean>;
  clear(): Promise<void>;
}
