import { sampleTourPro } from "tennis-sim-library/fixtures";
import { getHumanStore, resetHumanStore } from "@/modules/humans";
import { resetCountryStore } from "@/modules/countries";
import {
  TennisPlayerErrorCodes,
  TennisPlayerStore,
  resetTennisPlayerStore,
  toCompletePlayer,
} from "@/modules/tennis-players";
import { resetLocationStore, LocationStore } from "@/modules/locations";
import { seedUnitedStatesCountry } from "@/test/world-fixtures";
import { beforeEach, describe, expect, it } from "vitest";

const tourProSkills = {
  serve: sampleTourPro.serve,
  return: sampleTourPro.return,
  baseline: sampleTourPro.baseline,
  net: sampleTourPro.net,
  surfacePreference: sampleTourPro.surfacePreference,
};

describe("TennisPlayerStore", () => {
  let tennisPlayerStore: TennisPlayerStore;
  let locationStore: LocationStore;
  let countryId: string;

  beforeEach(async () => {
    resetCountryStore();
    resetLocationStore();
    resetHumanStore();
    resetTennisPlayerStore();
    tennisPlayerStore = resetTennisPlayerStore();
    locationStore = resetLocationStore();
    countryId = (await seedUnitedStatesCountry()).id;
  });

  async function createHuman(givenName: string, familyName: string) {
    const birthLocation = await locationStore.create({
      name: "Manacor",
      countryId,
      region: "Florida",
      latitude: 28.0836,
      longitude: -80.6081,
      timezone: "America/New_York",
      population: 100_000,
    });

    return getHumanStore().create({
      givenName,
      familyName,
      gender: "male",
      birthDate: "1986-06-03",
      birthLocationId: birthLocation.id,
      nationalityCountryId: countryId,
      heightCm: 185,
      weightKg: 85,
    });
  }

  it("creates and retrieves a tennis player profile", async () => {
    const human = await createHuman("Novak", "Djokovic");

    const created = await tennisPlayerStore.create({
      humanId: human.id,
      backhandStyle: "two_handed",
      turnedProYear: 2003,
      ...tourProSkills,
    });

    expect(created.humanId).toBe(human.id);
    expect(created.humanDisplayName).toBe("Novak Djokovic");
    expect(created.serve.serve).toBe(92);
    expect(created.surfacePreference?.clay).toBe(72);

    const fetched = await tennisPlayerStore.get(created.id);
    expect(fetched).toEqual(created);

    const byHuman = await tennisPlayerStore.getByHumanId(human.id);
    expect(byHuman).toEqual(created);
  });

  it("builds a complete player for simulation", async () => {
    const human = await createHuman("Carlos", "Alcaraz");
    const player = await tennisPlayerStore.create({
      humanId: human.id,
      ...tourProSkills,
    });

    const complete = toCompletePlayer(human, player);
    expect(complete.id).toBe(human.id);
    expect(complete.name).toBe("Carlos Alcaraz");
    expect(complete.gender).toBe("male");
    expect(complete.baseline.forehand).toBe(93);
  });

  it("rejects duplicate profiles for the same human", async () => {
    const human = await createHuman("Rafael", "Nadal");

    await tennisPlayerStore.create({
      humanId: human.id,
      ...tourProSkills,
    });

    await expect(
      tennisPlayerStore.create({
        humanId: human.id,
        ...tourProSkills,
      }),
    ).rejects.toMatchObject({
      code: TennisPlayerErrorCodes.TENNIS_PLAYER_ALREADY_EXISTS,
    });
  });

  it("rejects invalid skill ratings", async () => {
    const human = await createHuman("Bad", "Skills");

    await expect(
      tennisPlayerStore.create({
        humanId: human.id,
        ...tourProSkills,
        serve: { ...tourProSkills.serve, serve: 150 },
      }),
    ).rejects.toMatchObject({
      code: TennisPlayerErrorCodes.INVALID_SKILLS,
    });
  });

  it("deletes a tennis player profile", async () => {
    const human = await createHuman("Roger", "Federer");
    const created = await tennisPlayerStore.create({
      humanId: human.id,
      backhandStyle: "one_handed",
      ...tourProSkills,
    });

    await expect(tennisPlayerStore.delete(created.id)).resolves.toEqual({
      deleted: true,
      id: created.id,
    });

    await expect(tennisPlayerStore.get(created.id)).rejects.toMatchObject({
      code: TennisPlayerErrorCodes.TENNIS_PLAYER_NOT_FOUND,
    });
  });
});
