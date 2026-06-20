/** @deprecated Combined tennis/golf venue seed — use tennis-venues.ts and golf-venues.ts */
import type { MultiResourceVenueSeedResult } from "./multi-resource-venue-types";
import {
  mergeGolfVenueSeed,
  seedGolfVenuesOnStartup,
} from "./golf-venues";
import {
  mergeMultiResourceVenueSeed,
} from "./multi-resource-venue-seed";
import {
  mergeTennisVenueSeed,
  seedTennisVenuesOnStartup,
} from "./tennis-venues";

export { seedTennisVenuesOnStartup } from "./tennis-venues";
export { mergeGolfVenueSeed, seedGolfVenuesOnStartup } from "./golf-venues";
export { venueResourceMergeKey } from "./multi-resource-venue-seed";

type VenueSeedRepositories = Parameters<typeof mergeMultiResourceVenueSeed>[2];

/** @deprecated Merges both tennis and golf venue catalogs. */
export async function mergeTennisGolfVenueSeed(
  repositories: VenueSeedRepositories = {},
  enabled = true,
): Promise<MultiResourceVenueSeedResult> {
  const tennis = await mergeTennisVenueSeed(repositories, enabled);
  const golf = await mergeGolfVenueSeed(repositories, enabled);

  return {
    enabled: tennis.enabled || golf.enabled,
    venuesAdded: tennis.venuesAdded + golf.venuesAdded,
    venuesSkipped: tennis.venuesSkipped + golf.venuesSkipped,
    resourcesAdded: tennis.resourcesAdded + golf.resourcesAdded,
    resourcesSkipped: tennis.resourcesSkipped + golf.resourcesSkipped,
    venuesMissingLocation:
      tennis.venuesMissingLocation + golf.venuesMissingLocation,
    total: tennis.total + golf.total,
  };
}

/** @deprecated Use seedTennisVenuesOnStartup and seedGolfVenuesOnStartup */
export async function seedTennisGolfVenuesOnStartup() {
  const tennis = await seedTennisVenuesOnStartup();
  const golf = await seedGolfVenuesOnStartup();
  if (!tennis && !golf) {
    return null;
  }
  return {
    enabled: true,
    venuesAdded: (tennis?.venuesAdded ?? 0) + (golf?.venuesAdded ?? 0),
    venuesSkipped: (tennis?.venuesSkipped ?? 0) + (golf?.venuesSkipped ?? 0),
    resourcesAdded: (tennis?.resourcesAdded ?? 0) + (golf?.resourcesAdded ?? 0),
    resourcesSkipped:
      (tennis?.resourcesSkipped ?? 0) + (golf?.resourcesSkipped ?? 0),
    venuesMissingLocation:
      (tennis?.venuesMissingLocation ?? 0) + (golf?.venuesMissingLocation ?? 0),
    total: (tennis?.total ?? 0) + (golf?.total ?? 0),
  };
}
