export type GolfVenueMode = "fixed" | "rotation";

export type GolfEntryCriteria =
  | { kind: "open"; description: string }
  | { kind: "ranked"; minOfficialWorldGolfRank: number; description?: string }
  | { kind: "exemptions"; description: string; exemptionCodes: string[] }
  | { kind: "invitational"; description: string };

export interface GolfTour {
  id: string;
  name: string;
  abbreviation: string;
  logo: string;
}

export interface GolfTournament {
  id: string;
  tourId: string;
  slug: string;
  name: string;
  isMajor: boolean;
  purseUsd: number;
  entryCriteria: GolfEntryCriteria;
  venueMode: GolfVenueMode;
  typicalDurationDays: number;
  fieldSize: number;
  seasonStartMonth: number;
  seasonStartDay: number;
  rotationEpochYear: number | null;
  sortOrder: number;
}

export interface GolfTournamentVenue {
  id: string;
  tournamentId: string;
  venueId: string;
  rotationOrder: number;
  isDefault: boolean;
}

export interface GolfSeasonSchedule {
  id: string;
  tourId: string;
  tournamentId: string;
  seasonYear: number;
  venueId: string;
  rootEventId: string;
  scheduledAtIsoUtc: string;
}

export interface GolfTourSchedulerState {
  tourAbbreviation: string;
  lastProcessedIsoUtc: string;
  lastScheduledSeasonYear: number | null;
}

export type GolfTourAction = "list" | "get" | "listTournaments" | "listSeasonSchedules";

export interface GolfTourListInput {
  action: "list";
}

export interface GolfTourGetInput {
  action: "get";
  id?: string;
  abbreviation?: string;
}

export interface GolfTourListTournamentsInput {
  action: "listTournaments";
  tourId?: string;
  abbreviation?: string;
}

export interface GolfTourListSeasonSchedulesInput {
  action: "listSeasonSchedules";
  tourId?: string;
  abbreviation?: string;
  seasonYear?: number;
}

export type GolfTourInput =
  | GolfTourListInput
  | GolfTourGetInput
  | GolfTourListTournamentsInput
  | GolfTourListSeasonSchedulesInput;

export type GolfTournamentAction = "get" | "listByTour" | "listVenues";

export interface GolfTournamentGetInput {
  action: "get";
  id?: string;
  slug?: string;
  tourAbbreviation?: string;
}

export interface GolfTournamentListByTourInput {
  action: "listByTour";
  tourId?: string;
  abbreviation?: string;
}

export interface GolfTournamentListVenuesInput {
  action: "listVenues";
  tournamentId: string;
}

export type GolfTournamentInput =
  | GolfTournamentGetInput
  | GolfTournamentListByTourInput
  | GolfTournamentListVenuesInput;

export type GolfSchedulingAction = "processNow";

export interface GolfSchedulingProcessNowInput {
  action: "processNow";
  isoUtc?: string;
}

export type GolfSchedulingInput = GolfSchedulingProcessNowInput;

export interface GolfTourOutput extends GolfTour {
  tournamentCount?: number;
}

export type GolfToursOutput =
  | GolfTourOutput
  | GolfTourOutput[]
  | GolfTournament
  | GolfTournament[]
  | GolfTournamentVenue[]
  | GolfSeasonSchedule[]
  | { processed: true; results: GolfSchedulingProcessResult[] };

export interface GolfSchedulingProcessResult {
  tourAbbreviation: string;
  scheduled: boolean;
  seasonYear?: number;
  error?: string;
  cause?: string;
}
