import type { GolfEntryCriteria, GolfVenueMode } from "@/modules/golf/types";

export interface GolfTournamentVenueRef {
  locationName: string;
  locationCountry: string;
  locationRegion?: string | null;
  venueName: string;
  rotationOrder?: number;
  isDefault?: boolean;
}

export interface GolfTournamentSeedEntry {
  slug: string;
  name: string;
  isMajor: boolean;
  purseUsd: number;
  entryCriteria: GolfEntryCriteria;
  venueMode: GolfVenueMode;
  seasonStartMonth: number;
  seasonStartDay: number;
  rotationEpochYear?: number;
  sortOrder: number;
  teeGroupCount?: number;
  fieldSize?: number;
}

export interface GolfTourSeedDefinition {
  name: string;
  abbreviation: string;
}

export interface GolfTourSeedResult {
  enabled: boolean;
  tourAdded: boolean;
  tournamentsAdded: number;
  tournamentsSkipped: number;
  venueLinksAdded: number;
  tournamentsMissingVenue: number;
}
