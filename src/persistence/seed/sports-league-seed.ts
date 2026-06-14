import { buildConference } from "@/modules/conferences/transform";
import { buildDivision } from "@/modules/divisions/transform";
import { buildLeague } from "@/modules/leagues/transform";
import { buildTeam } from "@/modules/teams/transform";
import { buildVenue } from "@/modules/venues/transform";
import {
  getDefaultConferenceRepository,
  getDefaultCountryRepository,
  getDefaultDivisionRepository,
  getDefaultLeagueRepository,
  getDefaultLocationRepository,
  getDefaultTeamRepository,
  getDefaultVenueRepository,
  type ConferenceRepository,
  type CountryRepository,
  type DivisionRepository,
  type LeagueRepository,
  type LocationRepository,
  type TeamRepository,
  type VenueRepository,
} from "@/persistence/repositories";
import { resolveCollegeSeedLocation } from "./colleges";
import { locationMergeKey, mergeLocationSeed } from "./locations";
import type {
  SportsLeagueSeedCatalog,
  SportsLeagueSeedResult,
  SportsTeamSeedEntry,
} from "./sports-league-types";
import { requireUsSeedRegion } from "./validate-us-regions";

export function venueMergeKey(locationId: string, stadiumName: string): string {
  return `${locationId}|${stadiumName.trim().toLowerCase()}`;
}

function buildLocationKeyMap(
  locations: Awaited<ReturnType<LocationRepository["list"]>>,
) {
  return new Map(
    locations.map((location) => [
      locationMergeKey(location.name, location.countryName, location.region),
      location,
    ]),
  );
}

function buildVenueKeyMap(venues: Awaited<ReturnType<VenueRepository["list"]>>) {
  return new Map(
    venues.map((venue) => [venueMergeKey(venue.locationId, venue.name), venue]),
  );
}

async function ensureSupplementalLocations(
  catalog: SportsLeagueSeedCatalog,
  countryRepository: CountryRepository,
  locationRepository: LocationRepository,
) {
  if (catalog.supplementalLocations.length === 0) {
    return;
  }

  await mergeLocationSeed(
    locationRepository,
    countryRepository,
    catalog.supplementalLocations,
  );
}

async function ensureLeague(
  catalog: SportsLeagueSeedCatalog,
  leagueRepository: LeagueRepository,
) {
  const existing = await leagueRepository.getByAbbreviation(
    catalog.league.abbreviation,
  );
  if (existing) {
    if (!existing.logo) {
      const logo = catalog.getLeagueLogoPublicPath(catalog.league.abbreviation);
      await leagueRepository.updateLogo(existing.id, logo);
      return { league: { ...existing, logo }, added: false };
    }

    return { league: existing, added: false };
  }

  const logo = catalog.getLeagueLogoPublicPath(catalog.league.abbreviation);
  const league = buildLeague(
    { ...catalog.league, logo },
    crypto.randomUUID(),
  );
  await leagueRepository.create(league);
  return { league, added: true };
}

async function ensureConferences(
  catalog: SportsLeagueSeedCatalog,
  leagueId: string,
  leagueName: string,
  conferenceRepository: ConferenceRepository,
) {
  let added = 0;
  const byAbbreviation = new Map<
    string,
    NonNullable<Awaited<ReturnType<ConferenceRepository["get"]>>>
  >();

  for (const entry of catalog.conferences) {
    const existing = await conferenceRepository.getByAbbreviation(
      leagueId,
      entry.abbreviation,
    );

    if (existing) {
      byAbbreviation.set(entry.abbreviation, existing);
      continue;
    }

    const conference = buildConference(
      {
        leagueId,
        name: entry.name,
        abbreviation: entry.abbreviation,
      },
      crypto.randomUUID(),
      leagueName,
    );
    await conferenceRepository.create(conference);
    byAbbreviation.set(entry.abbreviation, conference);
    added += 1;
  }

  return { byAbbreviation, added };
}

async function ensureDivisions(
  catalog: SportsLeagueSeedCatalog,
  conferencesByAbbreviation: Map<
    string,
    NonNullable<Awaited<ReturnType<ConferenceRepository["get"]>>>
  >,
  divisionRepository: DivisionRepository,
) {
  let added = 0;
  const byAbbreviation = new Map<
    string,
    NonNullable<Awaited<ReturnType<DivisionRepository["get"]>>>
  >();

  for (const entry of catalog.divisions) {
    const conference = conferencesByAbbreviation.get(entry.conferenceAbbreviation);
    if (!conference) {
      throw new Error(
        `Seed conference not found for division ${entry.name}: ${entry.conferenceAbbreviation}`,
      );
    }

    const existing = await divisionRepository.getByAbbreviation(
      conference.id,
      entry.abbreviation,
    );

    if (existing) {
      byAbbreviation.set(entry.abbreviation, existing);
      continue;
    }

    const division = buildDivision(
      {
        conferenceId: conference.id,
        name: entry.name,
        abbreviation: entry.abbreviation,
      },
      crypto.randomUUID(),
      {
        name: conference.name,
        abbreviation: conference.abbreviation,
        leagueId: conference.leagueId,
        leagueName: conference.leagueName,
      },
    );
    await divisionRepository.create(division);
    byAbbreviation.set(entry.abbreviation, division);
    added += 1;
  }

  return { byAbbreviation, added };
}

async function ensureVenue(
  entry: SportsTeamSeedEntry,
  locationId: string,
  venueRepository: VenueRepository,
  venueByKey: Map<string, NonNullable<Awaited<ReturnType<VenueRepository["get"]>>>>,
) {
  const key = venueMergeKey(locationId, entry.stadiumName);
  const existing = venueByKey.get(key);

  if (existing) {
    return { venue: existing, added: false };
  }

  const venue = buildVenue(
    {
      locationId,
      name: entry.stadiumName,
      latitude: entry.latitude,
      longitude: entry.longitude,
      isIndoor: entry.isIndoor,
    },
    crypto.randomUUID(),
  );
  const created = await venueRepository.create(venue);
  venueByKey.set(key, created);
  return { venue: created, added: true };
}

async function ensureTeam(
  entry: SportsTeamSeedEntry,
  division: NonNullable<Awaited<ReturnType<DivisionRepository["get"]>>>,
  venue: NonNullable<Awaited<ReturnType<VenueRepository["get"]>>>,
  location: NonNullable<Awaited<ReturnType<LocationRepository["list"]>>[number]>,
  catalog: SportsLeagueSeedCatalog,
  teamRepository: TeamRepository,
  existingAbbreviations: Set<string>,
) {
  const normalizedAbbreviation = entry.abbreviation.trim().toUpperCase();
  if (existingAbbreviations.has(normalizedAbbreviation)) {
    return { added: false };
  }

  const logo = catalog.getTeamLogoPublicPath(entry.abbreviation);
  const team = buildTeam(
    {
      divisionId: division.id,
      venueId: venue.id,
      name: entry.name,
      abbreviation: entry.abbreviation,
      logo,
    },
    crypto.randomUUID(),
    {
      divisionName: division.name,
      divisionAbbreviation: division.abbreviation,
      conferenceId: division.conferenceId,
      conferenceName: division.conferenceName,
      conferenceAbbreviation: division.conferenceAbbreviation,
      leagueId: division.leagueId,
      leagueName: division.leagueName,
      venueName: venue.name,
      locationId: location.id,
      locationName: location.name,
      locationRegion: location.region,
    },
  );
  const created = await teamRepository.create(team);
  existingAbbreviations.add(normalizedAbbreviation);
  return { added: true };
}

export async function mergeSportsLeagueSeed(
  catalog: SportsLeagueSeedCatalog,
  enabled: boolean,
  repositories: {
    countryRepository?: CountryRepository;
    locationRepository?: LocationRepository;
    leagueRepository?: LeagueRepository;
    conferenceRepository?: ConferenceRepository;
    divisionRepository?: DivisionRepository;
    venueRepository?: VenueRepository;
    teamRepository?: TeamRepository;
  } = {},
): Promise<SportsLeagueSeedResult> {
  if (!enabled) {
    return {
      enabled: false,
      leagueAdded: false,
      conferencesAdded: 0,
      divisionsAdded: 0,
      venuesAdded: 0,
      teamsAdded: 0,
      teamsSkipped: 0,
      totalTeams: catalog.teams.length,
    };
  }

  const countryRepository =
    repositories.countryRepository ?? getDefaultCountryRepository();
  const locationRepository =
    repositories.locationRepository ?? getDefaultLocationRepository();
  const leagueRepository =
    repositories.leagueRepository ?? getDefaultLeagueRepository();
  const conferenceRepository =
    repositories.conferenceRepository ?? getDefaultConferenceRepository();
  const divisionRepository =
    repositories.divisionRepository ?? getDefaultDivisionRepository();
  const venueRepository =
    repositories.venueRepository ?? getDefaultVenueRepository();
  const teamRepository =
    repositories.teamRepository ?? getDefaultTeamRepository();

  await ensureSupplementalLocations(catalog, countryRepository, locationRepository);

  const { league, added: leagueAdded } = await ensureLeague(
    catalog,
    leagueRepository,
  );
  const { byAbbreviation: conferencesByAbbreviation, added: conferencesAdded } =
    await ensureConferences(
      catalog,
      league.id,
      league.name,
      conferenceRepository,
    );
  const { byAbbreviation: divisionsByAbbreviation, added: divisionsAdded } =
    await ensureDivisions(
      catalog,
      conferencesByAbbreviation,
      divisionRepository,
    );

  const locations = await locationRepository.list();
  const locationByKey = buildLocationKeyMap(locations);
  const venues = await venueRepository.list();
  const venueByKey = buildVenueKeyMap(venues);
  const existingAbbreviations = new Set(
    await teamRepository.listAbbreviationsByLeague(league.id),
  );

  let venuesAdded = 0;
  let teamsAdded = 0;
  let teamsSkipped = 0;

  for (const entry of catalog.teams) {
    const locationRegion = requireUsSeedRegion(
      entry.countryName,
      entry.locationRegion,
      `Team ${entry.name} location`,
    );

    const location = resolveCollegeSeedLocation(
      entry.locationName,
      entry.countryName,
      locationRegion,
      locationByKey,
    );

    if (!location) {
      throw new Error(
        `Seed location not found for team ${entry.name}: ${entry.locationName}, ${entry.locationRegion}, ${entry.countryName}`,
      );
    }

    const division = divisionsByAbbreviation.get(entry.divisionAbbreviation);
    if (!division) {
      throw new Error(
        `Seed division not found for team ${entry.name}: ${entry.divisionAbbreviation}`,
      );
    }

    const { venue, added: venueWasAdded } = await ensureVenue(
      entry,
      location.id,
      venueRepository,
      venueByKey,
    );
    if (venueWasAdded) {
      venuesAdded += 1;
    }

    const { added: teamWasAdded } = await ensureTeam(
      entry,
      division,
      venue,
      location,
      catalog,
      teamRepository,
      existingAbbreviations,
    );

    if (teamWasAdded) {
      teamsAdded += 1;
    } else {
      teamsSkipped += 1;
    }
  }

  return {
    enabled: true,
    leagueAdded,
    conferencesAdded,
    divisionsAdded,
    venuesAdded,
    teamsAdded,
    teamsSkipped,
    totalTeams: catalog.teams.length,
  };
}
