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

  it("references PGA schedules for co-sanctioned events", () => {
    const referenced = DP_WORLD_TOURNAMENT_SEED_DATA.filter(
      (entry) => entry.scheduleReference,
    );
    expect(referenced).toHaveLength(5);
    expect(
      referenced.map((entry) => ({
        slug: entry.slug,
        reference: entry.scheduleReference,
      })),
    ).toEqual(
      expect.arrayContaining([
        {
          slug: "the-masters",
          reference: { tourAbbreviation: "PGA", tournamentSlug: "masters" },
        },
        {
          slug: "us-pga-championship",
          reference: { tourAbbreviation: "PGA", tournamentSlug: "pga-championship" },
        },
        {
          slug: "us-open",
          reference: { tourAbbreviation: "PGA", tournamentSlug: "us-open" },
        },
        {
          slug: "the-open-championship",
          reference: {
            tourAbbreviation: "PGA",
            tournamentSlug: "the-open-championship",
          },
        },
        {
          slug: "genesis-scottish-open",
          reference: { tourAbbreviation: "PGA", tournamentSlug: "scottish-open" },
        },
      ]),
    );

    const materialized = DP_WORLD_TOURNAMENT_SEED_DATA.filter(
      (entry) => !entry.scheduleReference,
    );
    expect(materialized).toHaveLength(37);
  });

  it("uses expanded rotation pools for DP World rotation events", () => {
    const poolSize = (slug: string) =>
      DP_WORLD_TOURNAMENT_SEED_DATA.find((entry) => entry.slug === slug)?.venues
        .length;

    expect(poolSize("isps-handa-australian-open")).toBe(4);
    expect(poolSize("alfred-dunhill-links-championship")).toBe(6);
  });
});
