import type { GolfEntryCriteria, GolfVenueMode } from "@/modules/golf/types";
import { DEFAULT_GOLF_VENUE_TEE_GROUP_COUNT } from "./golf-venue-types";
import { PGA_TOUR_PHASE_B_SEED_DATA } from "./pga-tour-phase-b.data";

export interface PgaTournamentVenueRef {
  locationName: string;
  locationCountry: string;
  locationRegion?: string | null;
  venueName: string;
  rotationOrder?: number;
  isDefault?: boolean;
}

export interface PgaTournamentSeedEntry {
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
  /** Parallel tee-group slots per round; defaults to venue capacity. */
  teeGroupCount?: number;
  /** Golfer capacity; defaults to standard PGA full field (156). */
  fieldSize?: number;
  venues: readonly PgaTournamentVenueRef[];
}

/** Parallel tee groups materialized per round (scheduling slots). */
export const DEFAULT_PGA_TEE_GROUP_COUNT = DEFAULT_GOLF_VENUE_TEE_GROUP_COUNT;

/** Standard full PGA Tour field (golfer capacity). */
export const DEFAULT_PGA_FIELD_SIZE = 156;

export const PGA_TOUR_SEED = {
  name: "PGA Tour",
  abbreviation: "PGA",
} as const;

/** Phase A core catalog (merged with Phase B for the full 47-event season). */
const PGA_TOUR_CORE_SEED_DATA: readonly PgaTournamentSeedEntry[] = [
  {
    slug: "sentry-tournament-of-champions",
    name: "Sentry Tournament of Champions",
    isMajor: false,
    purseUsd: 20_000_000,
    entryCriteria: {
      kind: "exemptions",
      description: "Prior-year PGA Tour winners",
      exemptionCodes: ["prior_winner"],
    },
    venueMode: "fixed",
    seasonStartMonth: 1,
    seasonStartDay: 2,
    sortOrder: 1,
    venues: [
      {
        locationName: "Lahaina",
        locationCountry: "United States",
        locationRegion: "Hawaii",
        venueName: "Kapalua Plantation Course",
        isDefault: true,
      },
    ],
  },
  {
    slug: "the-american-express",
    name: "The American Express",
    isMajor: false,
    purseUsd: 8_400_000,
    entryCriteria: { kind: "ranked", minOfficialWorldGolfRank: 125 },
    venueMode: "fixed",
    seasonStartMonth: 1,
    seasonStartDay: 16,
    sortOrder: 3,
    venues: [
      {
        locationName: "La Quinta",
        locationCountry: "United States",
        locationRegion: "California",
        venueName: "PGA West Stadium Course",
        isDefault: true,
      },
    ],
  },
  {
    slug: "wm-phoenix-open",
    name: "WM Phoenix Open",
    isMajor: false,
    purseUsd: 9_200_000,
    entryCriteria: { kind: "open", description: "Standard PGA Tour field" },
    venueMode: "fixed",
    seasonStartMonth: 2,
    seasonStartDay: 6,
    sortOrder: 5,
    venues: [
      {
        locationName: "Scottsdale",
        locationCountry: "United States",
        locationRegion: "Arizona",
        venueName: "TPC Scottsdale Stadium Course",
        isDefault: true,
      },
    ],
  },
  {
    slug: "genesis-invitational",
    name: "Genesis Invitational",
    isMajor: false,
    purseUsd: 20_000_000,
    entryCriteria: {
      kind: "invitational",
      description: "Limited-field signature event",
    },
    venueMode: "fixed",
    seasonStartMonth: 2,
    seasonStartDay: 13,
    sortOrder: 6,
    venues: [
      {
        locationName: "Pacific Palisades",
        locationCountry: "United States",
        locationRegion: "California",
        venueName: "Riviera Country Club",
        isDefault: true,
      },
    ],
  },
  {
    slug: "att-pebble-beach-pro-am",
    name: "AT&T Pebble Beach Pro-Am",
    isMajor: false,
    purseUsd: 9_000_000,
    entryCriteria: { kind: "open", description: "Standard PGA Tour field" },
    venueMode: "fixed",
    seasonStartMonth: 2,
    seasonStartDay: 20,
    sortOrder: 7,
    venues: [
      {
        locationName: "Pebble Beach",
        locationCountry: "United States",
        locationRegion: "California",
        venueName: "Pebble Beach Golf Links",
        isDefault: true,
      },
    ],
  },
  {
    slug: "cognizant-classic",
    name: "Cognizant Classic in The Palm Beaches",
    isMajor: false,
    purseUsd: 9_200_000,
    entryCriteria: { kind: "open", description: "Standard PGA Tour field" },
    venueMode: "fixed",
    seasonStartMonth: 2,
    seasonStartDay: 27,
    sortOrder: 8,
    venues: [
      {
        locationName: "Palm Beach Gardens",
        locationCountry: "United States",
        locationRegion: "Florida",
        venueName: "PGA National Champion Course",
        isDefault: true,
      },
    ],
  },
  {
    slug: "players-championship",
    name: "The Players Championship",
    isMajor: false,
    purseUsd: 25_000_000,
    entryCriteria: { kind: "open", description: "Strongest field event" },
    venueMode: "fixed",
    seasonStartMonth: 3,
    seasonStartDay: 13,
    sortOrder: 11,
    venues: [
      {
        locationName: "Ponte Vedra Beach",
        locationCountry: "United States",
        locationRegion: "Florida",
        venueName: "TPC Sawgrass",
        isDefault: true,
      },
    ],
  },
  {
    slug: "valspar-championship",
    name: "Valspar Championship",
    isMajor: false,
    purseUsd: 8_400_000,
    entryCriteria: { kind: "open", description: "Standard PGA Tour field" },
    venueMode: "fixed",
    seasonStartMonth: 3,
    seasonStartDay: 20,
    sortOrder: 12,
    venues: [
      {
        locationName: "Palm Harbor",
        locationCountry: "United States",
        locationRegion: "Florida",
        venueName: "Innisbrook Resort Copperhead Course",
        isDefault: true,
      },
    ],
  },
  {
    slug: "arnold-palmer-invitational",
    name: "Arnold Palmer Invitational presented by Mastercard",
    isMajor: false,
    purseUsd: 20_000_000,
    entryCriteria: {
      kind: "invitational",
      description: "Limited-field signature event",
    },
    venueMode: "fixed",
    seasonStartMonth: 3,
    seasonStartDay: 27,
    sortOrder: 14,
    venues: [
      {
        locationName: "Orlando",
        locationCountry: "United States",
        locationRegion: "Florida",
        venueName: "Bay Hill Club & Lodge",
        isDefault: true,
      },
    ],
  },
  {
    slug: "texas-childrens-houston-open",
    name: "Texas Children's Houston Open",
    isMajor: false,
    purseUsd: 9_200_000,
    entryCriteria: { kind: "open", description: "Standard PGA Tour field" },
    venueMode: "fixed",
    seasonStartMonth: 4,
    seasonStartDay: 3,
    sortOrder: 15,
    venues: [
      {
        locationName: "Houston",
        locationCountry: "United States",
        locationRegion: "Texas",
        venueName: "Memorial Park Golf Course",
        isDefault: true,
      },
    ],
  },
  {
    slug: "valero-texas-open",
    name: "Valero Texas Open",
    isMajor: false,
    purseUsd: 9_200_000,
    entryCriteria: { kind: "open", description: "Standard PGA Tour field" },
    venueMode: "fixed",
    seasonStartMonth: 4,
    seasonStartDay: 3,
    sortOrder: 16,
    venues: [
      {
        locationName: "San Antonio",
        locationCountry: "United States",
        locationRegion: "Texas",
        venueName: "TPC San Antonio Oaks Course",
        isDefault: true,
      },
    ],
  },
  {
    slug: "masters",
    name: "The Masters",
    isMajor: true,
    purseUsd: 18_000_000,
    entryCriteria: {
      kind: "invitational",
      description: "Invitation only",
    },
    venueMode: "fixed",
    seasonStartMonth: 4,
    seasonStartDay: 10,
    sortOrder: 17,
    venues: [
      {
        locationName: "Augusta",
        locationCountry: "United States",
        locationRegion: "Georgia",
        venueName: "Augusta National Golf Club",
        isDefault: true,
      },
    ],
  },
  {
    slug: "rbc-heritage",
    name: "RBC Heritage",
    isMajor: false,
    purseUsd: 9_200_000,
    entryCriteria: { kind: "open", description: "Standard PGA Tour field" },
    venueMode: "fixed",
    seasonStartMonth: 4,
    seasonStartDay: 17,
    sortOrder: 18,
    venues: [
      {
        locationName: "Hilton Head Island",
        locationCountry: "United States",
        locationRegion: "South Carolina",
        venueName: "Harbour Town Golf Links",
        isDefault: true,
      },
    ],
  },
  {
    slug: "zurich-classic",
    name: "Zurich Classic of New Orleans",
    isMajor: false,
    purseUsd: 8_800_000,
    entryCriteria: { kind: "open", description: "Team-format PGA Tour event" },
    venueMode: "fixed",
    seasonStartMonth: 4,
    seasonStartDay: 24,
    sortOrder: 19,
    venues: [
      {
        locationName: "Avondale",
        locationCountry: "United States",
        locationRegion: "Louisiana",
        venueName: "TPC Louisiana",
        isDefault: true,
      },
    ],
  },
  {
    slug: "truist-championship",
    name: "Truist Championship",
    isMajor: false,
    purseUsd: 20_000_000,
    entryCriteria: {
      kind: "ranked",
      minOfficialWorldGolfRank: 50,
      description: "Designated signature event",
    },
    venueMode: "fixed",
    seasonStartMonth: 5,
    seasonStartDay: 8,
    sortOrder: 22,
    venues: [
      {
        locationName: "Charlotte",
        locationCountry: "United States",
        locationRegion: "North Carolina",
        venueName: "Quail Hollow Club",
        isDefault: true,
      },
    ],
  },
  {
    slug: "pga-championship",
    name: "PGA Championship",
    isMajor: true,
    purseUsd: 18_500_000,
    entryCriteria: { kind: "open", description: "PGA Championship qualifying field" },
    venueMode: "rotation",
    seasonStartMonth: 5,
    seasonStartDay: 15,
    rotationEpochYear: 2020,
    sortOrder: 24,
    venues: [
      {
        locationName: "Oakmont",
        locationCountry: "United States",
        locationRegion: "Pennsylvania",
        venueName: "Oakmont Country Club",
        rotationOrder: 0,
      },
      {
        locationName: "Kiawah Island",
        locationCountry: "United States",
        locationRegion: "South Carolina",
        venueName: "Kiawah Island Ocean Course",
        rotationOrder: 1,
      },
      {
        locationName: "Farmingdale",
        locationCountry: "United States",
        locationRegion: "New York",
        venueName: "Bethpage Black Course",
        rotationOrder: 2,
      },
      {
        locationName: "Rochester",
        locationCountry: "United States",
        locationRegion: "New York",
        venueName: "Oak Hill Country Club",
        rotationOrder: 3,
      },
    ],
  },
  {
    slug: "charles-schwab-challenge",
    name: "Charles Schwab Challenge",
    isMajor: false,
    purseUsd: 9_300_000,
    entryCriteria: { kind: "open", description: "Standard PGA Tour field" },
    venueMode: "fixed",
    seasonStartMonth: 5,
    seasonStartDay: 22,
    sortOrder: 25,
    venues: [
      {
        locationName: "Fort Worth",
        locationCountry: "United States",
        locationRegion: "Texas",
        venueName: "Colonial Country Club",
        isDefault: true,
      },
    ],
  },
  {
    slug: "the-memorial-tournament",
    name: "the Memorial Tournament presented by Workday",
    isMajor: false,
    purseUsd: 20_000_000,
    entryCriteria: {
      kind: "invitational",
      description: "Limited-field signature event",
    },
    venueMode: "fixed",
    seasonStartMonth: 6,
    seasonStartDay: 5,
    sortOrder: 26,
    venues: [
      {
        locationName: "Dublin",
        locationCountry: "United States",
        locationRegion: "Ohio",
        venueName: "Muirfield Village Golf Club",
        isDefault: true,
      },
    ],
  },
  {
    slug: "rbc-canadian-open",
    name: "RBC Canadian Open",
    isMajor: false,
    purseUsd: 9_200_000,
    entryCriteria: { kind: "open", description: "National open championship" },
    venueMode: "fixed",
    seasonStartMonth: 6,
    seasonStartDay: 12,
    sortOrder: 27,
    venues: [
      {
        locationName: "Toronto",
        locationCountry: "Canada",
        venueName: "St George's Golf and Country Club",
        isDefault: true,
      },
    ],
  },
  {
    slug: "us-open",
    name: "U.S. Open",
    isMajor: true,
    purseUsd: 21_500_000,
    entryCriteria: { kind: "open", description: "U.S. Open qualifying pathways" },
    venueMode: "rotation",
    seasonStartMonth: 6,
    seasonStartDay: 19,
    rotationEpochYear: 2020,
    sortOrder: 28,
    venues: [
      {
        locationName: "Brookline",
        locationCountry: "United States",
        locationRegion: "Massachusetts",
        venueName: "The Country Club",
        rotationOrder: 0,
      },
      {
        locationName: "Southampton",
        locationCountry: "United States",
        locationRegion: "New York",
        venueName: "Shinnecock Hills Golf Club",
        rotationOrder: 1,
      },
      {
        locationName: "Pinehurst",
        locationCountry: "United States",
        locationRegion: "North Carolina",
        venueName: "Pinehurst No. 2",
        rotationOrder: 2,
      },
      {
        locationName: "Farmingdale",
        locationCountry: "United States",
        locationRegion: "New York",
        venueName: "Bethpage Black Course",
        rotationOrder: 3,
      },
      {
        locationName: "Oakmont",
        locationCountry: "United States",
        locationRegion: "Pennsylvania",
        venueName: "Oakmont Country Club",
        rotationOrder: 4,
      },
    ],
  },
  {
    slug: "travelers-championship",
    name: "Travelers Championship",
    isMajor: false,
    purseUsd: 20_000_000,
    entryCriteria: {
      kind: "ranked",
      minOfficialWorldGolfRank: 70,
      description: "Designated signature event",
    },
    venueMode: "fixed",
    seasonStartMonth: 6,
    seasonStartDay: 26,
    sortOrder: 29,
    venues: [
      {
        locationName: "Cromwell",
        locationCountry: "United States",
        locationRegion: "Connecticut",
        venueName: "TPC River Highlands",
        isDefault: true,
      },
    ],
  },
  {
    slug: "john-deere-classic",
    name: "John Deere Classic",
    isMajor: false,
    purseUsd: 8_400_000,
    entryCriteria: { kind: "open", description: "Standard PGA Tour field" },
    venueMode: "fixed",
    seasonStartMonth: 7,
    seasonStartDay: 3,
    sortOrder: 30,
    venues: [
      {
        locationName: "Silvis",
        locationCountry: "United States",
        locationRegion: "Illinois",
        venueName: "TPC Deere Run",
        isDefault: true,
      },
    ],
  },
  {
    slug: "scottish-open",
    name: "Genesis Scottish Open",
    isMajor: false,
    purseUsd: 9_000_000,
    entryCriteria: { kind: "open", description: "Open qualifying field" },
    venueMode: "fixed",
    seasonStartMonth: 7,
    seasonStartDay: 10,
    sortOrder: 31,
    venues: [
      {
        locationName: "North Berwick",
        locationCountry: "United Kingdom",
        locationRegion: "Scotland",
        venueName: "The Renaissance Club",
        isDefault: true,
      },
    ],
  },
  {
    slug: "the-open-championship",
    name: "The Open Championship",
    isMajor: true,
    purseUsd: 16_500_000,
    entryCriteria: { kind: "open", description: "Open qualifying and exemptions" },
    venueMode: "rotation",
    seasonStartMonth: 7,
    seasonStartDay: 17,
    rotationEpochYear: 2020,
    sortOrder: 32,
    venues: [
      {
        locationName: "St Andrews",
        locationCountry: "United Kingdom",
        locationRegion: "Scotland",
        venueName: "St Andrews Old Course",
        rotationOrder: 0,
      },
      {
        locationName: "Troon",
        locationCountry: "United Kingdom",
        locationRegion: "Scotland",
        venueName: "Royal Troon Golf Club",
        rotationOrder: 1,
      },
      {
        locationName: "Hoylake",
        locationCountry: "United Kingdom",
        locationRegion: "England",
        venueName: "Royal Liverpool Golf Club",
        rotationOrder: 2,
      },
      {
        locationName: "Southport",
        locationCountry: "United Kingdom",
        locationRegion: "England",
        venueName: "Royal Birkdale Golf Club",
        rotationOrder: 3,
      },
      {
        locationName: "Portrush",
        locationCountry: "United Kingdom",
        locationRegion: "Northern Ireland",
        venueName: "Royal Portrush Dunluce Links",
        rotationOrder: 4,
      },
      {
        locationName: "Sandwich",
        locationCountry: "United Kingdom",
        locationRegion: "England",
        venueName: "Royal St George's Golf Club",
        rotationOrder: 5,
      },
    ],
  },
  {
    slug: "3m-open",
    name: "3M Open",
    isMajor: false,
    purseUsd: 8_400_000,
    entryCriteria: { kind: "open", description: "Standard PGA Tour field" },
    venueMode: "fixed",
    seasonStartMonth: 7,
    seasonStartDay: 24,
    sortOrder: 34,
    venues: [
      {
        locationName: "Rochester",
        locationCountry: "United States",
        locationRegion: "New York",
        venueName: "Oak Hill Country Club",
        isDefault: true,
      },
    ],
  },
  {
    slug: "rocket-mortgage-classic",
    name: "Rocket Mortgage Classic",
    isMajor: false,
    purseUsd: 9_200_000,
    entryCriteria: { kind: "open", description: "Standard PGA Tour field" },
    venueMode: "fixed",
    seasonStartMonth: 7,
    seasonStartDay: 31,
    sortOrder: 35,
    venues: [
      {
        locationName: "Detroit",
        locationCountry: "United States",
        locationRegion: "Michigan",
        venueName: "Detroit Golf Club",
        isDefault: true,
      },
    ],
  },
  {
    slug: "wyndham-championship",
    name: "Wyndham Championship",
    isMajor: false,
    purseUsd: 8_400_000,
    entryCriteria: { kind: "open", description: "Standard PGA Tour field" },
    venueMode: "fixed",
    seasonStartMonth: 8,
    seasonStartDay: 7,
    sortOrder: 36,
    venues: [
      {
        locationName: "Greensboro",
        locationCountry: "United States",
        locationRegion: "North Carolina",
        venueName: "Sedgefield Country Club",
        isDefault: true,
      },
    ],
  },
  {
    slug: "fedex-st-jude-championship",
    name: "FedEx St. Jude Championship",
    isMajor: false,
    purseUsd: 20_000_000,
    entryCriteria: {
      kind: "ranked",
      minOfficialWorldGolfRank: 70,
      description: "FedEx Cup playoffs field",
    },
    venueMode: "fixed",
    seasonStartMonth: 8,
    seasonStartDay: 14,
    sortOrder: 37,
    venues: [
      {
        locationName: "Sheboygan",
        locationCountry: "United States",
        locationRegion: "Wisconsin",
        venueName: "Whistling Straits",
        isDefault: true,
      },
    ],
  },
  {
    slug: "bmw-championship",
    name: "BMW Championship",
    isMajor: false,
    purseUsd: 20_000_000,
    entryCriteria: {
      kind: "ranked",
      minOfficialWorldGolfRank: 50,
      description: "FedEx Cup playoffs field",
    },
    venueMode: "fixed",
    seasonStartMonth: 8,
    seasonStartDay: 21,
    sortOrder: 38,
    venues: [
      {
        locationName: "Ponte Vedra Beach",
        locationCountry: "United States",
        locationRegion: "Florida",
        venueName: "TPC Sawgrass",
        isDefault: true,
      },
    ],
  },
  {
    slug: "tour-championship",
    name: "Tour Championship",
    isMajor: false,
    purseUsd: 75_000_000,
    entryCriteria: {
      kind: "ranked",
      minOfficialWorldGolfRank: 30,
      description: "Top 30 FedEx Cup standings",
    },
    venueMode: "fixed",
    seasonStartMonth: 8,
    seasonStartDay: 28,
    sortOrder: 39,
    venues: [
      {
        locationName: "Pebble Beach",
        locationCountry: "United States",
        locationRegion: "California",
        venueName: "Pebble Beach Golf Links",
        isDefault: true,
      },
    ],
  },
] as const;

export const PGA_TOURNAMENT_SEED_DATA: readonly PgaTournamentSeedEntry[] = [
  ...PGA_TOUR_CORE_SEED_DATA,
  ...PGA_TOUR_PHASE_B_SEED_DATA,
].sort((left, right) => left.sortOrder - right.sortOrder);
