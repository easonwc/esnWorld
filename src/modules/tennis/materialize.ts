import { buildEventRecord } from "@/modules/events/transform";
import type { EventRecord } from "@/modules/events/types";
import { utcToLocalTime, localTimeToIsoUtc } from "@/modules/locations";
import type { VenueResource } from "@/modules/venues/types";
import type { TennisTournament } from "./types";

const DAY_DURATION_MINUTES = 12 * 60;
const COURT_SESSION_DURATION_MINUTES = 8 * 60;

function dayLocalStart(
  seasonYear: number,
  month: number,
  day: number,
  dayIndex: number,
  timezone: string,
) {
  const baseUtc = localTimeToIsoUtc(
    {
      year: seasonYear,
      month,
      day,
      hour: 11,
      minute: 0,
      second: 0,
    },
    timezone,
  );
  const dayUtc = new Date(
    Date.parse(baseUtc) + dayIndex * 24 * 60 * 60 * 1000,
  ).toISOString();
  const local = utcToLocalTime(dayUtc, timezone);

  return {
    year: local.year,
    month: local.month,
    day: local.day,
    hour: 11,
    minute: 0,
    second: 0,
  };
}

export function buildTournamentEventTree(input: {
  tournament: TennisTournament;
  seasonYear: number;
  venueId: string;
  timezone: string;
  courts: readonly VenueResource[];
}): EventRecord[] {
  const { tournament, seasonYear, venueId, timezone, courts } = input;
  const activeCourts = courts
    .filter((resource) => resource.resourceType === "court")
    .slice(0, tournament.activeCourtCount);

  if (activeCourts.length < tournament.activeCourtCount) {
    throw new Error(
      `Venue has ${activeCourts.length} courts but ${tournament.name} requires ${tournament.activeCourtCount}`,
    );
  }

  const events: EventRecord[] = [];
  const rootId = crypto.randomUUID();
  const rootLocalStart = dayLocalStart(
    seasonYear,
    tournament.seasonStartMonth,
    tournament.seasonStartDay,
    0,
    timezone,
  );

  const root = buildEventRecord(
    {
      name: `${tournament.name} ${seasonYear}`,
      venueId,
      localStart: rootLocalStart,
      durationMinutes: tournament.typicalDurationDays * 24 * 60,
    },
    timezone,
    rootId,
  );
  events.push(root);

  for (let dayIndex = 0; dayIndex < tournament.typicalDurationDays; dayIndex += 1) {
    const dayId = crypto.randomUUID();
    const dayLocal = dayLocalStart(
      seasonYear,
      tournament.seasonStartMonth,
      tournament.seasonStartDay,
      dayIndex,
      timezone,
    );

    const dayEvent = buildEventRecord(
      {
        name: `Day ${dayIndex + 1}`,
        venueId,
        parentId: rootId,
        localStart: dayLocal,
        durationMinutes: DAY_DURATION_MINUTES,
      },
      timezone,
      dayId,
    );
    events.push(dayEvent);

    for (const court of activeCourts) {
      const courtEvent = buildEventRecord(
        {
          name: court.name,
          venueId,
          parentId: dayId,
          venueResourceId: court.id,
          localStart: dayLocal,
          durationMinutes: COURT_SESSION_DURATION_MINUTES,
        },
        timezone,
        crypto.randomUUID(),
      );
      events.push(courtEvent);
    }
  }

  return events;
}
