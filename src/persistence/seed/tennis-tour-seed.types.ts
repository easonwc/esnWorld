import type {
  TennisEntryCriteria,
  TennisTournamentScheduleReference,
  TennisVenueMode,
} from "@/modules/tennis/types";

export interface TennisTournamentVenueRef {
  locationName: string;
  locationCountry: string;
  locationRegion?: string | null;
  venueName: string;
  rotationOrder?: number;
  isDefault?: boolean;
}

export interface TennisTournamentSeedEntry {
  slug: string;
  name: string;
  isMajor: boolean;
  prizeMoneyUsd: number;
  entryCriteria: TennisEntryCriteria;
  venueMode: TennisVenueMode;
  seasonStartMonth: number;
  seasonStartDay: number;
  rotationEpochYear?: number;
  sortOrder: number;
  typicalDurationDays?: number;
  activeCourtCount?: number;
  drawSize?: number;
  /** When false, catalog-only (no season schedule row). */
  materializeOnSchedule?: boolean;
  /** Reuse another tour's materialized events for this tournament. */
  scheduleReference?: TennisTournamentScheduleReference;
}

export interface TennisTourSeedDefinition {
  name: string;
  abbreviation: string;
}

export interface TennisTourSeedResult {
  enabled: boolean;
  tourAdded: boolean;
  tournamentsAdded: number;
  tournamentsSkipped: number;
  venueLinksAdded: number;
  tournamentsMissingVenue: number;
}
