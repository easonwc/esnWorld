import { resetCountryStore } from "@/modules/countries";
import {
  HumanErrorCodes,
  computeHumanAge,
  humanDisplayName,
  resetHumanStore,
  HumanStore,
  validateBirthDate,
  validateHeightCm,
  validateWeightKg,
} from "@/modules/humans";
import { resetLocationStore, LocationStore } from "@/modules/locations";
import { seedUnitedStatesCountry } from "@/test/world-fixtures";
import { beforeEach, describe, expect, it } from "vitest";

describe("humans validation", () => {
  it("computes displayName from preferred name", () => {
    expect(
      humanDisplayName({
        givenName: "Eldrick",
        familyName: "Woods",
        preferredName: "Tiger",
      }),
    ).toBe("Tiger Woods");
  });

  it("computes displayName from given name when preferred is null", () => {
    expect(
      humanDisplayName({
        givenName: "Scottie",
        familyName: "Scheffler",
        preferredName: null,
      }),
    ).toBe("Scottie Scheffler");
  });

  it("computes age from birth date", () => {
    expect(computeHumanAge("1996-06-21", "2020-06-21T12:00:00.000Z")).toBe(24);
    expect(computeHumanAge("1996-06-21", "2020-06-20T12:00:00.000Z")).toBe(23);
  });

  it("accepts valid height and weight", () => {
    expect(validateHeightCm(185)).toBe(185);
    expect(validateWeightKg(88.4)).toBe(88.4);
  });

  it("rejects invalid height", () => {
    expect(() => validateHeightCm(120)).toThrowError(
      expect.objectContaining({ code: HumanErrorCodes.INVALID_HEIGHT_CM }),
    );
  });

  it("rejects future birth dates", () => {
    expect(() =>
      validateBirthDate("2099-01-01", "2020-01-01T00:00:00.000Z"),
    ).toThrowError(
      expect.objectContaining({ code: HumanErrorCodes.INVALID_BIRTH_DATE }),
    );
  });
});

describe("HumanStore", () => {
  let humanStore: HumanStore;
  let locationStore: LocationStore;
  let countryId: string;

  beforeEach(async () => {
    resetCountryStore();
    resetLocationStore();
    resetHumanStore();
    humanStore = resetHumanStore();
    locationStore = resetLocationStore();
    countryId = (await seedUnitedStatesCountry()).id;
  });

  it("creates and retrieves a human", async () => {
    const birthLocation = await locationStore.create({
      name: "Dallas",
      countryId,
      region: "Texas",
      latitude: 32.7767,
      longitude: -96.797,
      timezone: "America/Chicago",
      population: 1_300_000,
    });

    const created = await humanStore.create({
      givenName: "Scottie",
      familyName: "Scheffler",
      gender: "male",
      birthDate: "1996-06-21",
      birthLocationId: birthLocation.id,
      nationalityCountryId: countryId,
      heightCm: 185,
      weightKg: 88,
    });

    expect(created.displayName).toBe("Scottie Scheffler");
    expect(created.birthLocationName).toBe("Dallas");
    expect(created.birthLocationRegion).toBe("Texas");
    expect(created.birthLocationCountryName).toBe("United States");
    expect(created.nationalityCountryName).toBe("United States");
    expect(created.heightCm).toBe(185);
    expect(created.weightKg).toBe(88);

    const fetched = await humanStore.get(created.id);
    expect(fetched).toEqual(created);
  });

  it("uses preferred name in displayName", async () => {
    const birthLocation = await locationStore.create({
      name: "Cypress",
      countryId,
      region: "California",
      latitude: 33.8169,
      longitude: -118.037,
      timezone: "America/Los_Angeles",
      population: 49_000,
    });

    const created = await humanStore.create({
      givenName: "Eldrick",
      familyName: "Woods",
      preferredName: "Tiger",
      gender: "male",
      birthDate: "1975-12-30",
      birthLocationId: birthLocation.id,
      nationalityCountryId: countryId,
      heightCm: 185,
      weightKg: 84,
    });

    expect(created.displayName).toBe("Tiger Woods");
  });

  it("lists humans sorted by family name", async () => {
    const birthLocation = await locationStore.create({
      name: "Jupiter",
      countryId,
      region: "Florida",
      latitude: 26.9342,
      longitude: -80.0942,
      timezone: "America/New_York",
      population: 61_000,
    });

    await humanStore.create({
      givenName: "Rory",
      familyName: "McIlroy",
      gender: "male",
      birthDate: "1989-05-04",
      birthLocationId: birthLocation.id,
      nationalityCountryId: countryId,
      heightCm: 175,
      weightKg: 78,
    });

    await humanStore.create({
      givenName: "Scottie",
      familyName: "Scheffler",
      gender: "male",
      birthDate: "1996-06-21",
      birthLocationId: birthLocation.id,
      nationalityCountryId: countryId,
      heightCm: 185,
      weightKg: 88,
    });

    const humans = await humanStore.list();
    expect(humans.map((human) => human.familyName)).toEqual([
      "McIlroy",
      "Scheffler",
    ]);
  });

  it("deletes a human", async () => {
    const birthLocation = await locationStore.create({
      name: "Dallas",
      countryId,
      region: "Texas",
      latitude: 32.7767,
      longitude: -96.797,
      timezone: "America/Chicago",
      population: 1_300_000,
    });

    const created = await humanStore.create({
      givenName: "Jordan",
      familyName: "Spieth",
      gender: "male",
      birthDate: "1993-07-27",
      birthLocationId: birthLocation.id,
      nationalityCountryId: countryId,
      heightCm: 185,
      weightKg: 75,
    });

    await expect(humanStore.delete(created.id)).resolves.toEqual({
      deleted: true,
      id: created.id,
    });

    await expect(humanStore.get(created.id)).rejects.toMatchObject({
      code: HumanErrorCodes.HUMAN_NOT_FOUND,
    });
  });
});
