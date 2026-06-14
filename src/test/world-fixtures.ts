import { getCountryStore, resetCountryStore } from "@/modules/countries";
import { getLocationStore, resetLocationStore } from "@/modules/locations";
import { resetVenueStore } from "@/modules/venues";

export async function seedUnitedStatesCountry() {
  return getCountryStore().create({
    name: "United States",
    isoCode: "US",
    languages: ["English"],
  });
}

export async function seedNewYorkLocation(countryId: string) {
  return getLocationStore().create({
    name: "New York",
    countryId,
    latitude: 40.7128,
    longitude: -74.006,
    timezone: "America/New_York",
    population: 8_336_817,
  });
}

export async function resetWorldFixtures() {
  resetVenueStore();
  resetLocationStore();
  resetCountryStore();
}

export async function seedUnitedStatesWithNewYork() {
  await resetWorldFixtures();
  const country = await seedUnitedStatesCountry();
  const location = await seedNewYorkLocation(country.id);
  return { country, location };
}
