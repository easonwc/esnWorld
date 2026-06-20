export type TennisVenueMode = "fixed" | "rotation";

export type TennisEntryCriteria =
  | { kind: "open"; description: string }
  | { kind: "ranked"; minAtpRank?: number; minWtaRank?: number; description?: string }
  | { kind: "qualifying"; description: string }
  | { kind: "wildcards"; description: string; wildcardCount?: number };

export interface TennisTour {
  id: string;
  name: string;
  abbreviation: string;
  logo: string;
}

export interface TennisTournamentScheduleReference {
  tourAbbreviation: string;
  tournamentSlug: string;
}

export interface TennisTournament {
  id: string;
  tourId: string;
  slug: string;
  name: string;
  isMajor: boolean;
  prizeMoneyUsd: number;
  entryCriteria: TennisEntryCriteria;
  venueMode: TennisVenueMode;
  typicalDurationDays: number;
  /** Show courts scheduled in parallel during the event week. */
  activeCourtCount: number;
  /** Main-draw player capacity. */
  drawSize: number;
  seasonStartMonth: number;
  seasonStartDay: number;
  rotationEpochYear: number | null;
  sortOrder: number;
  /** When false, tournament stays in the catalog but is skipped by season schedulers. */
  materializeOnSchedule: boolean;
  /** When set, season scheduling reuses another tour's materialized venue-week tree. */
  scheduleReference: TennisTournamentScheduleReference | null;
}

export interface TennisTournamentVenue {
  id: string;
  tournamentId: string;
  venueId: string;
  rotationOrder: number;
  isDefault: boolean;
}

export interface TennisSeasonSchedule {
  id: string;
  tourId: string;
  tournamentId: string;
  seasonYear: number;
  venueId: string;
  rootEventId: string;
  scheduledAtIsoUtc: string;
}

export interface TennisTourSchedulerState {
  tourAbbreviation: string;
  lastProcessedIsoUtc: string;
  lastScheduledSeasonYear: number | null;
}

export type TennisTourAction = "list" | "get" | "listTournaments" | "listSeasonSchedules";

export interface TennisTourListInput {
  action: "list";
}

export interface TennisTourGetInput {
  action: "get";
  id?: string;
  abbreviation?: string;
}

export interface TennisTourListTournamentsInput {
  action: "listTournaments";
  tourId?: string;
  abbreviation?: string;
}

export interface TennisTourListSeasonSchedulesInput {
  action: "listSeasonSchedules";
  tourId?: string;
  abbreviation?: string;
  seasonYear?: number;
}

export type TennisTourInput =
  | TennisTourListInput
  | TennisTourGetInput
  | TennisTourListTournamentsInput
  | TennisTourListSeasonSchedulesInput;

export type TennisTournamentAction = "get" | "listByTour" | "listVenues";

export interface TennisTournamentGetInput {
  action: "get";
  id?: string;
  slug?: string;
  tourAbbreviation?: string;
}

export interface TennisTournamentListByTourInput {
  action: "listByTour";
  tourId?: string;
  abbreviation?: string;
}

export interface TennisTournamentListVenuesInput {
  action: "listVenues";
  tournamentId: string;
}

export type TennisTournamentInput =
  | TennisTournamentGetInput
  | TennisTournamentListByTourInput
  | TennisTournamentListVenuesInput;

export interface TennisTourOutput extends TennisTour {
  tournamentCount?: number;
}

export type TennisToursOutput =
  | TennisTourOutput
  | TennisTourOutput[]
  | TennisTournament
  | TennisTournament[]
  | TennisTournamentVenue[]
  | TennisSeasonSchedule[]
  | { processed: true; results: TennisSchedulingProcessResult[] };

export type TennisSchedulingAction = "processNow";

export interface TennisSchedulingProcessNowInput {
  action: "processNow";
  isoUtc?: string;
}

export type TennisSchedulingInput = TennisSchedulingProcessNowInput;

export interface TennisSchedulingProcessResult {
  tourAbbreviation: string;
  scheduled: boolean;
  seasonYear?: number;
  error?: string;
  cause?: string;
}
