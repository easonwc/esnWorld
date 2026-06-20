import type { College } from "@/modules/colleges/types";
import type { Golfer } from "@/modules/golfers/types";
import type { GolfTourWin } from "@/modules/golf-tour-wins/types";
import type { GolfWorldRanking } from "@/modules/golf-world-rankings/types";
import type { GolfTourMembership } from "@/modules/golf-tour-memberships/types";
import type { Human } from "@/modules/humans/types";
import type { Conference } from "@/modules/conferences/types";
import type { Division } from "@/modules/divisions/types";
import type { EventRecord } from "@/modules/events/types";
import type { League } from "@/modules/leagues/types";
import type { Location } from "@/modules/locations/types";
import type { Team } from "@/modules/teams/types";
import type { TennisPlayer } from "@/modules/tennis-players/types";
import type { Venue, VenueResource } from "@/modules/venues/types";
import type {
  GolfSeasonSchedule,
  GolfTour,
  GolfTourSchedulerState,
  GolfTournament,
  GolfTournamentScheduleReference,
  GolfTournamentVenue,
} from "@/modules/golf/types";
import type {
  TennisSeasonSchedule,
  TennisTour,
  TennisTourSchedulerState,
  TennisTournament,
  TennisTournamentScheduleReference,
  TennisTournamentVenue,
} from "@/modules/tennis/types";
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

export interface HumanRepository {
  list(options?: ListOptions): Promise<Human[]>;
  count(): Promise<number>;
  get(id: string): Promise<Human | null>;
  create(human: Human): Promise<Human>;
  delete(id: string): Promise<boolean>;
  clear(): Promise<void>;
}

export interface GolferRepository {
  list(options?: ListOptions): Promise<Golfer[]>;
  count(): Promise<number>;
  get(id: string): Promise<Golfer | null>;
  getByHumanId(humanId: string): Promise<Golfer | null>;
  create(golfer: Golfer): Promise<Golfer>;
  delete(id: string): Promise<boolean>;
  clear(): Promise<void>;
}

export interface GolfTourMembershipRepository {
  listByTourSeason(
    tourId: string,
    seasonYear: number,
  ): Promise<GolfTourMembership[]>;
  countByTourSeason(tourId: string, seasonYear: number): Promise<number>;
  get(id: string): Promise<GolfTourMembership | null>;
  getByGolferTourSeason(
    golferId: string,
    tourId: string,
    seasonYear: number,
  ): Promise<GolfTourMembership | null>;
  create(membership: GolfTourMembership): Promise<GolfTourMembership>;
  delete(id: string): Promise<boolean>;
  clear(): Promise<void>;
}

export interface GolfTourWinRepository {
  listByTourSeason(tourId: string, seasonYear: number): Promise<GolfTourWin[]>;
  listDistinctGolfersByTourSeason(
    tourId: string,
    seasonYear: number,
  ): Promise<string[]>;
  countDistinctGolfersByTourSeason(
    tourId: string,
    seasonYear: number,
  ): Promise<number>;
  get(id: string): Promise<GolfTourWin | null>;
  create(win: GolfTourWin): Promise<GolfTourWin>;
  delete(id: string): Promise<boolean>;
  clear(): Promise<void>;
}

export interface GolfWorldRankingRepository {
  listBySystemDate(
    rankingSystem: GolfWorldRanking["rankingSystem"],
    asOfDate: string,
  ): Promise<GolfWorldRanking[]>;
  countBySystemDate(
    rankingSystem: GolfWorldRanking["rankingSystem"],
    asOfDate: string,
  ): Promise<number>;
  get(id: string): Promise<GolfWorldRanking | null>;
  getByGolferSystemDate(
    golferId: string,
    rankingSystem: GolfWorldRanking["rankingSystem"],
    asOfDate: string,
  ): Promise<GolfWorldRanking | null>;
  create(ranking: GolfWorldRanking): Promise<GolfWorldRanking>;
  update(ranking: GolfWorldRanking): Promise<GolfWorldRanking>;
  deleteBySystemDate(
    rankingSystem: GolfWorldRanking["rankingSystem"],
    asOfDate: string,
  ): Promise<void>;
  clear(): Promise<void>;
}

export interface TennisPlayerRepository {
  list(options?: ListOptions): Promise<TennisPlayer[]>;
  count(): Promise<number>;
  get(id: string): Promise<TennisPlayer | null>;
  getByHumanId(humanId: string): Promise<TennisPlayer | null>;
  create(player: TennisPlayer): Promise<TennisPlayer>;
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

export interface GolfTourRepository {
  list(): Promise<GolfTour[]>;
  get(id: string): Promise<GolfTour | null>;
  getByAbbreviation(abbreviation: string): Promise<GolfTour | null>;
  create(tour: GolfTour): Promise<GolfTour>;
  updateLogo(id: string, logo: string): Promise<void>;
  delete(id: string): Promise<boolean>;
  clear(): Promise<void>;
}

export interface GolfTournamentRepository {
  listByTour(tourId: string): Promise<GolfTournament[]>;
  get(id: string): Promise<GolfTournament | null>;
  getBySlug(tourId: string, slug: string): Promise<GolfTournament | null>;
  create(tournament: GolfTournament): Promise<GolfTournament>;
  updateMaterializeOnSchedule(
    id: string,
    materializeOnSchedule: boolean,
  ): Promise<void>;
  updateScheduleReference(
    id: string,
    scheduleReference: GolfTournamentScheduleReference | null,
  ): Promise<void>;
  delete(id: string): Promise<boolean>;
  clear(): Promise<void>;
}

export interface GolfTournamentVenueRepository {
  listByTournament(tournamentId: string): Promise<GolfTournamentVenue[]>;
  create(link: GolfTournamentVenue): Promise<GolfTournamentVenue>;
  deleteByTournament(tournamentId: string): Promise<void>;
  clear(): Promise<void>;
}

export interface GolfSeasonScheduleRepository {
  listByTour(tourId: string, seasonYear?: number): Promise<GolfSeasonSchedule[]>;
  getByTourTournamentSeason(
    tourId: string,
    tournamentId: string,
    seasonYear: number,
  ): Promise<GolfSeasonSchedule | null>;
  create(schedule: GolfSeasonSchedule): Promise<GolfSeasonSchedule>;
  deleteByTourSeason(tourId: string, seasonYear: number): Promise<void>;
  clear(): Promise<void>;
}

export interface GolfTourSchedulerStateRepository {
  get(tourAbbreviation: string): Promise<GolfTourSchedulerState | null>;
  upsert(state: GolfTourSchedulerState): Promise<GolfTourSchedulerState>;
  clear(): Promise<void>;
}

export interface TennisTourRepository {
  list(): Promise<TennisTour[]>;
  get(id: string): Promise<TennisTour | null>;
  getByAbbreviation(abbreviation: string): Promise<TennisTour | null>;
  create(tour: TennisTour): Promise<TennisTour>;
  updateLogo(id: string, logo: string): Promise<void>;
  delete(id: string): Promise<boolean>;
  clear(): Promise<void>;
}

export interface TennisTournamentRepository {
  listByTour(tourId: string): Promise<TennisTournament[]>;
  get(id: string): Promise<TennisTournament | null>;
  getBySlug(tourId: string, slug: string): Promise<TennisTournament | null>;
  create(tournament: TennisTournament): Promise<TennisTournament>;
  updateMaterializeOnSchedule(
    id: string,
    materializeOnSchedule: boolean,
  ): Promise<void>;
  updateScheduleReference(
    id: string,
    scheduleReference: TennisTournamentScheduleReference | null,
  ): Promise<void>;
  delete(id: string): Promise<boolean>;
  clear(): Promise<void>;
}

export interface TennisTournamentVenueRepository {
  listByTournament(tournamentId: string): Promise<TennisTournamentVenue[]>;
  create(link: TennisTournamentVenue): Promise<TennisTournamentVenue>;
  deleteByTournament(tournamentId: string): Promise<void>;
  clear(): Promise<void>;
}

export interface TennisSeasonScheduleRepository {
  listByTour(tourId: string, seasonYear?: number): Promise<TennisSeasonSchedule[]>;
  getByTourTournamentSeason(
    tourId: string,
    tournamentId: string,
    seasonYear: number,
  ): Promise<TennisSeasonSchedule | null>;
  create(schedule: TennisSeasonSchedule): Promise<TennisSeasonSchedule>;
  deleteByTourSeason(tourId: string, seasonYear: number): Promise<void>;
  clear(): Promise<void>;
}

export interface TennisTourSchedulerStateRepository {
  get(tourAbbreviation: string): Promise<TennisTourSchedulerState | null>;
  upsert(state: TennisTourSchedulerState): Promise<TennisTourSchedulerState>;
  clear(): Promise<void>;
}
