import { loadPgaTourSeedConfig } from "./golf-config";
import { mergeCountrySeed } from "./countries";
import { locationMergeKey, mergeLocationSeed } from "./locations";
import { venueMergeKey } from "./sports-league-seed";
import { GOLF_LOCATION_SEED_DATA } from "./golf-locations.data";
import { mergeGolfVenueSeed } from "./golf-venues";
import { getGolfTourLogoPublicPath } from "@/persistence/logos/config";
import {
  PGA_TOURNAMENT_SEED_DATA,
  PGA_TOUR_SEED,
  type PgaTournamentSeedEntry,
} from "./pga-tour.data";
import type {
  GolfTournamentRepository,
  GolfTournamentVenueRepository,
  GolfTourRepository,
  LocationRepository,
  VenueRepository,
  VenueResourceRepository,
  CountryRepository,
} from "../repositories/types";
import {
  getDefaultCountryRepository,
  getDefaultGolfTournamentRepository,
  getDefaultGolfTournamentVenueRepository,
  getDefaultGolfTourRepository,
  getDefaultLocationRepository,
  getDefaultVenueRepository,
  getDefaultVenueResourceRepository,
} from "../repositories";

export interface PgaTourSeedResult {
  enabled: boolean;
  tourAdded: boolean;
  tournamentsAdded: number;
  tournamentsSkipped: number;
  venueLinksAdded: number;
  tournamentsMissingVenue: number;
}

async function resolveVenueId(
  ref: PgaTournamentSeedEntry["venues"][number],
  locationRepository: LocationRepository,
  venueRepository: VenueRepository,
): Promise<string | null> {
  const locations = await locationRepository.list();
  const location = locations.find(
    (entry) =>
      locationMergeKey(entry.name, entry.countryName, entry.region) ===
      locationMergeKey(ref.locationName, ref.locationCountry, ref.locationRegion),
  );

  if (!location) {
    return null;
  }

  const venues = await venueRepository.listByLocation(location.id);
  const venue = venues.find(
    (entry) =>
      venueMergeKey(location.id, entry.name) ===
      venueMergeKey(location.id, ref.venueName),
  );

  return venue?.id ?? null;
}

async function ensureGolfVenuesForPgaTour(
  repositories: {
    countryRepository: CountryRepository;
    locationRepository: LocationRepository;
    venueRepository: VenueRepository;
    venueResourceRepository: VenueResourceRepository;
  },
): Promise<void> {
  await mergeCountrySeed(repositories.countryRepository);
  await mergeLocationSeed(
    repositories.locationRepository,
    repositories.countryRepository,
    GOLF_LOCATION_SEED_DATA,
  );
  await mergeGolfVenueSeed(
    {
      locationRepository: repositories.locationRepository,
      venueRepository: repositories.venueRepository,
      venueResourceRepository: repositories.venueResourceRepository,
    },
    true,
  );
}

async function linkTournamentVenues(
  tournamentId: string,
  entry: PgaTournamentSeedEntry,
  locationRepository: LocationRepository,
  venueRepository: VenueRepository,
  tournamentVenueRepository: GolfTournamentVenueRepository,
): Promise<{ venueLinksAdded: number; linkedVenue: boolean }> {
  const existingLinks =
    await tournamentVenueRepository.listByTournament(tournamentId);
  const linkedVenueIds = new Set(existingLinks.map((link) => link.venueId));

  let venueLinksAdded = 0;
  let linkedVenue = existingLinks.length > 0;

  for (const [index, venueRef] of entry.venues.entries()) {
    const venueId = await resolveVenueId(
      venueRef,
      locationRepository,
      venueRepository,
    );
    if (!venueId || linkedVenueIds.has(venueId)) {
      continue;
    }

    await tournamentVenueRepository.create({
      id: crypto.randomUUID(),
      tournamentId,
      venueId,
      rotationOrder: venueRef.rotationOrder ?? index,
      isDefault: venueRef.isDefault ?? index === 0,
    });
    linkedVenueIds.add(venueId);
    venueLinksAdded += 1;
    linkedVenue = true;
  }

  return { venueLinksAdded, linkedVenue };
}

export async function mergePgaTourSeed(
  repositories: {
    tourRepository?: GolfTourRepository;
    tournamentRepository?: GolfTournamentRepository;
    tournamentVenueRepository?: GolfTournamentVenueRepository;
    locationRepository?: LocationRepository;
    venueRepository?: VenueRepository;
    venueResourceRepository?: VenueResourceRepository;
    countryRepository?: CountryRepository;
  } = {},
  enabled: boolean = loadPgaTourSeedConfig().enabled,
): Promise<PgaTourSeedResult> {
  if (!enabled) {
    return {
      enabled: false,
      tourAdded: false,
      tournamentsAdded: 0,
      tournamentsSkipped: 0,
      venueLinksAdded: 0,
      tournamentsMissingVenue: 0,
    };
  }

  const tourRepository =
    repositories.tourRepository ?? getDefaultGolfTourRepository();
  const tournamentRepository =
    repositories.tournamentRepository ?? getDefaultGolfTournamentRepository();
  const tournamentVenueRepository =
    repositories.tournamentVenueRepository ??
    getDefaultGolfTournamentVenueRepository();
  const locationRepository =
    repositories.locationRepository ?? getDefaultLocationRepository();
  const venueRepository =
    repositories.venueRepository ?? getDefaultVenueRepository();
  const venueResourceRepository =
    repositories.venueResourceRepository ?? getDefaultVenueResourceRepository();
  const countryRepository =
    repositories.countryRepository ?? getDefaultCountryRepository();

  await ensureGolfVenuesForPgaTour({
    countryRepository,
    locationRepository,
    venueRepository,
    venueResourceRepository,
  });

  let tour = await tourRepository.getByAbbreviation(PGA_TOUR_SEED.abbreviation);
  let tourAdded = false;
  const tourLogo = getGolfTourLogoPublicPath(PGA_TOUR_SEED.abbreviation);

  if (!tour) {
    tour = {
      id: crypto.randomUUID(),
      name: PGA_TOUR_SEED.name,
      abbreviation: PGA_TOUR_SEED.abbreviation,
      logo: tourLogo,
    };
    await tourRepository.create(tour);
    tourAdded = true;
  } else if (!tour.logo) {
    await tourRepository.updateLogo(tour.id, tourLogo);
    tour = { ...tour, logo: tourLogo };
  }

  let tournamentsAdded = 0;
  let tournamentsSkipped = 0;
  let venueLinksAdded = 0;
  let tournamentsMissingVenue = 0;

  for (const entry of PGA_TOURNAMENT_SEED_DATA) {
    const existing = await tournamentRepository.getBySlug(tour.id, entry.slug);

    let tournamentId: string;
    if (existing) {
      tournamentsSkipped += 1;
      tournamentId = existing.id;
    } else {
      const tournament = {
        id: crypto.randomUUID(),
        tourId: tour.id,
        slug: entry.slug,
        name: entry.name,
        isMajor: entry.isMajor,
        purseUsd: entry.purseUsd,
        entryCriteria: entry.entryCriteria,
        venueMode: entry.venueMode,
        typicalDurationDays: 4,
        fieldSize: 30,
        seasonStartMonth: entry.seasonStartMonth,
        seasonStartDay: entry.seasonStartDay,
        rotationEpochYear: entry.rotationEpochYear ?? null,
        sortOrder: entry.sortOrder,
      };

      await tournamentRepository.create(tournament);
      tournamentsAdded += 1;
      tournamentId = tournament.id;
    }

    const linkResult = await linkTournamentVenues(
      tournamentId,
      entry,
      locationRepository,
      venueRepository,
      tournamentVenueRepository,
    );
    venueLinksAdded += linkResult.venueLinksAdded;

    if (!linkResult.linkedVenue) {
      tournamentsMissingVenue += 1;
    }
  }

  return {
    enabled: true,
    tourAdded,
    tournamentsAdded,
    tournamentsSkipped,
    venueLinksAdded,
    tournamentsMissingVenue,
  };
}

const globalForPgaTourSeed = globalThis as typeof globalThis & {
  __pgaTourSeedApplied?: boolean;
};

export async function seedPgaTourOnStartup(): Promise<PgaTourSeedResult | null> {
  if (process.env.VITEST === "true") {
    return null;
  }

  const config = loadPgaTourSeedConfig();
  if (!config.enabled) {
    return null;
  }

  if (globalForPgaTourSeed.__pgaTourSeedApplied) {
    return null;
  }

  globalForPgaTourSeed.__pgaTourSeedApplied = true;
  return mergePgaTourSeed();
}
