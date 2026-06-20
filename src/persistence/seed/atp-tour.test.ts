import { getTennisTourLogoPublicPath } from "@/persistence/logos/config";
import {
  GRAND_SLAM_ACTIVE_COURT_COUNT,
  GRAND_SLAM_DRAW_SIZE,
} from "./atp-tour.data";
import {
  MemoryCountryRepository,
  MemoryLocationRepository,
  MemoryTennisTournamentRepository,
  MemoryTennisTournamentVenueRepository,
  MemoryTennisTourRepository,
  MemoryVenueRepository,
  MemoryVenueResourceRepository,
} from "@/persistence/repositories";
import { describe, expect, it } from "vitest";
import { mergeAtpTourSeed } from "./atp-tour";
import { ATP_TOURNAMENT_SEED_DATA } from "./atp-tour.data";

describe("ATP Tour seed", () => {
  it("links slam venues without requiring TENNIS_VENUES_SEED_ON_STARTUP", async () => {
    const countryRepository = new MemoryCountryRepository();
    const locationRepository = new MemoryLocationRepository();
    const venueRepository = new MemoryVenueRepository();
    const venueResourceRepository = new MemoryVenueResourceRepository();
    const tourRepository = new MemoryTennisTourRepository();
    const tournamentRepository = new MemoryTennisTournamentRepository();
    const tournamentVenueRepository = new MemoryTennisTournamentVenueRepository();

    const result = await mergeAtpTourSeed(
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
      tournamentsAdded: ATP_TOURNAMENT_SEED_DATA.length,
      tournamentsSkipped: 0,
      tournamentsMissingVenue: 0,
    });
    expect(result.venueLinksAdded).toBeGreaterThanOrEqual(ATP_TOURNAMENT_SEED_DATA.length);

    const tour = await tourRepository.getByAbbreviation("ATP");
    expect(tour?.logo).toBe(getTennisTourLogoPublicPath("ATP"));

    const tournaments = await tournamentRepository.listByTour(tour!.id);
    const australianOpen = tournaments.find(
      (tournament) => tournament.slug === "australian-open",
    );
    expect(australianOpen).toMatchObject({
      activeCourtCount: GRAND_SLAM_ACTIVE_COURT_COUNT,
      drawSize: GRAND_SLAM_DRAW_SIZE,
      scheduleReference: null,
      isMajor: true,
    });
    expect(tournaments.filter((tournament) => tournament.isMajor)).toHaveLength(4);
  });

  it("backfills venue links for tournaments created without venues", async () => {
    const countryRepository = new MemoryCountryRepository();
    const locationRepository = new MemoryLocationRepository();
    const venueRepository = new MemoryVenueRepository();
    const venueResourceRepository = new MemoryVenueResourceRepository();
    const tourRepository = new MemoryTennisTourRepository();
    const tournamentRepository = new MemoryTennisTournamentRepository();
    const tournamentVenueRepository = new MemoryTennisTournamentVenueRepository();

    const tour = {
      id: crypto.randomUUID(),
      name: "ATP Tour",
      abbreviation: "ATP",
      logo: "",
    };
    await tourRepository.create(tour);

    for (const entry of ATP_TOURNAMENT_SEED_DATA) {
      await tournamentRepository.create({
        id: crypto.randomUUID(),
        tourId: tour.id,
        slug: entry.slug,
        name: entry.name,
        isMajor: entry.isMajor,
        prizeMoneyUsd: entry.prizeMoneyUsd,
        entryCriteria: entry.entryCriteria,
        venueMode: entry.venueMode,
        typicalDurationDays: entry.typicalDurationDays ?? 14,
        activeCourtCount: entry.activeCourtCount ?? GRAND_SLAM_ACTIVE_COURT_COUNT,
        drawSize: entry.drawSize ?? GRAND_SLAM_DRAW_SIZE,
        seasonStartMonth: entry.seasonStartMonth,
        seasonStartDay: entry.seasonStartDay,
        rotationEpochYear: entry.rotationEpochYear ?? null,
        sortOrder: entry.sortOrder,
        materializeOnSchedule: entry.materializeOnSchedule ?? true,
        scheduleReference: entry.scheduleReference ?? null,
      });
    }

    const result = await mergeAtpTourSeed(
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
      tournamentsSkipped: ATP_TOURNAMENT_SEED_DATA.length,
      tournamentsMissingVenue: 0,
    });
    expect(result.venueLinksAdded).toBeGreaterThan(0);

    const updatedTour = await tourRepository.getByAbbreviation("ATP");
    expect(updatedTour?.logo).toBe(getTennisTourLogoPublicPath("ATP"));
  });
});
