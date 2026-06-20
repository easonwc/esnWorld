/** @deprecated Use tennis-venues.data.ts and golf-venues.data.ts */
import { GOLF_VENUE_SEED_DATA } from "./golf-venues.data";
import { TENNIS_VENUE_SEED_DATA } from "./tennis-venues.data";

export const TENNIS_GOLF_VENUE_SEED_DATA = [
  ...TENNIS_VENUE_SEED_DATA.map((entry) => ({ kind: "tennis" as const, ...entry })),
  ...GOLF_VENUE_SEED_DATA.map((entry) => ({ kind: "golf" as const, ...entry })),
] as const;
