import { generateRandomGolferAttributes } from "golf-sim-library";
import { shouldSkipTournamentWithoutPriorWinners } from "@/modules/golf/scheduling";
import type { GolfTournament } from "@/modules/golf/types";
import { getGolferStore, resetGolferStore } from "@/modules/golfers";
import {
  getGolfTourWinStore,
  priorSeasonYearForExemptions,
  resetGolfTourWinStore,
} from "@/modules/golf-tour-wins";
import { resetHumanStore } from "@/modules/humans";
import { resetLocationStore } from "@/modules/locations";
import { resetWorldClockService } from "@/modules/world-clock";
import { MemoryGolfTourRepository } from "@/persistence/repositories/memory/golf.memory";
import { MemoryGolfTourWinRepository } from "@/persistence/repositories/memory/golf-tour-win.memory";
import { PGA_TOUR_SEED } from "@/persistence/seed/pga-tour.data";
import { seedUnitedStatesCountry } from "@/test/world-fixtures";
import { beforeEach, describe, expect, it } from "vitest";

const SENTRY_TOURNAMENT: GolfTournament = {
  id: "sentry-id",
  tourId: "pga-tour-id",
  slug: "sentry-tournament-of-champions",
  name: "Sentry Tournament of Champions",
  isMajor: false,
  purseUsd: 20_000_000,
  entryCriteria: {
    kind: "exemptions",
    description: "Prior-year PGA Tour winners",
    exemptionCodes: ["prior_winner"],
  },
  venueMode: "fixed",
  typicalDurationDays: 4,
  teeGroupCount: 1,
  fieldSize: 156,
  seasonStartMonth: 1,
  seasonStartDay: 2,
  rotationEpochYear: null,
  sortOrder: 1,
  materializeOnSchedule: true,
  scheduleReference: null,
};

async function seedMaleGolfer() {
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

  const human = await resetHumanStore().create({
    givenName: "Winner",
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
    seed: 4000,
  });

  return getGolferStore().create({
    humanId: human.id,
    ...skills,
  });
}

describe("golf tour wins", () => {
  let tourRepository: MemoryGolfTourRepository;

  beforeEach(async () => {
    resetWorldClockService();
    resetHumanStore();
    resetGolferStore();
    tourRepository = new MemoryGolfTourRepository();
    resetGolfTourWinStore(new MemoryGolfTourWinRepository(), tourRepository);
    await tourRepository.create({
      id: "pga-tour-id",
      name: PGA_TOUR_SEED.name,
      abbreviation: PGA_TOUR_SEED.abbreviation,
      logo: "/logos/golf-tours/pga.svg",
    });
  });

  it("records a tour win for a golfer", async () => {
    const golfer = await seedMaleGolfer();

    const win = await getGolfTourWinStore().create({
      golferId: golfer.id,
      tourId: "pga-tour-id",
      seasonYear: 2020,
      tournamentId: null,
    });

    expect(win).toMatchObject({
      golferId: golfer.id,
      tourId: "pga-tour-id",
      seasonYear: 2020,
    });
  });

  it("lists distinct prior-season winners for exemption checks", async () => {
    const golfer = await seedMaleGolfer();

    await getGolfTourWinStore().create({
      golferId: golfer.id,
      tourId: "pga-tour-id",
      seasonYear: 2020,
      tournamentId: null,
    });

    expect(
      await getGolfTourWinStore().countPriorSeasonWinners("pga-tour-id", 2021),
    ).toBe(1);
  });
});

describe("shouldSkipTournamentWithoutPriorWinners", () => {
  let tourRepository: MemoryGolfTourRepository;

  beforeEach(async () => {
    resetWorldClockService();
    resetHumanStore();
    resetGolferStore();
    tourRepository = new MemoryGolfTourRepository();
    resetGolfTourWinStore(new MemoryGolfTourWinRepository(), tourRepository);
    await tourRepository.create({
      id: "pga-tour-id",
      name: PGA_TOUR_SEED.name,
      abbreviation: PGA_TOUR_SEED.abbreviation,
      logo: "/logos/golf-tours/pga.svg",
    });
  });

  it("skips Sentry when there are no prior-season wins", async () => {
    await expect(
      shouldSkipTournamentWithoutPriorWinners(
        SENTRY_TOURNAMENT,
        "pga-tour-id",
        2020,
      ),
    ).resolves.toBe(true);
  });

  it("schedules Sentry once real prior-season wins exist", async () => {
    const golfer = await seedMaleGolfer();
    await getGolfTourWinStore().create({
      golferId: golfer.id,
      tourId: "pga-tour-id",
      seasonYear: priorSeasonYearForExemptions(2021),
      tournamentId: null,
    });

    await expect(
      shouldSkipTournamentWithoutPriorWinners(
        SENTRY_TOURNAMENT,
        "pga-tour-id",
        2021,
      ),
    ).resolves.toBe(false);
  });
});
