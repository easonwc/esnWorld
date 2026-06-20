import type {
  TennisTournamentSeedEntry,
  TennisTournamentVenueRef,
} from "./tennis-tour-seed.types";
import { WTA_TOUR_CATALOG_SEED_DATA } from "./wta-tour-catalog.data";
import {
  GRAND_SLAM_ACTIVE_COURT_COUNT,
  GRAND_SLAM_DRAW_SIZE,
} from "./atp-tour.data";

export type WtaTournamentVenueRef = TennisTournamentVenueRef;

export type WtaTournamentSeedEntry = TennisTournamentSeedEntry & {
  venues: readonly WtaTournamentVenueRef[];
};

export const DEFAULT_WTA_ACTIVE_COURT_COUNT = 12;
export const DEFAULT_WTA_DRAW_SIZE = 32;

export const WTA_TOUR_SEED = {
  name: "WTA Tour",
  abbreviation: "WTA",
} as const;

/** Joint events reuse ATP materialized venue-week trees. */
const atpScheduleReference = (tournamentSlug: string) => ({
  scheduleReference: {
    tourAbbreviation: "ATP",
    tournamentSlug,
  },
});

function slamVenue(
  locationName: string,
  locationCountry: string,
  venueName: string,
  locationRegion?: string | null,
): readonly WtaTournamentVenueRef[] {
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

/** Phase 1 — four grand slams referencing ATP shared trees. */
const WTA_TOUR_SLAM_SEED_DATA: readonly WtaTournamentSeedEntry[] = [
  {
    slug: "australian-open",
    name: "Australian Open",
    isMajor: true,
    prizeMoneyUsd: 86_500_000,
    entryCriteria: {
      kind: "ranked",
      minWtaRank: 104,
      description: "Direct acceptance plus qualifying",
    },
    venueMode: "fixed",
    seasonStartMonth: 1,
    seasonStartDay: 12,
    sortOrder: 1,
    typicalDurationDays: 14,
    activeCourtCount: GRAND_SLAM_ACTIVE_COURT_COUNT,
    drawSize: GRAND_SLAM_DRAW_SIZE,
    ...atpScheduleReference("australian-open"),
    venues: slamVenue("Melbourne", "Australia", "Melbourne Park"),
  },
  {
    slug: "roland-garros",
    name: "Roland Garros",
    isMajor: true,
    prizeMoneyUsd: 53_500_000,
    entryCriteria: {
      kind: "ranked",
      minWtaRank: 104,
      description: "Direct acceptance plus qualifying",
    },
    venueMode: "fixed",
    seasonStartMonth: 5,
    seasonStartDay: 25,
    sortOrder: 2,
    typicalDurationDays: 14,
    activeCourtCount: GRAND_SLAM_ACTIVE_COURT_COUNT,
    drawSize: GRAND_SLAM_DRAW_SIZE,
    ...atpScheduleReference("roland-garros"),
    venues: slamVenue("Paris", "France", "Stade Roland Garros"),
  },
  {
    slug: "wimbledon",
    name: "Wimbledon",
    isMajor: true,
    prizeMoneyUsd: 50_000_000,
    entryCriteria: {
      kind: "ranked",
      minWtaRank: 104,
      description: "Direct acceptance plus qualifying",
    },
    venueMode: "fixed",
    seasonStartMonth: 6,
    seasonStartDay: 30,
    sortOrder: 3,
    typicalDurationDays: 14,
    activeCourtCount: GRAND_SLAM_ACTIVE_COURT_COUNT,
    drawSize: GRAND_SLAM_DRAW_SIZE,
    ...atpScheduleReference("wimbledon"),
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
      minWtaRank: 104,
      description: "Direct acceptance plus qualifying",
    },
    venueMode: "fixed",
    seasonStartMonth: 8,
    seasonStartDay: 24,
    sortOrder: 4,
    typicalDurationDays: 14,
    activeCourtCount: GRAND_SLAM_ACTIVE_COURT_COUNT,
    drawSize: GRAND_SLAM_DRAW_SIZE,
    ...atpScheduleReference("us-open"),
    venues: slamVenue(
      "New York",
      "United States",
      "USTA Billie Jean King National Tennis Center",
      "New York",
    ),
  },
] as const;

export const WTA_TOURNAMENT_SEED_DATA: readonly WtaTournamentSeedEntry[] = [
  ...WTA_TOUR_SLAM_SEED_DATA,
  ...WTA_TOUR_CATALOG_SEED_DATA,
];

/** Slugs that share ATP materialized venue-week trees. */
export const WTA_JOINT_ATP_TOURNAMENT_SLUGS = WTA_TOURNAMENT_SEED_DATA.filter(
  (entry) => entry.scheduleReference?.tourAbbreviation === "ATP",
).map((entry) => entry.slug);
