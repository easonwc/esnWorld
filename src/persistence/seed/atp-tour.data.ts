import type {
  TennisTournamentSeedEntry,
  TennisTournamentVenueRef,
} from "./tennis-tour-seed.types";

import { ATP_TOUR_CATALOG_SEED_DATA } from "./atp-tour-catalog.data";

export type AtpTournamentVenueRef = TennisTournamentVenueRef;

export type AtpTournamentSeedEntry = TennisTournamentSeedEntry & {
  venues: readonly AtpTournamentVenueRef[];
};

/** Show courts used concurrently during a typical tour week. */
export const DEFAULT_ATP_ACTIVE_COURT_COUNT = 12;

/** Standard ATP main-draw size for 250/500 events. */
export const DEFAULT_ATP_DRAW_SIZE = 32;

/** Grand slam main draw. */
export const GRAND_SLAM_DRAW_SIZE = 128;

/** Grand slam active show courts. */
export const GRAND_SLAM_ACTIVE_COURT_COUNT = 16;

export const ATP_TOUR_SEED = {
  name: "ATP Tour",
  abbreviation: "ATP",
} as const;

function slamVenue(
  locationName: string,
  locationCountry: string,
  venueName: string,
  locationRegion?: string | null,
): readonly AtpTournamentVenueRef[] {
  return [
    {
      locationName,
      locationCountry,
      locationRegion,
      venueName,
      isDefault: true,
    },
  ];
}

/** Phase 1 — four grand slams (venue-backed, materialized by ATP). */
const ATP_TOUR_SLAM_SEED_DATA: readonly AtpTournamentSeedEntry[] = [
  {
    slug: "australian-open",
    name: "Australian Open",
    isMajor: true,
    prizeMoneyUsd: 86_500_000,
    entryCriteria: {
      kind: "ranked",
      minAtpRank: 104,
      description: "Direct acceptance plus qualifying",
    },
    venueMode: "fixed",
    seasonStartMonth: 1,
    seasonStartDay: 12,
    sortOrder: 1,
    typicalDurationDays: 14,
    activeCourtCount: GRAND_SLAM_ACTIVE_COURT_COUNT,
    drawSize: GRAND_SLAM_DRAW_SIZE,
    venues: slamVenue("Melbourne", "Australia", "Melbourne Park"),
  },
  {
    slug: "roland-garros",
    name: "Roland Garros",
    isMajor: true,
    prizeMoneyUsd: 53_500_000,
    entryCriteria: {
      kind: "ranked",
      minAtpRank: 104,
      description: "Direct acceptance plus qualifying",
    },
    venueMode: "fixed",
    seasonStartMonth: 5,
    seasonStartDay: 25,
    sortOrder: 2,
    typicalDurationDays: 14,
    activeCourtCount: GRAND_SLAM_ACTIVE_COURT_COUNT,
    drawSize: GRAND_SLAM_DRAW_SIZE,
    venues: slamVenue("Paris", "France", "Stade Roland Garros"),
  },
  {
    slug: "wimbledon",
    name: "Wimbledon",
    isMajor: true,
    prizeMoneyUsd: 50_000_000,
    entryCriteria: {
      kind: "ranked",
      minAtpRank: 104,
      description: "Direct acceptance plus qualifying",
    },
    venueMode: "fixed",
    seasonStartMonth: 6,
    seasonStartDay: 30,
    sortOrder: 3,
    typicalDurationDays: 14,
    activeCourtCount: GRAND_SLAM_ACTIVE_COURT_COUNT,
    drawSize: GRAND_SLAM_DRAW_SIZE,
    venues: slamVenue(
      "London",
      "United Kingdom",
      "All England Lawn Tennis and Croquet Club",
    ),
  },
  {
    slug: "us-open",
    name: "US Open",
    isMajor: true,
    prizeMoneyUsd: 75_000_000,
    entryCriteria: {
      kind: "ranked",
      minAtpRank: 104,
      description: "Direct acceptance plus qualifying",
    },
    venueMode: "fixed",
    seasonStartMonth: 8,
    seasonStartDay: 24,
    sortOrder: 4,
    typicalDurationDays: 14,
    activeCourtCount: GRAND_SLAM_ACTIVE_COURT_COUNT,
    drawSize: GRAND_SLAM_DRAW_SIZE,
    venues: slamVenue(
      "New York",
      "United States",
      "USTA Billie Jean King National Tennis Center",
      "New York",
    ),
  },
] as const;

/** Phase 4 — venue-backed ATP calendar (Masters, 500s, 250s). Slams above. */
export const ATP_TOURNAMENT_SEED_DATA: readonly AtpTournamentSeedEntry[] = [
  ...ATP_TOUR_SLAM_SEED_DATA,
  ...ATP_TOUR_CATALOG_SEED_DATA,
];
