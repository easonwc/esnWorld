import type { GolfEntryCriteria, GolfVenueMode } from "@/modules/golf/types";

export interface PgaPhaseBTournamentVenueRef {
  locationName: string;
  locationCountry: string;
  locationRegion?: string | null;
  venueName: string;
  rotationOrder?: number;
  isDefault?: boolean;
}

export interface PgaPhaseBTournamentSeedEntry {
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
  venues: readonly PgaPhaseBTournamentVenueRef[];
}

/** Phase B: weekly PGA Tour 500/250 and fall swing stops (17 tournaments). */
export const PGA_TOUR_PHASE_B_SEED_DATA: readonly PgaPhaseBTournamentSeedEntry[] = [
  {
    slug: "sony-open-in-hawaii",
    name: "Sony Open in Hawaii",
    isMajor: false,
    purseUsd: 8_300_000,
    entryCriteria: { kind: "open", description: "Standard PGA Tour field" },
    venueMode: "fixed",
    seasonStartMonth: 1,
    seasonStartDay: 9,
    sortOrder: 2,
    venues: [
      {
        locationName: "Honolulu",
        locationCountry: "United States",
        locationRegion: "Hawaii",
        venueName: "Waialae Country Club",
        isDefault: true,
      },
    ],
  },
  {
    slug: "farmers-insurance-open",
    name: "Farmers Insurance Open",
    isMajor: false,
    purseUsd: 9_000_000,
    entryCriteria: { kind: "open", description: "Standard PGA Tour field" },
    venueMode: "fixed",
    seasonStartMonth: 1,
    seasonStartDay: 23,
    sortOrder: 4,
    venues: [
      {
        locationName: "San Diego",
        locationCountry: "United States",
        locationRegion: "California",
        venueName: "Torrey Pines Golf Course",
        isDefault: true,
      },
    ],
  },
  {
    slug: "mexico-open-at-vidanta",
    name: "Mexico Open at Vidanta",
    isMajor: false,
    purseUsd: 8_000_000,
    entryCriteria: { kind: "open", description: "Standard PGA Tour field" },
    venueMode: "fixed",
    seasonStartMonth: 3,
    seasonStartDay: 6,
    sortOrder: 9,
    venues: [
      {
        locationName: "Nuevo Vallarta",
        locationCountry: "Mexico",
        venueName: "Vidanta Vallarta",
        isDefault: true,
      },
    ],
  },
  {
    slug: "puerto-rico-open",
    name: "Puerto Rico Open",
    isMajor: false,
    purseUsd: 4_000_000,
    entryCriteria: { kind: "open", description: "Standard PGA Tour field" },
    venueMode: "fixed",
    seasonStartMonth: 3,
    seasonStartDay: 13,
    sortOrder: 10,
    venues: [
      {
        locationName: "Rio Grande",
        locationCountry: "United States",
        locationRegion: "Puerto Rico",
        venueName: "Grand Reserve Golf Club",
        isDefault: true,
      },
    ],
  },
  {
    slug: "corales-puntacana-championship",
    name: "Corales Puntacana Championship",
    isMajor: false,
    purseUsd: 4_000_000,
    entryCriteria: { kind: "open", description: "Alternate PGA Tour event" },
    venueMode: "fixed",
    seasonStartMonth: 3,
    seasonStartDay: 27,
    sortOrder: 13,
    venues: [
      {
        locationName: "Punta Cana",
        locationCountry: "Dominican Republic",
        venueName: "Corales Golf Course",
        isDefault: true,
      },
    ],
  },
  {
    slug: "myrtle-beach-classic",
    name: "Myrtle Beach Classic",
    isMajor: false,
    purseUsd: 4_000_000,
    entryCriteria: { kind: "open", description: "Standard PGA Tour field" },
    venueMode: "fixed",
    seasonStartMonth: 5,
    seasonStartDay: 8,
    sortOrder: 20,
    venues: [
      {
        locationName: "Myrtle Beach",
        locationCountry: "United States",
        locationRegion: "South Carolina",
        venueName: "Dunes Golf and Beach Club",
        isDefault: true,
      },
    ],
  },
  {
    slug: "isco-championship",
    name: "ISCO Championship",
    isMajor: false,
    purseUsd: 8_000_000,
    entryCriteria: { kind: "open", description: "Standard PGA Tour field" },
    venueMode: "fixed",
    seasonStartMonth: 5,
    seasonStartDay: 15,
    sortOrder: 21,
    venues: [
      {
        locationName: "Louisville",
        locationCountry: "United States",
        locationRegion: "Kentucky",
        venueName: "Hurstbourne Country Club",
        isDefault: true,
      },
    ],
  },
  {
    slug: "the-cj-cup-byron-nelson",
    name: "THE CJ CUP Byron Nelson",
    isMajor: false,
    purseUsd: 9_500_000,
    entryCriteria: { kind: "open", description: "Standard PGA Tour field" },
    venueMode: "fixed",
    seasonStartMonth: 5,
    seasonStartDay: 22,
    sortOrder: 23,
    venues: [
      {
        locationName: "McKinney",
        locationCountry: "United States",
        locationRegion: "Texas",
        venueName: "TPC Craig Ranch",
        isDefault: true,
      },
    ],
  },
  {
    slug: "barracuda-championship",
    name: "Barracuda Championship",
    isMajor: false,
    purseUsd: 4_000_000,
    entryCriteria: { kind: "open", description: "Modified Stableford format" },
    venueMode: "fixed",
    seasonStartMonth: 7,
    seasonStartDay: 17,
    sortOrder: 33,
    venues: [
      {
        locationName: "Incline Village",
        locationCountry: "United States",
        locationRegion: "Nevada",
        venueName: "Edgewood Tahoe Golf Course",
        isDefault: true,
      },
    ],
  },
  {
    slug: "fortinet-championship",
    name: "Fortinet Championship",
    isMajor: false,
    purseUsd: 8_000_000,
    entryCriteria: { kind: "open", description: "FedEx Cup fall event" },
    venueMode: "fixed",
    seasonStartMonth: 9,
    seasonStartDay: 12,
    sortOrder: 40,
    venues: [
      {
        locationName: "Napa",
        locationCountry: "United States",
        locationRegion: "California",
        venueName: "Silverado Resort North Course",
        isDefault: true,
      },
    ],
  },
  {
    slug: "sanderson-farms-championship",
    name: "Sanderson Farms Championship",
    isMajor: false,
    purseUsd: 7_500_000,
    entryCriteria: { kind: "open", description: "FedEx Cup fall event" },
    venueMode: "fixed",
    seasonStartMonth: 9,
    seasonStartDay: 26,
    sortOrder: 41,
    venues: [
      {
        locationName: "Jackson",
        locationCountry: "United States",
        locationRegion: "Mississippi",
        venueName: "Country Club of Jackson",
        isDefault: true,
      },
    ],
  },
  {
    slug: "shriners-childrens-open",
    name: "Shriners Children's Open",
    isMajor: false,
    purseUsd: 8_000_000,
    entryCriteria: { kind: "open", description: "FedEx Cup fall event" },
    venueMode: "fixed",
    seasonStartMonth: 10,
    seasonStartDay: 10,
    sortOrder: 42,
    venues: [
      {
        locationName: "Las Vegas",
        locationCountry: "United States",
        locationRegion: "Nevada",
        venueName: "TPC Summerlin",
        isDefault: true,
      },
    ],
  },
  {
    slug: "zozo-championship",
    name: "ZOZO Championship",
    isMajor: false,
    purseUsd: 11_000_000,
    entryCriteria: { kind: "open", description: "Official PGA Tour event in Japan" },
    venueMode: "fixed",
    seasonStartMonth: 10,
    seasonStartDay: 24,
    sortOrder: 43,
    venues: [
      {
        locationName: "Chiba",
        locationCountry: "Japan",
        venueName: "Accordia Golf Narashino Country Club",
        isDefault: true,
      },
    ],
  },
  {
    slug: "butterfield-bermuda-championship",
    name: "Butterfield Bermuda Championship",
    isMajor: false,
    purseUsd: 6_500_000,
    entryCriteria: { kind: "open", description: "FedEx Cup fall event" },
    venueMode: "fixed",
    seasonStartMonth: 11,
    seasonStartDay: 7,
    sortOrder: 44,
    venues: [
      {
        locationName: "Hamilton",
        locationCountry: "United Kingdom",
        locationRegion: "Bermuda",
        venueName: "Port Royal Golf Course",
        isDefault: true,
      },
    ],
  },
  {
    slug: "black-desert-championship",
    name: "Black Desert Championship",
    isMajor: false,
    purseUsd: 7_500_000,
    entryCriteria: { kind: "open", description: "FedEx Cup fall event" },
    venueMode: "fixed",
    seasonStartMonth: 11,
    seasonStartDay: 14,
    sortOrder: 45,
    venues: [
      {
        locationName: "Ivins",
        locationCountry: "United States",
        locationRegion: "Utah",
        venueName: "Black Desert Resort",
        isDefault: true,
      },
    ],
  },
  {
    slug: "world-wide-technology-championship",
    name: "World Wide Technology Championship",
    isMajor: false,
    purseUsd: 8_000_000,
    entryCriteria: { kind: "open", description: "FedEx Cup fall event" },
    venueMode: "fixed",
    seasonStartMonth: 11,
    seasonStartDay: 21,
    sortOrder: 46,
    venues: [
      {
        locationName: "Los Cabos",
        locationCountry: "Mexico",
        venueName: "El Cardonal at Diamante",
        isDefault: true,
      },
    ],
  },
  {
    slug: "rsm-classic",
    name: "RSM Classic",
    isMajor: false,
    purseUsd: 8_400_000,
    entryCriteria: { kind: "open", description: "FedEx Cup fall event" },
    venueMode: "fixed",
    seasonStartMonth: 11,
    seasonStartDay: 28,
    sortOrder: 47,
    venues: [
      {
        locationName: "Sea Island",
        locationCountry: "United States",
        locationRegion: "Georgia",
        venueName: "Sea Island Plantation Course",
        isDefault: true,
      },
    ],
  },
] as const;
