import { generateRandomGolferAttributes } from "golf-sim-library";
import { getGolferStore, resetGolferStore } from "@/modules/golfers";
import {
  getGolfWorldRankingStore,
  resetGolfWorldRankingStore,
} from "@/modules/golf-world-rankings";
import { getGolfTourMembershipStore, resetGolfTourMembershipStore } from "@/modules/golf-tour-memberships";
import { resetHumanStore } from "@/modules/humans";
import { resetLocationStore } from "@/modules/locations";
import { getWorldClockService, resetWorldClockService } from "@/modules/world-clock";
import { MemoryGolfTourRepository } from "@/persistence/repositories/memory/golf.memory";
import { MemoryGolfTourMembershipRepository } from "@/persistence/repositories/memory/golf-tour-membership.memory";
import { MemoryGolfWorldRankingRepository } from "@/persistence/repositories/memory/golf-world-ranking.memory";
import { seedUnitedStatesCountry } from "@/test/world-fixtures";
import { beforeEach, describe, expect, it } from "vitest";
import { loadOwgrSeedConfig } from "./owgr-config";
import { mergeOwgrSeed } from "./owgr-seed";
import { mergePgaTourMembershipsSeed } from "./pga-tour-memberships";
import { PGA_TOUR_SEED } from "./pga-tour.data";

async function seedGolfers(maleCount: number, femaleCount: number) {
  const country = await seedUnitedStatesCountry();
  const location = await resetLocationStore().create({
    name: "Dallas",
    countryId: country.id,
    region: "Texas",
    latitude: 32.7767,
    longitude: -96.797,
    timezone: "America/Chicago",
    population: 1_300_000,
  });

  for (let index = 0; index < maleCount + femaleCount; index += 1) {
    const gender = index < maleCount ? "male" : "female";
    const human = await resetHumanStore().create({
      givenName: `Golfer${index}`,
      familyName: "Test",
      gender,
      birthDate: "1996-06-21",
      birthLocationId: location.id,
      nationalityCountryId: country.id,
      heightCm: 185,
      weightKg: 82,
    });

    const skills = generateRandomGolferAttributes({
      gender,
      seed: 2000 + index,
    });

    await getGolferStore().create({
      humanId: human.id,
      ...skills,
    });
  }
}

describe("owgr seed config", () => {
  it("loads enabled flag from env", () => {
    expect(
      loadOwgrSeedConfig({
        OWGR_SEED_ON_STARTUP: "true",
      }),
    ).toEqual({
      enabled: true,
    });
  });
});

describe("mergeOwgrSeed", () => {
  beforeEach(async () => {
    resetWorldClockService();
    resetHumanStore();
    resetGolferStore();
    resetGolfWorldRankingStore(new MemoryGolfWorldRankingRepository());
  });

  it("ranks every male golfer 1 through N by overall skill", async () => {
    await seedGolfers(8, 3);

    const result = await mergeOwgrSeed({ enabled: true });

    expect(result).toMatchObject({
      enabled: true,
      maleGolferCount: 8,
      rankingsAdded: 8,
      missingMaleGolfers: false,
    });

    const asOfDate = getWorldClockService()
      .getCurrentOutput()
      .isoUtc.slice(0, 10);
    const rankings = await getGolfWorldRankingStore().listBySystemDate(
      "owgr",
      asOfDate,
    );

    expect(rankings).toHaveLength(8);
    expect(rankings.map((ranking) => ranking.rank)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8,
    ]);
    expect(rankings[0]!.overallSkill).toBeGreaterThanOrEqual(
      rankings[rankings.length - 1]!.overallSkill,
    );

    const golfers = await getGolferStore().list();
    for (const ranking of rankings) {
      const golfer = golfers.find((entry) => entry.id === ranking.golferId);
      expect(golfer?.humanGender).toBe("male");
    }
  });

  it("is idempotent when the snapshot already covers all male golfers", async () => {
    await seedGolfers(6, 2);

    const config = { enabled: true };
    await mergeOwgrSeed(config);
    const second = await mergeOwgrSeed(config);

    expect(second.rankingsAdded).toBe(0);

    const asOfDate = getWorldClockService()
      .getCurrentOutput()
      .isoUtc.slice(0, 10);
    expect(
      await getGolfWorldRankingStore().countBySystemDate("owgr", asOfDate),
    ).toBe(6);
  });

  it("ranks non-members in OWGR separately from PGA membership", async () => {
    const tourRepository = new MemoryGolfTourRepository();
    resetGolfTourMembershipStore(
      new MemoryGolfTourMembershipRepository(),
      tourRepository,
    );

    await tourRepository.create({
      id: "pga-tour-id",
      name: PGA_TOUR_SEED.name,
      abbreviation: PGA_TOUR_SEED.abbreviation,
      logo: "/logos/golf-tours/pga.svg",
    });

    await seedGolfers(10, 0);
    await mergeOwgrSeed({ enabled: true });
    await mergePgaTourMembershipsSeed(
      { enabled: true, memberCount: 5 },
      { tourRepository },
    );

    const asOfDate = getWorldClockService()
      .getCurrentOutput()
      .isoUtc.slice(0, 10);
    const rankings = await getGolfWorldRankingStore().listBySystemDate(
      "owgr",
      asOfDate,
    );
    const seasonYear = new Date(
      getWorldClockService().getCurrentOutput().isoUtc,
    ).getUTCFullYear();
    const memberships = await getGolfTourMembershipStore().listByTourSeason(
      "pga-tour-id",
      seasonYear,
    );
    const memberIds = new Set(memberships.map((membership) => membership.golferId));

    expect(rankings).toHaveLength(10);
    expect(memberships).toHaveLength(5);

    for (const ranking of rankings.slice(0, 5)) {
      expect(memberIds.has(ranking.golferId)).toBe(true);
    }

    const nonMembersInOwgr = rankings.filter(
      (ranking) => !memberIds.has(ranking.golferId),
    );
    expect(nonMembersInOwgr).toHaveLength(5);
    expect(nonMembersInOwgr[0]!.rank).toBe(6);
  });
});
