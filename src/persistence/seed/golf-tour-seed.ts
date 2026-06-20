import type { LocationSeedEntry } from "./types";
import { mergeCountrySeed } from "./countries";
import { locationMergeKey, mergeLocationSeed } from "./locations";
import { venueMergeKey } from "./sports-league-seed";
import { GOLF_LOCATION_SEED_DATA } from "./golf-locations.data";
import { mergeGolfVenueSeed } from "./golf-venues";
import type { GolfVenueSeedEntry } from "./golf-venue-types";
import { GOLF_VENUE_SEED_DATA } from "./golf-venues.data";
import { getGolfTourLogoPublicPath } from "@/persistence/logos/config";
import type {
  GolfTournamentSeedEntry,
  GolfTournamentVenueRef,
  GolfTourSeedDefinition,
  GolfTourSeedResult,
} from "./golf-tour-seed.types";
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

export type {
  GolfTournamentSeedEntry,
  GolfTournamentVenueRef,
  GolfTourSeedDefinition,
  GolfTourSeedResult,
} from "./golf-tour-seed.types";

async function resolveVenueId(
  ref: GolfTournamentVenueRef,
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

async function ensureGolfCatalogPrerequisites(
  repositories: {
    countryRepository: CountryRepository;
    locationRepository: LocationRepository;
    venueRepository: VenueRepository;
    venueResourceRepository: VenueResourceRepository;
  },
  supplementalLocations: readonly LocationSeedEntry[] = [],
  supplementalVenues: readonly GolfVenueSeedEntry[] = [],
): Promise<void> {
  await mergeCountrySeed(repositories.countryRepository);
  await mergeLocationSeed(
    repositories.locationRepository,
    repositories.countryRepository,
    [...GOLF_LOCATION_SEED_DATA, ...supplementalLocations],
  );
  await mergeGolfVenueSeed(
    {
      locationRepository: repositories.locationRepository,
      venueRepository: repositories.venueRepository,
      venueResourceRepository: repositories.venueResourceRepository,
    },
    true,
    [...GOLF_VENUE_SEED_DATA, ...supplementalVenues],
  );
}

async function linkTournamentVenues(
  tournamentId: string,
  entry: GolfTournamentSeedEntry,
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

export async function mergeGolfTourCatalogSeed(input: {
  tour: GolfTourSeedDefinition;
  tournaments: readonly (GolfTournamentSeedEntry & {
    venues: readonly GolfTournamentVenueRef[];
  })[];
  defaultTeeGroupCount: number;
  defaultFieldSize: number;
  supplementalLocations?: readonly LocationSeedEntry[];
  supplementalVenues?: readonly GolfVenueSeedEntry[];
  repositories?: {
    tourRepository?: GolfTourRepository;
    tournamentRepository?: GolfTournamentRepository;
    tournamentVenueRepository?: GolfTournamentVenueRepository;
    locationRepository?: LocationRepository;
    venueRepository?: VenueRepository;
    venueResourceRepository?: VenueResourceRepository;
    countryRepository?: CountryRepository;
  };
  enabled?: boolean;
}): Promise<GolfTourSeedResult> {
  if (input.enabled === false) {
    return {
      enabled: false,
      tourAdded: false,
      tournamentsAdded: 0,
      tournamentsSkipped: 0,
      venueLinksAdded: 0,
      tournamentsMissingVenue: 0,
    };
  }

  const repositories = input.repositories ?? {};
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

  await ensureGolfCatalogPrerequisites(
    {
      countryRepository,
      locationRepository,
      venueRepository,
      venueResourceRepository,
    },
    input.supplementalLocations,
    input.supplementalVenues,
  );

  let tour = await tourRepository.getByAbbreviation(input.tour.abbreviation);
  let tourAdded = false;
  const tourLogo = getGolfTourLogoPublicPath(input.tour.abbreviation);

  if (!tour) {
    tour = {
      id: crypto.randomUUID(),
      name: input.tour.name,
      abbreviation: input.tour.abbreviation,
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

  for (const entry of input.tournaments) {
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
        teeGroupCount: entry.teeGroupCount ?? input.defaultTeeGroupCount,
        fieldSize: entry.fieldSize ?? input.defaultFieldSize,
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
