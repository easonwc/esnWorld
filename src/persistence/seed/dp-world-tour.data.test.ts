import { describe, expect, it } from "vitest";
import { DP_WORLD_TOURNAMENT_SEED_DATA } from "./dp-world-tour.data";

describe("DP World Tour catalog seed", () => {
  it("defines the full 2025 Race to Dubai calendar", () => {
    expect(DP_WORLD_TOURNAMENT_SEED_DATA).toHaveLength(42);

    const slugs = DP_WORLD_TOURNAMENT_SEED_DATA.map((entry) => entry.slug);
    expect(new Set(slugs).size).toBe(slugs.length);

    const sortOrders = DP_WORLD_TOURNAMENT_SEED_DATA.map(
      (entry) => entry.sortOrder,
    );
    expect(sortOrders).toEqual([...sortOrders].sort((a, b) => a - b));
    expect(sortOrders).toEqual(Array.from({ length: 42 }, (_, index) => index + 1));
  });

  it("includes four majors", () => {
    const majors = DP_WORLD_TOURNAMENT_SEED_DATA.filter((entry) => entry.isMajor);
    expect(majors.map((entry) => entry.slug).sort()).toEqual([
      "the-masters",
      "the-open-championship",
      "us-open",
      "us-pga-championship",
    ]);
  });
});
