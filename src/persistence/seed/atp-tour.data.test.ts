import { describe, expect, it } from "vitest";
import {
  ATP_TOUR_CATALOG_EXPECTED,
  ATP_TOUR_CATALOG_SEED_DATA,
} from "./atp-tour-catalog.data";
import { ATP_TOURNAMENT_SEED_DATA } from "./atp-tour.data";
import {
  WTA_TOUR_CATALOG_EXPECTED,
  WTA_TOUR_CATALOG_SEED_DATA,
} from "./wta-tour-catalog.data";
import {
  WTA_JOINT_ATP_TOURNAMENT_SLUGS,
  WTA_TOURNAMENT_SEED_DATA,
} from "./wta-tour.data";

describe("ATP Tour catalog data", () => {
  it("combines four slams with a venue-backed tour calendar", () => {
    expect(ATP_TOURNAMENT_SEED_DATA).toHaveLength(26);
    expect(ATP_TOUR_CATALOG_SEED_DATA).toHaveLength(22);
    expect(ATP_TOURNAMENT_SEED_DATA.filter((entry) => entry.isMajor)).toHaveLength(4);
  });

  it("covers Masters 1000, 500, and 250 tiers with Canadian rotation", () => {
    expect(
      ATP_TOUR_CATALOG_SEED_DATA.filter((entry) => entry.drawSize === 96),
    ).toHaveLength(ATP_TOUR_CATALOG_EXPECTED.masters1000Count);
    expect(
      ATP_TOUR_CATALOG_SEED_DATA.filter((entry) => entry.drawSize === 48),
    ).toHaveLength(ATP_TOUR_CATALOG_EXPECTED.atp500Count);
    expect(
      ATP_TOUR_CATALOG_SEED_DATA.filter((entry) => entry.drawSize === 28),
    ).toHaveLength(ATP_TOUR_CATALOG_EXPECTED.atp250Count);
    expect(
      ATP_TOUR_CATALOG_SEED_DATA.filter((entry) => entry.venueMode === "rotation"),
    ).toHaveLength(ATP_TOUR_CATALOG_EXPECTED.rotationCount);
  });

  it("links every catalog tournament to at least one seeded venue", () => {
    for (const entry of ATP_TOURNAMENT_SEED_DATA) {
      expect(entry.venues.length).toBeGreaterThan(0);
      expect(entry.venues[0]?.venueName.length).toBeGreaterThan(0);
    }
  });
});

describe("WTA Tour catalog data", () => {
  it("combines four slams with joint and WTA-only events", () => {
    expect(WTA_TOURNAMENT_SEED_DATA).toHaveLength(26);
    expect(WTA_TOUR_CATALOG_SEED_DATA).toHaveLength(22);
    expect(WTA_JOINT_ATP_TOURNAMENT_SLUGS.length).toBe(14);
  });

  it("references ATP for joint weeks and materializes WTA-only stops", () => {
    const jointCatalog = WTA_TOUR_CATALOG_SEED_DATA.filter(
      (entry) => entry.scheduleReference?.tourAbbreviation === "ATP",
    );
    const wtaOnlyCatalog = WTA_TOUR_CATALOG_SEED_DATA.filter(
      (entry) => !entry.scheduleReference,
    );

    expect(jointCatalog).toHaveLength(WTA_TOUR_CATALOG_EXPECTED.jointWithAtpCount);
    expect(wtaOnlyCatalog).toHaveLength(WTA_TOUR_CATALOG_EXPECTED.wtaOnlyCount);
    expect(
      WTA_TOUR_CATALOG_SEED_DATA.filter((entry) => entry.drawSize === 96),
    ).toHaveLength(WTA_TOUR_CATALOG_EXPECTED.wta1000Count);
  });
});
