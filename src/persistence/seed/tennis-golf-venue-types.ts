import type { VenueResourceType } from "@/modules/venues/types";

export interface TennisGolfVenueResourceSeedEntry {
  name: string;
  resourceType: VenueResourceType;
}

export interface TennisVenueSeedEntry {
  kind: "tennis";
  locationName: string;
  locationCountry: string;
  locationRegion?: string | null;
  venueName: string;
  latitude: number;
  longitude: number;
  courtCount: number;
}

export interface GolfVenueSeedEntry {
  kind: "golf";
  locationName: string;
  locationCountry: string;
  locationRegion?: string | null;
  venueName: string;
  latitude: number;
  longitude: number;
  teeGroupCount: number;
}

export type TennisGolfVenueSeedEntry = TennisVenueSeedEntry | GolfVenueSeedEntry;

export interface TennisGolfVenueSeedResult {
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
): readonly TennisGolfVenueResourceSeedEntry[] {
  return Array.from({ length: count }, (_, index) => ({
    name: `Court ${index + 1}`,
    resourceType: "court" as const,
  }));
}

export function numberedTeeGroups(
  count: number,
): readonly TennisGolfVenueResourceSeedEntry[] {
  return Array.from({ length: count }, (_, index) => ({
    name: `Tee Group ${index + 1}`,
    resourceType: "tee_group" as const,
  }));
}

export function resourcesForVenueEntry(
  entry: TennisGolfVenueSeedEntry,
): readonly TennisGolfVenueResourceSeedEntry[] {
  if (entry.kind === "tennis") {
    return numberedCourts(entry.courtCount);
  }

  return numberedTeeGroups(entry.teeGroupCount);
}
