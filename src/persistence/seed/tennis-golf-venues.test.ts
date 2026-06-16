import {
  MemoryCountryRepository,
  MemoryLocationRepository,
  MemoryVenueRepository,
  MemoryVenueResourceRepository,
} from "@/persistence/repositories";
import { describe, expect, it } from "vitest";
import { mergeCountrySeed } from "./countries";
import { mergeLocationSeed } from "./locations";
import { LOCATION_SEED_DATA } from "./locations.data";
import {
  numberedCourts,
  numberedTeeGroups,
  resourcesForVenueEntry,
} from "./tennis-golf-venue-types";
import { TENNIS_GOLF_VENUE_SEED_DATA } from "./tennis-golf-venues.data";
import { mergeTennisGolfVenueSeed } from "./tennis-golf-venues";

describe("tennis/golf venue seed", () => {
  it("defines the full Option B catalog", () => {
    const tennisVenues = TENNIS_GOLF_VENUE_SEED_DATA.filter(
      (entry) => entry.kind === "tennis",
    );
    const golfVenues = TENNIS_GOLF_VENUE_SEED_DATA.filter(
      (entry) => entry.kind === "golf",
    );

    expect(tennisVenues).toHaveLength(33);
    expect(golfVenues).toHaveLength(26);
    expect(TENNIS_GOLF_VENUE_SEED_DATA).toHaveLength(59);
  });

  it("builds full numbered court and tee group resources", () => {
    expect(numberedCourts(22)).toHaveLength(22);
    expect(numberedCourts(22)[0]).toEqual({
      name: "Court 1",
      resourceType: "court",
    });
    expect(numberedCourts(22)[21]).toEqual({
      name: "Court 22",
      resourceType: "court",
    });

    expect(numberedTeeGroups(30)).toHaveLength(30);
    expect(numberedTeeGroups(30)[29]).toEqual({
      name: "Tee Group 30",
      resourceType: "tee_group",
    });

    const usOpen = TENNIS_GOLF_VENUE_SEED_DATA.find(
      (entry) =>
        entry.kind === "tennis" &&
        entry.venueName === "USTA Billie Jean King National Tennis Center",
    )!;
    expect(resourcesForVenueEntry(usOpen)).toHaveLength(22);
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

    const result = await mergeTennisGolfVenueSeed(
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
    expect(result.resourcesAdded).toBeGreaterThan(1_000);

    const venues = await venueRepository.list();
    expect(venues).toHaveLength(59);
    expect(venues.every((venue) => venue.schedulingMode === "multi_resource")).toBe(
      true,
    );
    expect(venues.every((venue) => venue.isIndoor === false)).toBe(true);

    const usOpen = venues.find(
      (venue) => venue.name === "USTA Billie Jean King National Tennis Center",
    )!;
    const usOpenCourts = await venueResourceRepository.listByVenue(usOpen.id);
    expect(usOpenCourts).toHaveLength(22);
    expect(new Set(usOpenCourts.map((court) => court.name))).toEqual(
      new Set(numberedCourts(22).map((court) => court.name)),
    );

    const augusta = venues.find(
      (venue) => venue.name === "Augusta National Golf Club",
    )!;
    const augustaGroups = await venueResourceRepository.listByVenue(augusta.id);
    expect(augustaGroups).toHaveLength(30);
    expect(augustaGroups[0].resourceType).toBe("tee_group");
  });

  it("is idempotent on a second merge", async () => {
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

    const repositories = {
      locationRepository,
      venueRepository,
      venueResourceRepository,
    };

    await mergeTennisGolfVenueSeed(repositories, true);
    const second = await mergeTennisGolfVenueSeed(repositories, true);

    expect(second).toMatchObject({
      venuesAdded: 0,
      venuesSkipped: 59,
      resourcesAdded: 0,
      venuesMissingLocation: 0,
    });
    expect(second.resourcesSkipped).toBeGreaterThan(1_000);
    expect(await venueRepository.count()).toBe(59);
  });

  it("skips venues when host cities are missing", async () => {
    const locationRepository = new MemoryLocationRepository();
    const venueRepository = new MemoryVenueRepository();
    const venueResourceRepository = new MemoryVenueResourceRepository();

    const result = await mergeTennisGolfVenueSeed(
      {
        locationRepository,
        venueRepository,
        venueResourceRepository,
      },
      true,
    );

    expect(result).toMatchObject({
      enabled: true,
      venuesAdded: 0,
      venuesMissingLocation: 59,
      resourcesAdded: 0,
    });
  });
});
