import { generateRandomGolferAttributes } from "golf-sim-library";
import { getGolferStore, resetGolferStore } from "@/modules/golfers";
import {
  getGolfTourMembershipStore,
  resetGolfTourMembershipStore,
} from "@/modules/golf-tour-memberships";
import { resetHumanStore } from "@/modules/humans";
import { resetLocationStore } from "@/modules/locations";
import { resetWorldClockService, getWorldClockService } from "@/modules/world-clock";
import { MemoryGolfTourRepository } from "@/persistence/repositories/memory/golf.memory";
import { MemoryGolfTourMembershipRepository } from "@/persistence/repositories/memory/golf-tour-membership.memory";
import { seedUnitedStatesCountry } from "@/test/world-fixtures";
import { beforeEach, describe, expect, it } from "vitest";
import { loadPgaMembershipSeedConfig } from "./pga-membership-config";
import { mergePgaTourMembershipsSeed } from "./pga-tour-memberships";
import { PGA_TOUR_SEED } from "./pga-tour.data";

async function seedMaleGolfers(count: number) {
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

  for (let index = 0; index < count; index += 1) {
    const human = await resetHumanStore().create({
      givenName: `Golfer${index}`,
      familyName: "Test",
      gender: "male",
      birthDate: "1996-06-21",
      birthLocationId: location.id,
      nationalityCountryId: country.id,
      heightCm: 185,
      weightKg: 82,
    });

    const skills = generateRandomGolferAttributes({
      gender: "male",
      seed: 1000 + index,
    });

    await getGolferStore().create({
      humanId: human.id,
      ...skills,
    });
  }
}

describe("pga membership seed config", () => {
  it("loads membership count from env", () => {
    expect(
      loadPgaMembershipSeedConfig({
        PGA_MEMBERSHIP_SEED_ON_STARTUP: "true",
        PGA_MEMBERSHIP_COUNT: "175",
      }),
    ).toEqual({
      enabled: true,
      memberCount: 175,
    });
  });
});

describe("mergePgaTourMembershipsSeed", () => {
  let tourRepository: MemoryGolfTourRepository;

  beforeEach(async () => {
    resetWorldClockService();
    resetHumanStore();
    resetGolferStore();
    tourRepository = new MemoryGolfTourRepository();
    resetGolfTourMembershipStore(
      new MemoryGolfTourMembershipRepository(),
      tourRepository,
    );
  });

  it("assigns PGA membership to the highest-skill male golfers", async () => {
    const tour = await tourRepository.create({
      id: "pga-tour-id",
      name: PGA_TOUR_SEED.name,
      abbreviation: PGA_TOUR_SEED.abbreviation,
      logo: "/logos/golf-tours/pga.svg",
    });

    await seedMaleGolfers(10);

    const result = await mergePgaTourMembershipsSeed(
      {
        enabled: true,
        memberCount: 5,
      },
      { tourRepository },
    );

    expect(result).toMatchObject({
      enabled: true,
      targetMemberCount: 5,
      membershipsAdded: 5,
      missingTour: false,
      missingMaleGolfers: false,
    });

    const seasonYear = new Date(
      getWorldClockService().getCurrentOutput().isoUtc,
    ).getUTCFullYear();

    const memberships = await getGolfTourMembershipStore().listByTourSeason(
      tour.id,
      seasonYear,
    );
    expect(memberships).toHaveLength(5);
    expect(memberships[0]!.overallSkill).toBeGreaterThanOrEqual(
      memberships[memberships.length - 1]!.overallSkill,
    );

    const golfers = await getGolferStore().list();
    const memberIds = new Set(memberships.map((membership) => membership.golferId));
    for (const golfer of golfers.filter((entry) => memberIds.has(entry.id))) {
      expect(golfer.humanGender).toBe("male");
    }
  });

  it("is idempotent when the target count is already met", async () => {
    await tourRepository.create({
      id: "pga-tour-id",
      name: PGA_TOUR_SEED.name,
      abbreviation: PGA_TOUR_SEED.abbreviation,
      logo: "/logos/golf-tours/pga.svg",
    });

    await seedMaleGolfers(8);

    const config = { enabled: true, memberCount: 4 };
    await mergePgaTourMembershipsSeed(config, { tourRepository });
    const second = await mergePgaTourMembershipsSeed(config, { tourRepository });

    expect(second.membershipsAdded).toBe(0);
    const seasonYear = new Date(
      getWorldClockService().getCurrentOutput().isoUtc,
    ).getUTCFullYear();
    expect(
      await getGolfTourMembershipStore().countByTourSeason(
        "pga-tour-id",
        seasonYear,
      ),
    ).toBe(4);
  });
});
