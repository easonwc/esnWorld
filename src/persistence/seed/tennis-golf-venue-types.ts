/** @deprecated Use multi-resource-venue-types.ts, tennis-venue-types.ts, and golf-venue-types.ts */
import type { MultiResourceVenueSeedResult } from "./multi-resource-venue-types";
export type {
  MultiResourceVenueResourceSeedEntry,
  MultiResourceVenueSeedResult,
} from "./multi-resource-venue-types";
export {
  numberedCourts,
  numberedTeeGroups,
} from "./multi-resource-venue-types";
export type { TennisVenueSeedEntry } from "./tennis-venue-types";
export { resourcesForTennisVenue as resourcesForVenueEntry } from "./tennis-venue-types";
export type { GolfVenueSeedEntry } from "./golf-venue-types";

import type { TennisVenueSeedEntry } from "./tennis-venue-types";
import type { GolfVenueSeedEntry } from "./golf-venue-types";

export type TennisGolfVenueSeedEntry =
  | ({ kind: "tennis" } & TennisVenueSeedEntry)
  | ({ kind: "golf" } & GolfVenueSeedEntry);

export type TennisGolfVenueSeedResult = MultiResourceVenueSeedResult;
