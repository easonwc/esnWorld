import { describe, expect, it } from "vitest";
import { LPGA_TOURNAMENT_SEED_DATA } from "./lpga-tour.data";

describe("LPGA Tour catalog seed", () => {
  it("defines the full 2025 official calendar", () => {
    expect(LPGA_TOURNAMENT_SEED_DATA).toHaveLength(33);

    const slugs = LPGA_TOURNAMENT_SEED_DATA.map((entry) => entry.slug);
    expect(new Set(slugs).size).toBe(slugs.length);

    const sortOrders = LPGA_TOURNAMENT_SEED_DATA.map((entry) => entry.sortOrder);
    expect(sortOrders).toEqual([...sortOrders].sort((a, b) => a - b));
    expect(sortOrders).toEqual(Array.from({ length: 33 }, (_, index) => index + 1));
  });

  it("includes five majors", () => {
    const majors = LPGA_TOURNAMENT_SEED_DATA.filter((entry) => entry.isMajor);
    expect(majors.map((entry) => entry.slug).sort()).toEqual([
      "aig-womens-open",
      "amundi-evian-championship",
      "chevron-championship",
      "kpmg-womens-pga-championship",
      "us-womens-open",
    ]);
  });
});
