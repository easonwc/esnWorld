import type { VenueResourceType } from "@/modules/venues/types";

export interface MultiResourceVenueResourceSeedEntry {
  name: string;
  resourceType: VenueResourceType;
}

export interface MultiResourceVenueSeedEntry {
  locationName: string;
  locationCountry: string;
  locationRegion?: string | null;
  venueName: string;
  latitude: number;
  longitude: number;
}

export interface MultiResourceVenueSeedResult {
  enabled: boolean;
  venuesAdded: number;
  venuesSkipped: number;
  resourcesAdded: number;
  resourcesSkipped: number;
  venuesMissingLocation: number;
  total: number;
}

export function numberedCourts(
  count: number,
): readonly MultiResourceVenueResourceSeedEntry[] {
  return Array.from({ length: count }, (_, index) => ({
    name: `Court ${index + 1}`,
    resourceType: "court" as const,
  }));
}

export function numberedTeeGroups(
  count: number,
): readonly MultiResourceVenueResourceSeedEntry[] {
  return Array.from({ length: count }, (_, index) => ({
    name: `Tee Group ${index + 1}`,
    resourceType: "tee_group" as const,
  }));
}
