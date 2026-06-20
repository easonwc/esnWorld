import { describe, expect, it } from "vitest";
import { PGA_TOURNAMENT_SEED_DATA } from "./pga-tour.data";
import { PGA_TOUR_PHASE_B_SEED_DATA } from "./pga-tour-phase-b.data";

describe("PGA Tour catalog seed", () => {
  it("defines the full Phase A + Phase B calendar", () => {
    expect(PGA_TOUR_PHASE_B_SEED_DATA).toHaveLength(17);
    expect(PGA_TOURNAMENT_SEED_DATA).toHaveLength(47);

    const slugs = PGA_TOURNAMENT_SEED_DATA.map((entry) => entry.slug);
    expect(new Set(slugs).size).toBe(slugs.length);

    const sortOrders = PGA_TOURNAMENT_SEED_DATA.map((entry) => entry.sortOrder);
    expect(sortOrders).toEqual([...sortOrders].sort((a, b) => a - b));
    expect(sortOrders).toEqual(Array.from({ length: 47 }, (_, index) => index + 1));
  });

  it("includes four majors and signature non-major anchors", () => {
    const majors = PGA_TOURNAMENT_SEED_DATA.filter((entry) => entry.isMajor);
    expect(majors.map((entry) => entry.slug).sort()).toEqual([
      "masters",
      "pga-championship",
      "the-open-championship",
      "us-open",
    ]);

    const signatureSlugs = [
      "genesis-invitational",
      "arnold-palmer-invitational",
      "the-memorial-tournament",
      "travelers-championship",
      "truist-championship",
      "scottish-open",
      "rbc-canadian-open",
    ];
    for (const slug of signatureSlugs) {
      expect(PGA_TOURNAMENT_SEED_DATA.some((entry) => entry.slug === slug)).toBe(
        true,
      );
    }
  });

  it("includes Phase B weekly and fall swing stops", () => {
    const phaseBSlugs = [
      "sony-open-in-hawaii",
      "farmers-insurance-open",
      "mexico-open-at-vidanta",
      "puerto-rico-open",
      "corales-puntacana-championship",
      "myrtle-beach-classic",
      "isco-championship",
      "the-cj-cup-byron-nelson",
      "barracuda-championship",
      "fortinet-championship",
      "sanderson-farms-championship",
      "shriners-childrens-open",
      "zozo-championship",
      "butterfield-bermuda-championship",
      "black-desert-championship",
      "world-wide-technology-championship",
      "rsm-classic",
    ];

    for (const slug of phaseBSlugs) {
      expect(PGA_TOURNAMENT_SEED_DATA.some((entry) => entry.slug === slug)).toBe(
        true,
      );
    }
  });

  it("uses deep rotation pools for majors", () => {
    const poolSize = (slug: string) =>
      PGA_TOURNAMENT_SEED_DATA.find((entry) => entry.slug === slug)?.venues.length;

    expect(poolSize("pga-championship")).toBe(10);
    expect(poolSize("us-open")).toBe(10);
    expect(poolSize("the-open-championship")).toBe(10);
  });
});
