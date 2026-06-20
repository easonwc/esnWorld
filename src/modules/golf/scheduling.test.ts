import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { getEventStore, resetEventStore } from "@/modules/events";
import { getGolfSeasonScheduleStore, getGolfTourStore, resetGolfStores, setSchedulingRepositoriesForTests } from "@/modules/golf";
import { buildTournamentEventTree } from "@/modules/golf/materialize";
import { processGolfSchedulers, schedulePgaTourSeason } from "@/modules/golf/scheduling";
import { preferredRotationIndex } from "@/modules/golf/venue-pick";
import { getLocationStore, resetLocationStore } from "@/modules/locations";
import { getVenueStore, resetVenueStore } from "@/modules/venues";
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
import {
  scheduleDpWorldTourSeason,
  schedulePgaTourSeason,
} from "@/modules/golf/scheduling";
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

  it(
    "fires on Oct 1 clock crossing via processGolfSchedulers",
    async () => {
      const results = await processGolfSchedulers(
        "2025-09-30T12:00:00.000Z",
        "2025-10-02T12:00:00.000Z",
      );

      expect(results[0]).toMatchObject({
        tourAbbreviation: "PGA",
        scheduled: true,
        seasonYear: 2026,
      });
    },
    30_000,
  );

  it(
    "uses the next rotation venue when the preferred host is already booked",
    async () => {
      const tour = await getGolfTourStore().getByAbbreviation("PGA");
      const pgaChampionship =
        await schedulingRepositories.tournamentRepository.getBySlug(
          tour.id,
          "pga-championship",
        );
      expect(pgaChampionship).not.toBeNull();

      const venueLinks =
        await schedulingRepositories.tournamentVenueRepository.listByTournament(
          pgaChampionship!.id,
        );
      const preferredIndex = preferredRotationIndex(
        pgaChampionship!,
        venueLinks.length,
        2026,
      );
      const preferredVenueId = [...venueLinks]
        .sort((left, right) => left.rotationOrder - right.rotationOrder)[
          preferredIndex
        ]!.venueId;
      const fallbackVenueId = [...venueLinks]
        .sort((left, right) => left.rotationOrder - right.rotationOrder)[
          (preferredIndex + 1) % venueLinks.length
        ]!.venueId;

      const preferredVenue = await getVenueStore().get(preferredVenueId);
      const location = await getLocationStore().get(preferredVenue.locationId);
      const teeGroups =
        await schedulingRepositories.venueResourceRepository.listByVenue(
          preferredVenue.id,
        );
      const blocker = buildTournamentEventTree({
        tournament: pgaChampionship!,
        seasonYear: 2026,
        venueId: preferredVenue.id,
        timezone: location!.timezone,
        teeGroups,
      });
      for (const event of blocker) {
        await schedulingRepositories.eventRepository.create(event);
      }

      await schedulePgaTourSeason(2026, "2025-10-01T12:00:00.000Z");

      const schedules = await getGolfSeasonScheduleStore().listByTour(tour.id, 2026);
      const pgaChampionshipSchedule = schedules.find(
        (schedule) => schedule.tournamentId === pgaChampionship!.id,
      );

      expect(pgaChampionshipSchedule?.venueId).toBe(fallbackVenueId);
      expect(pgaChampionshipSchedule?.venueId).not.toBe(preferredVenueId);
    },
    30_000,
  );
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

  it(
    "throws when co-sanctioned majors reference an unscheduled PGA season",
    async () => {
      const scheduledAt = "2025-10-01T12:00:00.000Z";
      await expect(scheduleDpWorldTourSeason(2026, scheduledAt)).rejects.toMatchObject({
        code: GolfErrorCodes.SCHEDULE_REFERENCE_NOT_FOUND,
      });
    },
    60_000,
  );

  it(
    "schedules 42 tournaments when PGA season exists and shares major rootEventIds",
    async () => {
      const scheduledAt = "2025-10-01T12:00:00.000Z";
      await schedulePgaTourSeason(2026, scheduledAt);
      await scheduleDpWorldTourSeason(2026, scheduledAt);

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
    },
    60_000,
  );

  it(
    "schedules PGA majors without duplicating event trees on the DP World catalog",
    async () => {
      const scheduledAt = "2025-10-01T12:00:00.000Z";
      await schedulePgaTourSeason(2026, scheduledAt);
      const eventsAfterPga = await getEventStore().list();

      await scheduleDpWorldTourSeason(2026, scheduledAt);
      const eventsAfterBoth = await getEventStore().list();

      expect(eventsAfterBoth.length - eventsAfterPga.length).toBe(8325);

      const pgaRootEventIds = new Set(
        (
          await getGolfSeasonScheduleStore().listByTour(
            (await getGolfTourStore().getByAbbreviation("PGA"))!.id,
            2026,
          )
        ).map((schedule) => schedule.rootEventId),
      );
      const dpwtReferencedSchedules = (
        await getGolfSeasonScheduleStore().listByTour(
          (await getGolfTourStore().getByAbbreviation("DPWT"))!.id,
          2026,
        )
      ).filter((schedule) => pgaRootEventIds.has(schedule.rootEventId));
      expect(dpwtReferencedSchedules).toHaveLength(5);

      const pgaTour = await getGolfTourStore().getByAbbreviation("PGA");
      const pgaMasters = await schedulingRepositories.tournamentRepository.getBySlug(
        pgaTour.id,
        "masters",
      );
      const pgaSchedules = await getGolfSeasonScheduleStore().listByTour(
        pgaTour.id,
        2026,
      );

      expect(
        pgaSchedules.some(
          (schedule) => schedule.tournamentId === pgaMasters?.id,
        ),
      ).toBe(true);

      const dpwtTour = await getGolfTourStore().getByAbbreviation("DPWT");
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
