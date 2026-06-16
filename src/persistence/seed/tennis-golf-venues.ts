import { buildVenue } from "@/modules/venues/transform";
import {
  getDefaultLocationRepository,
  getDefaultVenueRepository,
  getDefaultVenueResourceRepository,
  type LocationRepository,
  type VenueRepository,
  type VenueResourceRepository,
} from "@/persistence/repositories";
import { loadTennisGolfVenueSeedConfig } from "./config";
import { locationMergeKey } from "./locations";
import { venueMergeKey } from "./sports-league-seed";
import { TENNIS_GOLF_VENUE_SEED_DATA } from "./tennis-golf-venues.data";
import {
  resourcesForVenueEntry,
  type TennisGolfVenueSeedResult,
} from "./tennis-golf-venue-types";

export type { TennisGolfVenueSeedResult } from "./tennis-golf-venue-types";

export function venueResourceMergeKey(
  venueId: string,
  resourceName: string,
): string {
  return `${venueId}|${resourceName.trim().toLowerCase()}`;
}

export async function mergeTennisGolfVenueSeed(
  repositories: {
    locationRepository?: LocationRepository;
    venueRepository?: VenueRepository;
    venueResourceRepository?: VenueResourceRepository;
  } = {},
  enabled: boolean = loadTennisGolfVenueSeedConfig().enabled,
): Promise<TennisGolfVenueSeedResult> {
  if (!enabled) {
    return {
      enabled: false,
      venuesAdded: 0,
      venuesSkipped: 0,
      resourcesAdded: 0,
      resourcesSkipped: 0,
      venuesMissingLocation: 0,
      total: TENNIS_GOLF_VENUE_SEED_DATA.length,
    };
  }

  const locationRepository =
    repositories.locationRepository ?? getDefaultLocationRepository();
  const venueRepository =
    repositories.venueRepository ?? getDefaultVenueRepository();
  const venueResourceRepository =
    repositories.venueResourceRepository ?? getDefaultVenueResourceRepository();

  const locations = await locationRepository.list();
  const locationByKey = new Map(
    locations.map((location) => [
      locationMergeKey(location.name, location.countryName, location.region),
      location,
    ]),
  );

  const venues = await venueRepository.list();
  const venueByKey = new Map(
    venues.map((venue) => [venueMergeKey(venue.locationId, venue.name), venue]),
  );

  let venuesAdded = 0;
  let venuesSkipped = 0;
  let resourcesAdded = 0;
  let resourcesSkipped = 0;
  let venuesMissingLocation = 0;

  for (const entry of TENNIS_GOLF_VENUE_SEED_DATA) {
    const locationKey = locationMergeKey(
      entry.locationName,
      entry.locationCountry,
      entry.locationRegion,
    );
    const location = locationByKey.get(locationKey);

    if (!location) {
      venuesMissingLocation += 1;
      continue;
    }

    const venueKey = venueMergeKey(location.id, entry.venueName);
    let venue = venueByKey.get(venueKey);

    if (!venue) {
      venue = buildVenue(
        {
          locationId: location.id,
          name: entry.venueName,
          latitude: entry.latitude,
          longitude: entry.longitude,
          isIndoor: false,
          schedulingMode: "multi_resource",
        },
        crypto.randomUUID(),
      );
      await venueRepository.create(venue);
      venueByKey.set(venueKey, venue);
      venuesAdded += 1;
    } else {
      venuesSkipped += 1;
      if (venue.schedulingMode !== "multi_resource") {
        continue;
      }
    }

    const existingResources = await venueResourceRepository.listByVenue(venue.id);
    const existingResourceKeys = new Set(
      existingResources.map((resource) =>
        venueResourceMergeKey(venue!.id, resource.name),
      ),
    );

    for (const resource of resourcesForVenueEntry(entry)) {
      const resourceKey = venueResourceMergeKey(venue.id, resource.name);
      if (existingResourceKeys.has(resourceKey)) {
        resourcesSkipped += 1;
        continue;
      }

      await venueResourceRepository.create({
        id: crypto.randomUUID(),
        venueId: venue.id,
        name: resource.name,
        resourceType: resource.resourceType,
      });
      existingResourceKeys.add(resourceKey);
      resourcesAdded += 1;
    }
  }

  return {
    enabled: true,
    venuesAdded,
    venuesSkipped,
    resourcesAdded,
    resourcesSkipped,
    venuesMissingLocation,
    total: TENNIS_GOLF_VENUE_SEED_DATA.length,
  };
}

const globalForTennisGolfVenueSeed = globalThis as typeof globalThis & {
  __tennisGolfVenueSeedApplied?: boolean;
};

export async function seedTennisGolfVenuesOnStartup(): Promise<TennisGolfVenueSeedResult | null> {
  if (process.env.VITEST === "true") {
    return null;
  }

  const config = loadTennisGolfVenueSeedConfig();
  if (!config.enabled) {
    return null;
  }

  if (globalForTennisGolfVenueSeed.__tennisGolfVenueSeedApplied) {
    return null;
  }

  globalForTennisGolfVenueSeed.__tennisGolfVenueSeedApplied = true;
  return mergeTennisGolfVenueSeed();
}
