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
import { mergeDpWorldTourSeed } from "./dp-world-tour";
import {
  DEFAULT_DP_WORLD_FIELD_SIZE,
  DEFAULT_DP_WORLD_TEE_GROUP_COUNT,
  DP_WORLD_TOURNAMENT_SEED_DATA,
} from "./dp-world-tour.data";
import { mergeLocationSeed } from "./locations";
import { LOCATION_SEED_DATA } from "./locations.data";
import { getGolfTourLogoPublicPath } from "@/persistence/logos/config";

describe("DP World Tour seed", () => {
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

    const result = await mergeDpWorldTourSeed(
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
      tournamentsAdded: DP_WORLD_TOURNAMENT_SEED_DATA.length,
      tournamentsSkipped: 0,
      tournamentsMissingVenue: 0,
    });
    expect(result.venueLinksAdded).toBeGreaterThanOrEqual(
      DP_WORLD_TOURNAMENT_SEED_DATA.length,
    );

    const tour = await tourRepository.getByAbbreviation("DPWT");
    expect(tour?.logo).toBe(getGolfTourLogoPublicPath("DPWT"));

    const tournaments = await tournamentRepository.listByTour(tour!.id);
    expect(tournaments[0]).toMatchObject({
      teeGroupCount: DEFAULT_DP_WORLD_TEE_GROUP_COUNT,
      fieldSize: DEFAULT_DP_WORLD_FIELD_SIZE,
    });
  });
});
