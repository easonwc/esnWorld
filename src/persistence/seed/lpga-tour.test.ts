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
import { mergeCountrySeed } from "./countries";
import { mergeLocationSeed } from "./locations";
import { LOCATION_SEED_DATA } from "./locations.data";
import { mergeLpgaTourSeed } from "./lpga-tour";
import {
  DEFAULT_LPGA_FIELD_SIZE,
  DEFAULT_LPGA_TEE_GROUP_COUNT,
  LPGA_TOURNAMENT_SEED_DATA,
} from "./lpga-tour.data";
import { getGolfTourLogoPublicPath } from "@/persistence/logos/config";

describe("LPGA Tour seed", () => {
  it("links venues without requiring GOLF_VENUES_SEED_ON_STARTUP", async () => {
    const countryRepository = new MemoryCountryRepository();
    const locationRepository = new MemoryLocationRepository();
    const venueRepository = new MemoryVenueRepository();
    const venueResourceRepository = new MemoryVenueResourceRepository();
    const tourRepository = new MemoryGolfTourRepository();
    const tournamentRepository = new MemoryGolfTournamentRepository();
    const tournamentVenueRepository = new MemoryGolfTournamentVenueRepository();

    await mergeCountrySeed(countryRepository);
    await mergeLocationSeed(
      locationRepository,
      countryRepository,
      LOCATION_SEED_DATA,
    );

    const result = await mergeLpgaTourSeed(
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
      tournamentsAdded: LPGA_TOURNAMENT_SEED_DATA.length,
      tournamentsSkipped: 0,
      tournamentsMissingVenue: 0,
    });
    expect(result.venueLinksAdded).toBe(LPGA_TOURNAMENT_SEED_DATA.length);

    const tour = await tourRepository.getByAbbreviation("LPGA");
    expect(tour?.logo).toBe(getGolfTourLogoPublicPath("LPGA"));

    const tournaments = await tournamentRepository.listByTour(tour!.id);
    expect(tournaments[0]).toMatchObject({
      teeGroupCount: DEFAULT_LPGA_TEE_GROUP_COUNT,
      fieldSize: DEFAULT_LPGA_FIELD_SIZE,
    });
  });
});
