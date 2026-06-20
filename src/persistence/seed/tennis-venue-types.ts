import type { MultiResourceVenueResourceSeedEntry } from "./multi-resource-venue-types";

export interface TennisVenueSeedEntry {
  locationName: string;
  locationCountry: string;
  locationRegion?: string | null;
  venueName: string;
  latitude: number;
  longitude: number;
  courtCount: number;
}

export function resourcesForTennisVenue(
  entry: TennisVenueSeedEntry,
): readonly MultiResourceVenueResourceSeedEntry[] {
  return Array.from({ length: entry.courtCount }, (_, index) => ({
    name: `Court ${index + 1}`,
    resourceType: "court" as const,
  }));
}
