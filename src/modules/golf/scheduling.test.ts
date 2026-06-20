import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { getEventStore, resetEventStore } from "@/modules/events";
import { getGolfSeasonScheduleStore, getGolfTourStore, resetGolfStores, setSchedulingRepositoriesForTests } from "@/modules/golf";
import { processGolfSchedulers, schedulePgaTourSeason } from "@/modules/golf/scheduling";
import { resetLocationStore } from "@/modules/locations";
import { resetVenueStore } from "@/modules/venues";
import { clearClockTransitionHandlers } from "@/modules/world-clock/clock-scheduler";
import { registerGolfClockHandlers, resetGolfClockHandlerRegistrationForTests } from "./register";
import {
  MemoryCountryRepository,
  MemoryEventRepository,
  MemoryGolfSeasonScheduleRepository,
  MemoryGolfTourRepository,
  MemoryGolfTourSchedulerStateRepository,
  MemoryGolfTournamentRepository,
  MemoryGolfTournamentVenueRepository,
  MemoryLocationRepository,
  MemoryVenueRepository,
  MemoryVenueResourceRepository,
} from "@/persistence/repositories";
import { mergeCountrySeed } from "@/persistence/seed/countries";
import { mergeLocationSeed } from "@/persistence/seed/locations";
import { LOCATION_SEED_DATA } from "@/persistence/seed/locations.data";
import { mergePgaTourSeed } from "@/persistence/seed/pga-tour";
import { mergeGolfVenueSeed } from "@/persistence/seed/golf-venues";

describe("PGA Tour scheduling", () => {
  let schedulingRepositories: {
    eventRepository: MemoryEventRepository;
    tourRepository: MemoryGolfTourRepository;
    tournamentRepository: MemoryGolfTournamentRepository;
    tournamentVenueRepository: MemoryGolfTournamentVenueRepository;
    seasonScheduleRepository: MemoryGolfSeasonScheduleRepository;
    schedulerStateRepository: MemoryGolfTourSchedulerStateRepository;
    locationRepository: MemoryLocationRepository;
    venueResourceRepository: MemoryVenueResourceRepository;
  };

  beforeEach(async () => {
    clearClockTransitionHandlers();
    resetGolfClockHandlerRegistrationForTests();
    registerGolfClockHandlers();
    process.env.PGA_TOUR_ENABLED = "true";

    const countryRepository = new MemoryCountryRepository();
    const locationRepository = new MemoryLocationRepository();
    const venueRepository = new MemoryVenueRepository();
    const venueResourceRepository = new MemoryVenueResourceRepository();
    const tourRepository = new MemoryGolfTourRepository();
    const tournamentRepository = new MemoryGolfTournamentRepository();
    const tournamentVenueRepository = new MemoryGolfTournamentVenueRepository();
    const seasonScheduleRepository = new MemoryGolfSeasonScheduleRepository();
    const schedulerStateRepository = new MemoryGolfTourSchedulerStateRepository();
    const eventRepository = new MemoryEventRepository();

    schedulingRepositories = {
      eventRepository,
      tourRepository,
      tournamentRepository,
      tournamentVenueRepository,
      seasonScheduleRepository,
      schedulerStateRepository,
      locationRepository,
      venueResourceRepository,
    };

    setSchedulingRepositoriesForTests(schedulingRepositories);

    await mergeCountrySeed(countryRepository);
    await mergeLocationSeed(
      locationRepository,
      countryRepository,
      LOCATION_SEED_DATA,
    );
    await mergeGolfVenueSeed(
      { locationRepository, venueRepository, venueResourceRepository },
      true,
    );
    await mergePgaTourSeed(
      {
        tourRepository,
        tournamentRepository,
        tournamentVenueRepository,
        countryRepository,
        locationRepository,
        venueRepository,
        venueResourceRepository,
      },
      true,
    );

    resetLocationStore(locationRepository);
    resetVenueStore(venueRepository, venueResourceRepository);
    resetGolfStores({
      tourRepository,
      tournamentRepository,
      tournamentVenueRepository,
      seasonScheduleRepository,
    });
    resetEventStore(eventRepository);
  });

  afterEach(() => {
    setSchedulingRepositoriesForTests(null);
    delete process.env.PGA_TOUR_ENABLED;
  });

  it("schedules a full PGA season with tournament event trees", async () => {
    await schedulePgaTourSeason(2026, "2025-10-01T12:00:00.000Z");

    const tour = await getGolfTourStore().getByAbbreviation("PGA");
    const schedules = await getGolfSeasonScheduleStore().listByTour(tour.id, 2026);

    expect(schedules).toHaveLength(47);
    expect(await getEventStore().count()).toBe(5875);
  });

  it("fires on Oct 1 clock crossing via processGolfSchedulers", async () => {
    const results = await processGolfSchedulers(
      "2025-09-30T12:00:00.000Z",
      "2025-10-02T12:00:00.000Z",
    );

    expect(results[0]).toMatchObject({
      tourAbbreviation: "PGA",
      scheduled: true,
      seasonYear: 2026,
    });
  });
});
