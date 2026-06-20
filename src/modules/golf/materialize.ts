import { buildEventRecord } from "@/modules/events/transform";
import type { EventRecord } from "@/modules/events/types";
import { utcToLocalTime, localTimeToIsoUtc } from "@/modules/locations";
import type { VenueResource } from "@/modules/venues/types";
import type { GolfTournament } from "./types";

const ROUND_DURATION_MINUTES = 12 * 60;
const TEE_GROUP_DURATION_MINUTES = 8 * 60;
const ROUNDS = 4;

function roundLocalStart(
  seasonYear: number,
  month: number,
  day: number,
  roundIndex: number,
  timezone: string,
) {
  const baseUtc = localTimeToIsoUtc(
    {
      year: seasonYear,
      month,
      day,
      hour: 7,
      minute: 0,
      second: 0,
    },
    timezone,
  );
  const roundUtc = new Date(
    Date.parse(baseUtc) + roundIndex * 24 * 60 * 60 * 1000,
  ).toISOString();
  const local = utcToLocalTime(roundUtc, timezone);

  return {
    year: local.year,
    month: local.month,
    day: local.day,
    hour: 7,
    minute: 0,
    second: 0,
  };
}

export function buildTournamentEventTree(input: {
  tournament: GolfTournament;
  seasonYear: number;
  venueId: string;
  timezone: string;
  teeGroups: readonly VenueResource[];
}): EventRecord[] {
  const { tournament, seasonYear, venueId, timezone, teeGroups } = input;
  const groups = teeGroups
    .filter((resource) => resource.resourceType === "tee_group")
    .slice(0, tournament.fieldSize);

  if (groups.length < tournament.fieldSize) {
    throw new Error(
      `Venue has ${groups.length} tee groups but ${tournament.name} requires ${tournament.fieldSize}`,
    );
  }

  const events: EventRecord[] = [];
  const rootId = crypto.randomUUID();
  const rootLocalStart = roundLocalStart(
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

  for (let roundIndex = 0; roundIndex < ROUNDS; roundIndex += 1) {
    const roundId = crypto.randomUUID();
    const roundLocal = roundLocalStart(
      seasonYear,
      tournament.seasonStartMonth,
      tournament.seasonStartDay,
      roundIndex,
      timezone,
    );

    const round = buildEventRecord(
      {
        name: `Round ${roundIndex + 1}`,
        venueId,
        parentId: rootId,
        localStart: roundLocal,
        durationMinutes: ROUND_DURATION_MINUTES,
      },
      timezone,
      roundId,
    );
    events.push(round);

    for (const group of groups) {
      const groupEvent = buildEventRecord(
        {
          name: group.name,
          venueId,
          parentId: roundId,
          venueResourceId: group.id,
          localStart: roundLocal,
          durationMinutes: TEE_GROUP_DURATION_MINUTES,
        },
        timezone,
        crypto.randomUUID(),
      );
      events.push(groupEvent);
    }
  }

  return events;
}
