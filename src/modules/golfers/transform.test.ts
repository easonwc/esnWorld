import { sampleTourPro } from "golf-sim-library/fixtures";
import { getHumanStore, resetHumanStore } from "@/modules/humans";
import { resetCountryStore } from "@/modules/countries";
import {
  GolferErrorCodes,
  GolferStore,
  resetGolferStore,
  toCompleteGolfer,
} from "@/modules/golfers";
import { resetLocationStore, LocationStore } from "@/modules/locations";
import { seedUnitedStatesCountry } from "@/test/world-fixtures";
import { beforeEach, describe, expect, it } from "vitest";

const tourProSkills = {
  putting: sampleTourPro.putting,
  approach: sampleTourPro.approach,
  shortGame: sampleTourPro.shortGame,
  teeShot: sampleTourPro.teeShot!,
  clubs: sampleTourPro.clubs,
};

describe("GolferStore", () => {
  let golferStore: GolferStore;
  let locationStore: LocationStore;
  let countryId: string;

  beforeEach(async () => {
    resetCountryStore();
    resetLocationStore();
    resetHumanStore();
    resetGolferStore();
    golferStore = resetGolferStore();
    locationStore = resetLocationStore();
    countryId = (await seedUnitedStatesCountry()).id;
  });

  async function createHuman(givenName: string, familyName: string) {
    const birthLocation = await locationStore.create({
      name: "Dallas",
      countryId,
      region: "Texas",
      latitude: 32.7767,
      longitude: -96.797,
      timezone: "America/Chicago",
      population: 1_300_000,
    });

    return getHumanStore().create({
      givenName,
      familyName,
      gender: "male",
      birthDate: "1996-06-21",
      birthLocationId: birthLocation.id,
      nationalityCountryId: countryId,
      heightCm: 185,
      weightKg: 88,
    });
  }

  it("creates and retrieves a golfer profile", async () => {
    const human = await createHuman("Scottie", "Scheffler");

    const created = await golferStore.create({
      humanId: human.id,
      turnedProYear: 2015,
      ...tourProSkills,
    });

    expect(created.humanId).toBe(human.id);
    expect(created.humanDisplayName).toBe("Scottie Scheffler");
    expect(created.putting.putting).toBe(88);
    expect(created.clubs.driver).toBe(92);

    const fetched = await golferStore.get(created.id);
    expect(fetched).toEqual(created);

    const byHuman = await golferStore.getByHumanId(human.id);
    expect(byHuman).toEqual(created);
  });

  it("builds a complete golfer for simulation", async () => {
    const human = await createHuman("Scottie", "Scheffler");
    const golfer = await golferStore.create({
      humanId: human.id,
      ...tourProSkills,
    });

    const complete = toCompleteGolfer(human, golfer);
    expect(complete.id).toBe(human.id);
    expect(complete.name).toBe("Scottie Scheffler");
    expect(complete.gender).toBe("male");
    expect(complete.teeShot?.distance).toBe(90);
  });

  it("rejects duplicate golfer profiles for the same human", async () => {
    const human = await createHuman("Jordan", "Spieth");

    await golferStore.create({
      humanId: human.id,
      ...tourProSkills,
    });

    await expect(
      golferStore.create({
        humanId: human.id,
        ...tourProSkills,
      }),
    ).rejects.toMatchObject({
      code: GolferErrorCodes.GOLFER_ALREADY_EXISTS,
    });
  });

  it("rejects invalid skill ratings", async () => {
    const human = await createHuman("Bad", "Skills");

    await expect(
      golferStore.create({
        humanId: human.id,
        ...tourProSkills,
        putting: { ...tourProSkills.putting, putting: 150 },
      }),
    ).rejects.toMatchObject({
      code: GolferErrorCodes.INVALID_SKILLS,
    });
  });

  it("deletes a golfer profile", async () => {
    const human = await createHuman("Justin", "Thomas");
    const created = await golferStore.create({
      humanId: human.id,
      ...tourProSkills,
    });

    await expect(golferStore.delete(created.id)).resolves.toEqual({
      deleted: true,
      id: created.id,
    });

    await expect(golferStore.get(created.id)).rejects.toMatchObject({
      code: GolferErrorCodes.GOLFER_NOT_FOUND,
    });
  });
});
