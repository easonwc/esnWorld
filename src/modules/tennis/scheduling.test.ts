import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { getEventStore, resetEventStore } from "@/modules/events";
import {
  getTennisSeasonScheduleStore,
  getTennisTourStore,
  resetTennisStores,
  setSchedulingRepositoriesForTests,
} from "@/modules/tennis";
import {
  processAtpTourClockTransition,
  scheduleAtpTourSeason,
  scheduleWtaTourSeason,
} from "@/modules/tennis/scheduling";
import { resetLocationStore } from "@/modules/locations";
import { resetVenueStore } from "@/modules/venues";
import { clearClockTransitionHandlers } from "@/modules/world-clock/clock-scheduler";
import {
  registerTennisClockHandlers,
  resetTennisClockHandlerRegistrationForTests,
} from "@/modules/tennis/register";
import {
  MemoryCountryRepository,
  MemoryEventRepository,
  MemoryLocationRepository,
  MemoryTennisSeasonScheduleRepository,
  MemoryTennisTourRepository,
  MemoryTennisTourSchedulerStateRepository,
  MemoryTennisTournamentRepository,
  MemoryTennisTournamentVenueRepository,
  MemoryVenueRepository,
  MemoryVenueResourceRepository,
} from "@/persistence/repositories";
import { mergeAtpTourSeed } from "@/persistence/seed/atp-tour";
import {
  ATP_TOURNAMENT_SEED_DATA,
} from "@/persistence/seed/atp-tour.data";
import { mergeWtaTourSeed } from "@/persistence/seed/wta-tour";
import { WTA_JOINT_ATP_TOURNAMENT_SLUGS, WTA_TOURNAMENT_SEED_DATA } from "@/persistence/seed/wta-tour.data";
import { TennisErrorCodes } from "@/modules/tennis/errors";

function eventsPerTournament(
  durationDays: number,
  activeCourtCount: number,
): number {
  return 1 + durationDays + durationDays * activeCourtCount;
}

function expectedAtpSeasonEventCount(): number {
  return ATP_TOURNAMENT_SEED_DATA.reduce(
    (total, entry) =>
      total +
      eventsPerTournament(
        entry.typicalDurationDays ?? 7,
        entry.activeCourtCount ?? 12,
      ),
    0,
  );
}

function expectedWtaOnlySeasonEventCount(): number {
  return WTA_TOURNAMENT_SEED_DATA.filter(
    (entry) => !entry.scheduleReference,
  ).reduce(
    (total, entry) =>
      total +
      eventsPerTournament(
        entry.typicalDurationDays ?? 7,
        entry.activeCourtCount ?? 12,
      ),
    0,
  );
}

describe("ATP Tour scheduling", () => {
  let schedulingRepositories: {
    eventRepository: MemoryEventRepository;
    tourRepository: MemoryTennisTourRepository;
    tournamentRepository: MemoryTennisTournamentRepository;
    tournamentVenueRepository: MemoryTennisTournamentVenueRepository;
    seasonScheduleRepository: MemoryTennisSeasonScheduleRepository;
    schedulerStateRepository: MemoryTennisTourSchedulerStateRepository;
    locationRepository: MemoryLocationRepository;
    venueResourceRepository: MemoryVenueResourceRepository;
  };

  beforeEach(async () => {
    clearClockTransitionHandlers();
    resetTennisClockHandlerRegistrationForTests();
    registerTennisClockHandlers();
    process.env.ATP_TOUR_ENABLED = "true";

    const countryRepository = new MemoryCountryRepository();
    const locationRepository = new MemoryLocationRepository();
    const venueRepository = new MemoryVenueRepository();
    const venueResourceRepository = new MemoryVenueResourceRepository();
    const tourRepository = new MemoryTennisTourRepository();
    const tournamentRepository = new MemoryTennisTournamentRepository();
    const tournamentVenueRepository = new MemoryTennisTournamentVenueRepository();
    const seasonScheduleRepository = new MemoryTennisSeasonScheduleRepository();
    const schedulerStateRepository = new MemoryTennisTourSchedulerStateRepository();
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

    await mergeAtpTourSeed(
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
    resetTennisStores({
      tourRepository,
      tournamentRepository,
      tournamentVenueRepository,
      seasonScheduleRepository,
    });
    resetEventStore(eventRepository);
  });

  afterEach(() => {
    setSchedulingRepositoriesForTests(null);
    delete process.env.ATP_TOUR_ENABLED;
  });

  it(
    "schedules a full ATP season with court-based event trees",
    async () => {
      await scheduleAtpTourSeason(2026, "2025-10-01T12:00:00.000Z");

      const tour = await getTennisTourStore().getByAbbreviation("ATP");
      const schedules = await getTennisSeasonScheduleStore().listByTour(tour.id, 2026);

      expect(schedules).toHaveLength(ATP_TOURNAMENT_SEED_DATA.length);
      expect(await getEventStore().count()).toBe(expectedAtpSeasonEventCount());
    },
    30_000,
  );

  it("fires on Oct 1 clock crossing without rematerializing an already scheduled season", async () => {
    await schedulingRepositories.schedulerStateRepository.upsert({
      tourAbbreviation: "ATP",
      lastProcessedIsoUtc: "2025-09-30T12:00:00.000Z",
      lastScheduledSeasonYear: 2026,
    });

    const result = await processAtpTourClockTransition(
      "2025-09-30T12:00:00.000Z",
      "2025-10-02T12:00:00.000Z",
    );

    expect(result).toMatchObject({
      tourAbbreviation: "ATP",
      scheduled: true,
      seasonYear: 2026,
    });
    expect(await getEventStore().count()).toBe(0);
  });
});

describe("WTA shared-tree scheduling", () => {
  let schedulingRepositories: {
    eventRepository: MemoryEventRepository;
    tourRepository: MemoryTennisTourRepository;
    tournamentRepository: MemoryTennisTournamentRepository;
    tournamentVenueRepository: MemoryTennisTournamentVenueRepository;
    seasonScheduleRepository: MemoryTennisSeasonScheduleRepository;
    schedulerStateRepository: MemoryTennisTourSchedulerStateRepository;
    locationRepository: MemoryLocationRepository;
    venueResourceRepository: MemoryVenueResourceRepository;
  };

  beforeEach(async () => {
    process.env.ATP_TOUR_ENABLED = "true";
    process.env.WTA_TOUR_ENABLED = "true";

    const countryRepository = new MemoryCountryRepository();
    const locationRepository = new MemoryLocationRepository();
    const venueRepository = new MemoryVenueRepository();
    const venueResourceRepository = new MemoryVenueResourceRepository();
    const tourRepository = new MemoryTennisTourRepository();
    const tournamentRepository = new MemoryTennisTournamentRepository();
    const tournamentVenueRepository = new MemoryTennisTournamentVenueRepository();
    const seasonScheduleRepository = new MemoryTennisSeasonScheduleRepository();
    const schedulerStateRepository = new MemoryTennisTourSchedulerStateRepository();
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

    const repositories = {
      tourRepository,
      tournamentRepository,
      tournamentVenueRepository,
      countryRepository,
      locationRepository,
      venueRepository,
      venueResourceRepository,
    };

    await mergeAtpTourSeed(repositories, true);
    await mergeWtaTourSeed(repositories, true);

    resetLocationStore(locationRepository);
    resetVenueStore(venueRepository, venueResourceRepository);
    resetTennisStores({
      tourRepository,
      tournamentRepository,
      tournamentVenueRepository,
      seasonScheduleRepository,
    });
    resetEventStore(eventRepository);
  });

  afterEach(() => {
    setSchedulingRepositoriesForTests(null);
    delete process.env.ATP_TOUR_ENABLED;
    delete process.env.WTA_TOUR_ENABLED;
  });

  it("throws when WTA slams reference an unscheduled ATP season", async () => {
    const scheduledAt = "2025-10-01T12:00:00.000Z";
    await expect(scheduleWtaTourSeason(2026, scheduledAt)).rejects.toMatchObject({
      code: TennisErrorCodes.SCHEDULE_REFERENCE_NOT_FOUND,
    });
  });

  it(
    "schedules dual tours with shared slam rootEventIds and no duplicate event trees",
    async () => {
    const scheduledAt = "2025-10-01T12:00:00.000Z";
    await scheduleAtpTourSeason(2026, scheduledAt);
    const eventsAfterAtp = await getEventStore().count();

    await scheduleWtaTourSeason(2026, scheduledAt);
    expect(await getEventStore().count()).toBe(
      eventsAfterAtp + expectedWtaOnlySeasonEventCount(),
    );

    const atpTour = await getTennisTourStore().getByAbbreviation("ATP");
    const wtaTour = await getTennisTourStore().getByAbbreviation("WTA");
    const atpSchedules = await getTennisSeasonScheduleStore().listByTour(
      atpTour.id,
      2026,
    );
    const wtaSchedules = await getTennisSeasonScheduleStore().listByTour(
      wtaTour.id,
      2026,
    );

    expect(atpSchedules).toHaveLength(ATP_TOURNAMENT_SEED_DATA.length);
    expect(wtaSchedules).toHaveLength(WTA_TOURNAMENT_SEED_DATA.length);

    for (const entry of WTA_TOURNAMENT_SEED_DATA.filter(
      (tournament) => tournament.scheduleReference,
    )) {
      const wtaTournament =
        await schedulingRepositories.tournamentRepository.getBySlug(
          wtaTour.id,
          entry.slug,
        );
      const atpTournament =
        await schedulingRepositories.tournamentRepository.getBySlug(
          atpTour.id,
          entry.scheduleReference!.tournamentSlug,
        );
      const wtaSchedule = wtaSchedules.find(
        (schedule) => schedule.tournamentId === wtaTournament?.id,
      );
      const atpSchedule = atpSchedules.find(
        (schedule) => schedule.tournamentId === atpTournament?.id,
      );

      expect(wtaSchedule?.rootEventId).toBe(atpSchedule?.rootEventId);
      expect(wtaSchedule?.venueId).toBe(atpSchedule?.venueId);
    }

    const atpRootEventIds = new Set(atpSchedules.map((schedule) => schedule.rootEventId));
    expect(
      wtaSchedules.filter((schedule) => atpRootEventIds.has(schedule.rootEventId)),
    ).toHaveLength(WTA_JOINT_ATP_TOURNAMENT_SLUGS.length);
  },
  60_000,
  );
});
