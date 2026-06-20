import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { getEventStore, resetEventStore } from "@/modules/events";
import { getGolfSeasonScheduleStore, getGolfTourStore, resetGolfStores, setSchedulingRepositoriesForTests } from "@/modules/golf";
import { processPgaTourClockTransition, scheduleDpWorldTourSeason, schedulePgaTourSeason } from "@/modules/golf/scheduling";
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
import {
  DEFAULT_PGA_TEE_GROUP_COUNT,
  PGA_TOURNAMENT_SEED_DATA,
} from "@/persistence/seed/pga-tour.data";
import { mergeDpWorldTourSeed } from "@/persistence/seed/dp-world-tour";
import { DP_WORLD_TOURNAMENT_SEED_DATA } from "@/persistence/seed/dp-world-tour.data";
import { mergeGolfVenueSeed } from "@/persistence/seed/golf-venues";
import { GolfErrorCodes } from "@/modules/golf/errors";

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

  it(
    "schedules a full PGA season with tournament event trees",
    async () => {
      await schedulePgaTourSeason(2026, "2025-10-01T12:00:00.000Z");

      const tour = await getGolfTourStore().getByAbbreviation("PGA");
      const schedules = await getGolfSeasonScheduleStore().listByTour(tour.id, 2026);

      expect(schedules).toHaveLength(47);
      const eventsPerTournament = 5 + 4 * DEFAULT_PGA_TEE_GROUP_COUNT;
      expect(await getEventStore().count()).toBe(
        PGA_TOURNAMENT_SEED_DATA.length * eventsPerTournament,
      );
    },
    30_000,
  );

  it("fires on Oct 1 clock crossing without rematerializing an already scheduled season", async () => {
    await schedulingRepositories.schedulerStateRepository.upsert({
      tourAbbreviation: "PGA",
      lastProcessedIsoUtc: "2025-09-30T12:00:00.000Z",
      lastScheduledSeasonYear: 2026,
    });

    const result = await processPgaTourClockTransition(
      "2025-09-30T12:00:00.000Z",
      "2025-10-02T12:00:00.000Z",
    );

    expect(result).toMatchObject({
      tourAbbreviation: "PGA",
      scheduled: true,
      seasonYear: 2026,
    });
    expect(await getEventStore().count()).toBe(0);
  });
});

describe("DP World Tour co-sanctioned majors", () => {
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
    process.env.PGA_TOUR_ENABLED = "true";
    process.env.DP_WORLD_TOUR_ENABLED = "true";

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
    await mergeDpWorldTourSeed(
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
    delete process.env.DP_WORLD_TOUR_ENABLED;
  });

  it("throws when co-sanctioned majors reference an unscheduled PGA season", async () => {
    const scheduledAt = "2025-10-01T12:00:00.000Z";
    await expect(scheduleDpWorldTourSeason(2026, scheduledAt)).rejects.toMatchObject({
      code: GolfErrorCodes.SCHEDULE_REFERENCE_NOT_FOUND,
    });
  });

  it(
    "schedules dual tours with shared major rootEventIds and no duplicate event trees",
    async () => {
      const scheduledAt = "2025-10-01T12:00:00.000Z";
      await schedulePgaTourSeason(2026, scheduledAt);
      const eventsAfterPga = await getEventStore().count();

      await scheduleDpWorldTourSeason(2026, scheduledAt);
      expect(await getEventStore().count() - eventsAfterPga).toBe(8325);

      const pgaTour = await getGolfTourStore().getByAbbreviation("PGA");
      const dpwtTour = await getGolfTourStore().getByAbbreviation("DPWT");
      const dpwtSchedules = await getGolfSeasonScheduleStore().listByTour(
        dpwtTour.id,
        2026,
      );
      const pgaSchedules = await getGolfSeasonScheduleStore().listByTour(
        pgaTour.id,
        2026,
      );

      expect(dpwtSchedules).toHaveLength(42);

      const referencedMajors = DP_WORLD_TOURNAMENT_SEED_DATA.filter(
        (entry) => entry.scheduleReference,
      );
      for (const entry of referencedMajors) {
        const dpwtTournament =
          await schedulingRepositories.tournamentRepository.getBySlug(
            dpwtTour.id,
            entry.slug,
          );
        const pgaTournament =
          await schedulingRepositories.tournamentRepository.getBySlug(
            pgaTour.id,
            entry.scheduleReference!.tournamentSlug,
          );
        const dpwtSchedule = dpwtSchedules.find(
          (schedule) => schedule.tournamentId === dpwtTournament?.id,
        );
        const pgaSchedule = pgaSchedules.find(
          (schedule) => schedule.tournamentId === pgaTournament?.id,
        );

        expect(dpwtSchedule?.rootEventId).toBe(pgaSchedule?.rootEventId);
        expect(dpwtSchedule?.venueId).toBe(pgaSchedule?.venueId);
      }

      const pgaRootEventIds = new Set(
        pgaSchedules.map((schedule) => schedule.rootEventId),
      );
      expect(
        dpwtSchedules.filter((schedule) =>
          pgaRootEventIds.has(schedule.rootEventId),
        ),
      ).toHaveLength(5);

      const dpwtMasters =
        await schedulingRepositories.tournamentRepository.getBySlug(
          dpwtTour.id,
          "the-masters",
        );
      expect(dpwtMasters?.scheduleReference).toEqual({
        tourAbbreviation: "PGA",
        tournamentSlug: "masters",
      });
    },
    60_000,
  );
});
