import { getGolfTourLogoPublicPath } from "@/persistence/logos/config";
import {
  MemoryCountryRepository,
  MemoryGolfTournamentRepository,
  MemoryGolfTournamentVenueRepository,
  MemoryGolfTourRepository,
  MemoryLocationRepository,
  MemoryVenueRepository,
  MemoryVenueResourceRepository,
} from "@/persistence/repositories";
import { describe, expect, it } from "vitest";
import { mergePgaTourSeed } from "./pga-tour";
import { PGA_TOURNAMENT_SEED_DATA } from "./pga-tour.data";

describe("PGA Tour seed", () => {
  it("links venues without requiring GOLF_VENUES_SEED_ON_STARTUP", async () => {
    const countryRepository = new MemoryCountryRepository();
    const locationRepository = new MemoryLocationRepository();
    const venueRepository = new MemoryVenueRepository();
    const venueResourceRepository = new MemoryVenueResourceRepository();
    const tourRepository = new MemoryGolfTourRepository();
    const tournamentRepository = new MemoryGolfTournamentRepository();
    const tournamentVenueRepository = new MemoryGolfTournamentVenueRepository();

    const result = await mergePgaTourSeed(
      {
        countryRepository,
        locationRepository,
        venueRepository,
        venueResourceRepository,
        tourRepository,
        tournamentRepository,
        tournamentVenueRepository,
      },
      true,
    );

    expect(result).toMatchObject({
      enabled: true,
      tourAdded: true,
      tournamentsAdded: PGA_TOURNAMENT_SEED_DATA.length,
      tournamentsSkipped: 0,
      tournamentsMissingVenue: 0,
    });
    expect(result.venueLinksAdded).toBeGreaterThan(PGA_TOURNAMENT_SEED_DATA.length);

    const tour = await tourRepository.getByAbbreviation("PGA");
    expect(tour?.logo).toBe(getGolfTourLogoPublicPath("PGA"));
  });

  it("backfills venue links for tournaments created without venues", async () => {
    const countryRepository = new MemoryCountryRepository();
    const locationRepository = new MemoryLocationRepository();
    const venueRepository = new MemoryVenueRepository();
    const venueResourceRepository = new MemoryVenueResourceRepository();
    const tourRepository = new MemoryGolfTourRepository();
    const tournamentRepository = new MemoryGolfTournamentRepository();
    const tournamentVenueRepository = new MemoryGolfTournamentVenueRepository();

    const tour = {
      id: crypto.randomUUID(),
      name: "PGA Tour",
      abbreviation: "PGA",
      logo: "",
    };
    await tourRepository.create(tour);

    for (const entry of PGA_TOURNAMENT_SEED_DATA) {
      await tournamentRepository.create({
        id: crypto.randomUUID(),
        tourId: tour.id,
        slug: entry.slug,
        name: entry.name,
        isMajor: entry.isMajor,
        purseUsd: entry.purseUsd,
        entryCriteria: entry.entryCriteria,
        venueMode: entry.venueMode,
        typicalDurationDays: 4,
        fieldSize: 30,
        seasonStartMonth: entry.seasonStartMonth,
        seasonStartDay: entry.seasonStartDay,
        rotationEpochYear: entry.rotationEpochYear ?? null,
        sortOrder: entry.sortOrder,
      });
    }

    const result = await mergePgaTourSeed(
      {
        countryRepository,
        locationRepository,
        venueRepository,
        venueResourceRepository,
        tourRepository,
        tournamentRepository,
        tournamentVenueRepository,
      },
      true,
    );

    expect(result).toMatchObject({
      tourAdded: false,
      tournamentsAdded: 0,
      tournamentsSkipped: PGA_TOURNAMENT_SEED_DATA.length,
      tournamentsMissingVenue: 0,
    });
    expect(result.venueLinksAdded).toBeGreaterThan(0);

    const updatedTour = await tourRepository.getByAbbreviation("PGA");
    expect(updatedTour?.logo).toBe(getGolfTourLogoPublicPath("PGA"));
  });
});
