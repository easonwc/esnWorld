import type { MultiResourceVenueResourceSeedEntry } from "./multi-resource-venue-types";

export interface GolfVenueSeedEntry {
  locationName: string;
  locationCountry: string;
  locationRegion?: string | null;
  venueName: string;
  latitude: number;
  longitude: number;
  teeGroupCount: number;
}

export function resourcesForGolfVenue(
  entry: GolfVenueSeedEntry,
): readonly MultiResourceVenueResourceSeedEntry[] {
  return Array.from({ length: entry.teeGroupCount }, (_, index) => ({
    name: `Tee Group ${index + 1}`,
    resourceType: "tee_group" as const,
  }));
}
