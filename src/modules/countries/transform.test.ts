import { describe, expect, it, beforeEach } from "vitest";
import {
  CountryErrorCodes,
  CountryStore,
  resetCountryStore,
} from "@/modules/countries";
import { resetLocationStore } from "@/modules/locations";
import { getFlagPublicPath } from "@/persistence/flags/config";
import {
  seedNewYorkLocation,
  seedUnitedStatesCountry,
} from "@/test/world-fixtures";

describe("CountryStore", () => {
  let store: CountryStore;

  beforeEach(() => {
    resetLocationStore();
    store = resetCountryStore();
  });

  it("creates and retrieves a country with a local flag image path", async () => {
    const created = await store.create({
      name: "United States",
      isoCode: "US",
      languages: ["English"],
    });

    expect(created.isoCode).toBe("US");
    expect(created.flag).toBe(getFlagPublicPath("US"));
    expect(created.languages).toEqual(["English"]);
    expect(created.population).toBe(0);

    const fetched = await store.get(created.id);
    expect(fetched.name).toBe("United States");
  });

  it("aggregates population from city locations", async () => {
    const country = await seedUnitedStatesCountry();
    await seedNewYorkLocation(country.id);

    const fetched = await store.get(country.id);
    expect(fetched.population).toBe(8_336_817);
  });

  it("prevents deleting a country that still has locations", async () => {
    const country = await seedUnitedStatesCountry();
    await seedNewYorkLocation(country.id);

    await expect(store.delete(country.id)).rejects.toThrowError(
      expect.objectContaining({ code: CountryErrorCodes.COUNTRY_HAS_LOCATIONS }),
    );
  });
});
