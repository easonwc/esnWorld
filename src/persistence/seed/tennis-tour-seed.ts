import type { LocationSeedEntry } from "./types";
import { mergeCountrySeed } from "./countries";
import { locationMergeKey, mergeLocationSeed } from "./locations";
import { LOCATION_SEED_DATA } from "./locations.data";
import { venueMergeKey } from "./sports-league-seed";
import { TENNIS_LOCATION_SEED_DATA } from "./tennis-locations.data";
import { mergeTennisVenueSeed } from "./tennis-venues";
import type { TennisVenueSeedEntry } from "./tennis-venue-types";
import { TENNIS_VENUE_SEED_DATA } from "./tennis-venues.data";
import { getTennisTourLogoPublicPath } from "@/persistence/logos/config";
import { scheduleReferencesEqual } from "./schedule-reference";
import type {
  TennisTournamentSeedEntry,
  TennisTournamentVenueRef,
  TennisTourSeedDefinition,
  TennisTourSeedResult,
} from "./tennis-tour-seed.types";
import type {
  CountryRepository,
  LocationRepository,
  TennisTournamentRepository,
  TennisTournamentVenueRepository,
  TennisTourRepository,
  VenueRepository,
  VenueResourceRepository,
} from "../repositories/types";
import {
  getDefaultCountryRepository,
  getDefaultLocationRepository,
  getDefaultTennisTournamentRepository,
  getDefaultTennisTournamentVenueRepository,
  getDefaultTennisTourRepository,
  getDefaultVenueRepository,
  getDefaultVenueResourceRepository,
} from "../repositories";

export type {
  TennisTournamentSeedEntry,
  TennisTournamentVenueRef,
  TennisTourSeedDefinition,
  TennisTourSeedResult,
} from "./tennis-tour-seed.types";

/** Grand slam hosts plus major metros for Masters venues in the world city catalog. */
const CATALOG_HOST_CITY_NAMES = new Set([
  "Melbourne",
  "London",
  "Paris",
  "New York",
  "Miami",
  "Cincinnati",
  "Rome",
  "Madrid",
  "Shanghai",
  "Beijing",
]);

const CATALOG_HOST_LOCATIONS = LOCATION_SEED_DATA.filter((entry) =>
  CATALOG_HOST_CITY_NAMES.has(entry.name),
);

async function resolveVenueId(
  ref: TennisTournamentVenueRef,
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

async function ensureTennisCatalogPrerequisites(
  repositories: {
    countryRepository: CountryRepository;
    locationRepository: LocationRepository;
    venueRepository: VenueRepository;
    venueResourceRepository: VenueResourceRepository;
  },
  supplementalLocations: readonly LocationSeedEntry[] = [],
  supplementalVenues: readonly TennisVenueSeedEntry[] = [],
): Promise<void> {
  await mergeCountrySeed(repositories.countryRepository);
  await mergeLocationSeed(
    repositories.locationRepository,
    repositories.countryRepository,
    [
      ...CATALOG_HOST_LOCATIONS,
      ...TENNIS_LOCATION_SEED_DATA,
      ...supplementalLocations,
    ],
  );
  await mergeTennisVenueSeed(
    {
      locationRepository: repositories.locationRepository,
      venueRepository: repositories.venueRepository,
      venueResourceRepository: repositories.venueResourceRepository,
    },
    true,
    [...TENNIS_VENUE_SEED_DATA, ...supplementalVenues],
  );
}

async function linkTournamentVenues(
  tournamentId: string,
  entry: TennisTournamentSeedEntry & {
    venues: readonly TennisTournamentVenueRef[];
  },
  locationRepository: LocationRepository,
  venueRepository: VenueRepository,
  tournamentVenueRepository: TennisTournamentVenueRepository,
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

export async function mergeTennisTourCatalogSeed(input: {
  tour: TennisTourSeedDefinition;
  tournaments: readonly (TennisTournamentSeedEntry & {
    venues: readonly TennisTournamentVenueRef[];
  })[];
  defaultActiveCourtCount: number;
  defaultDrawSize: number;
  defaultDurationDays: number;
  supplementalLocations?: readonly LocationSeedEntry[];
  supplementalVenues?: readonly TennisVenueSeedEntry[];
  repositories?: {
    tourRepository?: TennisTourRepository;
    tournamentRepository?: TennisTournamentRepository;
    tournamentVenueRepository?: TennisTournamentVenueRepository;
    locationRepository?: LocationRepository;
    venueRepository?: VenueRepository;
    venueResourceRepository?: VenueResourceRepository;
    countryRepository?: CountryRepository;
  };
  enabled?: boolean;
}): Promise<TennisTourSeedResult> {
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
    repositories.tourRepository ?? getDefaultTennisTourRepository();
  const tournamentRepository =
    repositories.tournamentRepository ?? getDefaultTennisTournamentRepository();
  const tournamentVenueRepository =
    repositories.tournamentVenueRepository ??
    getDefaultTennisTournamentVenueRepository();
  const locationRepository =
    repositories.locationRepository ?? getDefaultLocationRepository();
  const venueRepository =
    repositories.venueRepository ?? getDefaultVenueRepository();
  const venueResourceRepository =
    repositories.venueResourceRepository ?? getDefaultVenueResourceRepository();
  const countryRepository =
    repositories.countryRepository ?? getDefaultCountryRepository();

  await ensureTennisCatalogPrerequisites(
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
  const tourLogo = getTennisTourLogoPublicPath(input.tour.abbreviation);

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
    const materializeOnSchedule = entry.materializeOnSchedule ?? true;
    const scheduleReference = entry.scheduleReference ?? null;
    if (existing) {
      tournamentsSkipped += 1;
      tournamentId = existing.id;
      if (existing.materializeOnSchedule !== materializeOnSchedule) {
        await tournamentRepository.updateMaterializeOnSchedule(
          tournamentId,
          materializeOnSchedule,
        );
      }
      if (!scheduleReferencesEqual(existing.scheduleReference, scheduleReference)) {
        await tournamentRepository.updateScheduleReference(
          tournamentId,
          scheduleReference,
        );
      }
    } else {
      const tournament = {
        id: crypto.randomUUID(),
        tourId: tour.id,
        slug: entry.slug,
        name: entry.name,
        isMajor: entry.isMajor,
        prizeMoneyUsd: entry.prizeMoneyUsd,
        entryCriteria: entry.entryCriteria,
        venueMode: entry.venueMode,
        typicalDurationDays:
          entry.typicalDurationDays ?? input.defaultDurationDays,
        activeCourtCount: entry.activeCourtCount ?? input.defaultActiveCourtCount,
        drawSize: entry.drawSize ?? input.defaultDrawSize,
        seasonStartMonth: entry.seasonStartMonth,
        seasonStartDay: entry.seasonStartDay,
        rotationEpochYear: entry.rotationEpochYear ?? null,
        sortOrder: entry.sortOrder,
        materializeOnSchedule,
        scheduleReference,
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
