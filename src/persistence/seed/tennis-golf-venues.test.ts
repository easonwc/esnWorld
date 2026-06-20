import {
  numberedCourts,
  numberedTeeGroups,
} from "./multi-resource-venue-types";
import { TENNIS_VENUE_SEED_DATA } from "./tennis-venues.data";
import { GOLF_VENUE_SEED_DATA } from "./golf-venues.data";
import { DEFAULT_GOLF_VENUE_TEE_GROUP_COUNT } from "./golf-venue-types";
import {
  MemoryCountryRepository,
  MemoryLocationRepository,
  MemoryVenueRepository,
  MemoryVenueResourceRepository,
} from "@/persistence/repositories";
import { describe, expect, it } from "vitest";
import { mergeCountrySeed } from "./countries";
import { mergeGolfVenueSeed } from "./golf-venues";
import { mergeLocationSeed } from "./locations";
import { LOCATION_SEED_DATA } from "./locations.data";
import { resourcesForTennisVenue } from "./tennis-venue-types";
import { mergeTennisVenueSeed } from "./tennis-venues";

describe("tennis venue seed", () => {
  it("defines the professional tennis catalog", () => {
    expect(TENNIS_VENUE_SEED_DATA).toHaveLength(33);
  });

  it("builds full numbered court resources", () => {
    expect(numberedCourts(22)).toHaveLength(22);
    expect(numberedCourts(22)[0]).toEqual({
      name: "Court 1",
      resourceType: "court",
    });
  });

  it("merges multi_resource venues and resources after location seed", async () => {
    const countryRepository = new MemoryCountryRepository();
    const locationRepository = new MemoryLocationRepository();
    const venueRepository = new MemoryVenueRepository();
    const venueResourceRepository = new MemoryVenueResourceRepository();

    await mergeCountrySeed(countryRepository);
    await mergeLocationSeed(
      locationRepository,
      countryRepository,
      LOCATION_SEED_DATA,
    );

    const result = await mergeTennisVenueSeed(
      {
        locationRepository,
        venueRepository,
        venueResourceRepository,
      },
      true,
    );

    expect(result).toMatchObject({
      enabled: true,
      venuesAdded: 33,
      venuesSkipped: 0,
      venuesMissingLocation: 0,
      total: 33,
    });
    expect(result.resourcesAdded).toBeGreaterThan(300);

    const venues = await venueRepository.list();
    expect(venues).toHaveLength(33);
    expect(venues.every((venue) => venue.schedulingMode === "multi_resource")).toBe(
      true,
    );

    const usOpen = venues.find(
      (venue) => venue.name === "USTA Billie Jean King National Tennis Center",
    )!;
    const usOpenCourts = await venueResourceRepository.listByVenue(usOpen.id);
    expect(usOpenCourts).toHaveLength(22);
    expect(new Set(usOpenCourts.map((court) => court.name))).toEqual(
      new Set(numberedCourts(22).map((court) => court.name)),
    );

    const usOpenSeed = TENNIS_VENUE_SEED_DATA.find(
      (entry) =>
        entry.venueName === "USTA Billie Jean King National Tennis Center",
    )!;
    expect(resourcesForTennisVenue(usOpenSeed)).toHaveLength(22);
  });
});

describe("golf venue seed", () => {
  it("defines the professional golf catalog", () => {
    expect(GOLF_VENUE_SEED_DATA).toHaveLength(59);
    expect(numberedTeeGroups(DEFAULT_GOLF_VENUE_TEE_GROUP_COUNT)).toHaveLength(
      DEFAULT_GOLF_VENUE_TEE_GROUP_COUNT,
    );
    expect(
      numberedTeeGroups(DEFAULT_GOLF_VENUE_TEE_GROUP_COUNT)[
        DEFAULT_GOLF_VENUE_TEE_GROUP_COUNT - 1
      ],
    ).toEqual({
      name: `Tee Group ${DEFAULT_GOLF_VENUE_TEE_GROUP_COUNT}`,
      resourceType: "tee_group",
    });
  });

  it("merges multi_resource venues and resources after location seed", async () => {
    const countryRepository = new MemoryCountryRepository();
    const locationRepository = new MemoryLocationRepository();
    const venueRepository = new MemoryVenueRepository();
    const venueResourceRepository = new MemoryVenueResourceRepository();

    await mergeCountrySeed(countryRepository);
    await mergeLocationSeed(
      locationRepository,
      countryRepository,
      LOCATION_SEED_DATA,
    );

    const result = await mergeGolfVenueSeed(
      {
        locationRepository,
        venueRepository,
        venueResourceRepository,
      },
      true,
    );

    expect(result).toMatchObject({
      enabled: true,
      venuesAdded: 59,
      venuesSkipped: 0,
      venuesMissingLocation: 0,
      total: 59,
    });
    expect(result.resourcesAdded).toBeGreaterThan(3_000);
    expect(await venueRepository.count()).toBe(59);
  });

  it("is idempotent on a second merge", async () => {
    const repositories = {
      locationRepository: new MemoryLocationRepository(),
      venueRepository: new MemoryVenueRepository(),
      venueResourceRepository: new MemoryVenueResourceRepository(),
    };
    const countryRepository = new MemoryCountryRepository();

    await mergeCountrySeed(countryRepository);
    await mergeLocationSeed(
      repositories.locationRepository,
      countryRepository,
      LOCATION_SEED_DATA,
    );

    await mergeGolfVenueSeed(repositories, true);
    const second = await mergeGolfVenueSeed(repositories, true);

    expect(second).toMatchObject({
      venuesAdded: 0,
      venuesSkipped: 59,
      venuesMissingLocation: 0,
      resourcesAdded: 0,
    });
    expect(second.resourcesSkipped).toBeGreaterThan(3_000);
    expect(await repositories.venueRepository.count()).toBe(59);
  });
});
