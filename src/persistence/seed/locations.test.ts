import { buildCollege } from "@/modules/colleges/transform";
import { buildLocation } from "@/modules/locations/transform";
import {
  MemoryCollegeRepository,
  MemoryCountryRepository,
  MemoryLocationRepository,
} from "@/persistence/repositories";
import { describe, expect, it } from "vitest";
import { mergeCollegeSeed, resolveCollegeSeedLocation } from "./colleges";
import { COLLEGE_SEED_DATA } from "./colleges.data";
import { countryMergeKey, mergeCountrySeed } from "./countries";
import { COUNTRY_SEED_DATA } from "./countries.data";
import { getFlagPublicPath } from "@/persistence/flags/config";
import { locationMergeKey, mergeLocationSeed } from "./locations";
import { LOCATION_SEED_DATA } from "./locations.data";
import { NCAA_LOCATION_SEED_DATA } from "./ncaa-locations.data";
import { TENNIS_GOLF_LOCATION_SEED_DATA } from "./tennis-golf-locations.data";

describe("country seed", () => {
  it("includes 200 countries", () => {
    expect(COUNTRY_SEED_DATA.length).toBe(200);
  });

  it("covers every country referenced by the city seed catalog", () => {
    const countryNames = new Set(
      COUNTRY_SEED_DATA.map((country) => country.name.toLowerCase()),
    );

    for (const entry of LOCATION_SEED_DATA) {
      expect(countryNames.has(entry.countryName.toLowerCase())).toBe(true);
    }
  });

  it("uses a stable merge key from country name", () => {
    expect(countryMergeKey("United States")).toBe("united states");
    expect(countryMergeKey(" Japan ")).toBe("japan");
  });

  it("links countries to local flag image paths", () => {
    expect(getFlagPublicPath("US")).toBe("/flags/us.svg");
    expect(getFlagPublicPath("jp")).toBe("/flags/jp.svg");
  });

  it("merges only new countries", async () => {
    const repository = new MemoryCountryRepository();
    const sample = COUNTRY_SEED_DATA.slice(0, 2);

    const first = await mergeCountrySeed(repository, sample);
    const second = await mergeCountrySeed(repository, sample);

    expect(first).toEqual({ enabled: true, added: 2, skipped: 0, total: 2 });
    expect(second).toEqual({ enabled: true, added: 0, skipped: 2, total: 2 });
  });
});

describe("location seed", () => {
  it("includes NCAA campus cities for FBS and FCS programs", () => {
    expect(NCAA_LOCATION_SEED_DATA.length).toBe(209);
    expect(TENNIS_GOLF_LOCATION_SEED_DATA.length).toBe(47);
    expect(COLLEGE_SEED_DATA.length).toBe(225);
    expect(LOCATION_SEED_DATA.length).toBe(419);
  });

  it("uses a stable merge key from city name, region, and country name", () => {
    expect(locationMergeKey("New York", "United States", "New York")).toBe(
      "new york|new york|united states",
    );
    expect(locationMergeKey("Columbia", "United States", "Missouri")).toBe(
      "columbia|missouri|united states",
    );
  });

  it("inserts seed cities after their countries exist", async () => {
    const countryRepository = new MemoryCountryRepository();
    const locationRepository = new MemoryLocationRepository();
    const countries = COUNTRY_SEED_DATA.slice(0, 1);
    const locations = LOCATION_SEED_DATA.filter(
      (entry) => entry.countryName === countries[0].name,
    ).slice(0, 2);

    await mergeCountrySeed(countryRepository, countries);
    const result = await mergeLocationSeed(
      locationRepository,
      countryRepository,
      locations,
    );

    expect(result.added).toBe(locations.length);
    expect(await locationRepository.list()).toHaveLength(locations.length);
  });

  it("merges only new cities when some already exist", async () => {
    const countryRepository = new MemoryCountryRepository();
    const locationRepository = new MemoryLocationRepository();
    const [countryEntry] = COUNTRY_SEED_DATA.filter((c) => c.name === "Japan");
    const cityEntries = LOCATION_SEED_DATA.filter(
      (entry) => entry.countryName === "Japan",
    ).slice(0, 2);

    await mergeCountrySeed(countryRepository, [countryEntry]);
    const [firstCity] = cityEntries;
    const country = await countryRepository.getByName("Japan");
    expect(country).toBeTruthy();

    await locationRepository.create(
      buildLocation(
        {
          name: firstCity.name,
          countryId: country!.id,
          region: firstCity.region ?? null,
          latitude: firstCity.latitude,
          longitude: firstCity.longitude,
          timezone: firstCity.timezone,
          population: firstCity.population,
        },
        "existing-id",
        country!.name,
      ),
    );

    const result = await mergeLocationSeed(
      locationRepository,
      countryRepository,
      cityEntries,
    );

    expect(result).toEqual({
      enabled: true,
      added: 1,
      skipped: 1,
      total: 2,
    });
  });

  it("validates every catalog city through buildLocation", async () => {
    const countryRepository = new MemoryCountryRepository();
    await mergeCountrySeed(countryRepository);

    for (const entry of LOCATION_SEED_DATA) {
      const country = await countryRepository.getByName(entry.countryName);
      expect(country).toBeTruthy();

      const location = buildLocation(
        {
          name: entry.name,
          countryId: country!.id,
          region: entry.region ?? null,
          latitude: entry.latitude,
          longitude: entry.longitude,
          timezone: entry.timezone,
          population: entry.population,
        },
        "seed-test-id",
        country!.name,
      );

      expect(location.countryName).toBe(entry.countryName);
    }
  });

  it("validates every NCAA campus city through buildLocation", async () => {
    const countryRepository = new MemoryCountryRepository();
    await mergeCountrySeed(countryRepository);

    for (const entry of NCAA_LOCATION_SEED_DATA) {
      const country = await countryRepository.getByName(entry.countryName);
      expect(country).toBeTruthy();

      buildLocation(
        {
          name: entry.name,
          countryId: country!.id,
          region: entry.region ?? null,
          latitude: entry.latitude,
          longitude: entry.longitude,
          timezone: entry.timezone,
          population: entry.population,
        },
        "ncaa-seed-test-id",
        country!.name,
      );
    }
  });

  it("validates every tennis and golf host city through buildLocation", async () => {
    const countryRepository = new MemoryCountryRepository();
    await mergeCountrySeed(countryRepository);

    for (const entry of TENNIS_GOLF_LOCATION_SEED_DATA) {
      const country = await countryRepository.getByName(entry.countryName);
      expect(country).toBeTruthy();

      buildLocation(
        {
          name: entry.name,
          countryId: country!.id,
          region: entry.region ?? null,
          latitude: entry.latitude,
          longitude: entry.longitude,
          timezone: entry.timezone,
          population: entry.population,
        },
        "tennis-golf-seed-test-id",
        country!.name,
      );
    }
  });

  it("merges colleges after their locations exist", async () => {
    const countryRepository = new MemoryCountryRepository();
    const locationRepository = new MemoryLocationRepository();
    const collegeRepository = new MemoryCollegeRepository();
    const sample = COLLEGE_SEED_DATA.slice(0, 2);

    await mergeCountrySeed(countryRepository);
    await mergeLocationSeed(locationRepository, countryRepository);
    const result = await mergeCollegeSeed(
      collegeRepository,
      locationRepository,
      sample,
    );

    expect(result.added).toBe(sample.length);
    expect(await collegeRepository.list()).toHaveLength(sample.length);
  });

  it("validates every college seed entry through buildCollege", async () => {
    const countryRepository = new MemoryCountryRepository();
    const locationRepository = new MemoryLocationRepository();

    await mergeCountrySeed(countryRepository);
    await mergeLocationSeed(locationRepository, countryRepository);
    const locations = await locationRepository.list();
    const locationByKey = new Map(
      locations.map((location) => [
        locationMergeKey(location.name, location.countryName, location.region),
        location,
      ]),
    );

    for (const entry of COLLEGE_SEED_DATA) {
      const location = resolveCollegeSeedLocation(
        entry.locationName,
        entry.countryName,
        entry.locationRegion,
        locationByKey,
      );
      expect(location).toBeTruthy();

      buildCollege(
        {
          name: entry.name,
          locationId: location!.id,
          attendance: entry.attendance,
        },
        "college-seed-test-id",
        location!.name,
        location!.region,
      );
    }
  });
});
