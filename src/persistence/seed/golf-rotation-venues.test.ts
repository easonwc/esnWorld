import { describe, expect, it } from "vitest";
import { GOLF_ROTATION_VENUE_COUNT, GOLF_ROTATION_VENUE_SEED_DATA } from "./golf-rotation-venues.data";
import { DEFAULT_GOLF_VENUE_TEE_GROUP_COUNT } from "./golf-venue-types";

describe("golf rotation venue seed", () => {
  it("defines rotation-only alternates with full tee group capacity", () => {
    expect(GOLF_ROTATION_VENUE_SEED_DATA).toHaveLength(GOLF_ROTATION_VENUE_COUNT);
    expect(GOLF_ROTATION_VENUE_COUNT).toBe(14);

    const names = GOLF_ROTATION_VENUE_SEED_DATA.map((entry) => entry.venueName);
    expect(new Set(names).size).toBe(names.length);
    expect(
      GOLF_ROTATION_VENUE_SEED_DATA.every(
        (entry) => entry.teeGroupCount === DEFAULT_GOLF_VENUE_TEE_GROUP_COUNT,
      ),
    ).toBe(true);
  });
});
