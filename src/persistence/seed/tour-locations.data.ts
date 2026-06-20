import type { LocationSeedEntry } from "./types";
import { GOLF_LOCATION_SEED_DATA } from "./golf-locations.data";
import { TENNIS_LOCATION_SEED_DATA } from "./tennis-locations.data";

/** Combined supplemental cities merged into the world location catalog. */
export const TOUR_LOCATION_SEED_DATA: readonly LocationSeedEntry[] = [
  ...TENNIS_LOCATION_SEED_DATA,
  ...GOLF_LOCATION_SEED_DATA,
] as const;

/** @deprecated Use TOUR_LOCATION_SEED_DATA, TENNIS_LOCATION_SEED_DATA, or GOLF_LOCATION_SEED_DATA. */
export const TENNIS_GOLF_LOCATION_SEED_DATA = TOUR_LOCATION_SEED_DATA;
