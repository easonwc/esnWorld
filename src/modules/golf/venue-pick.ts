import {
  assertNoVenueScheduleConflict,
} from "@/modules/events/transform";
import type { EventRecord } from "@/modules/events/types";
import { EventError, EventErrorCodes } from "@/modules/events/errors";
import type { Location } from "@/modules/locations/types";
import { getVenueStore } from "@/modules/venues";
import type { Venue } from "@/modules/venues/types";
import type { VenueResourceRepository } from "@/persistence/repositories";
import type { LocationRepository } from "@/persistence/repositories";
import { GolfError, GolfErrorCodes } from "./errors";
import { buildTournamentEventTree } from "./materialize";
import type { GolfTournament, GolfTournamentVenue } from "./types";

export interface MaterializedVenuePick {
  venueLink: GolfTournamentVenue;
  venue: Venue;
  location: Location;
  tree: EventRecord[];
}

function sortVenueLinks(
  venueLinks: readonly GolfTournamentVenue[],
): GolfTournamentVenue[] {
  return [...venueLinks].sort(
    (left, right) => left.rotationOrder - right.rotationOrder,
  );
}

export function preferredRotationIndex(
  tournament: GolfTournament,
  poolSize: number,
  seasonYear: number,
): number {
  const epoch = tournament.rotationEpochYear ?? seasonYear;
  return ((seasonYear - epoch) % poolSize + poolSize) % poolSize;
}

/** Rotation pool order starting at the epoch-preferred index. */
export function orderRotationVenueLinks(
  tournament: GolfTournament,
  venueLinks: readonly GolfTournamentVenue[],
  seasonYear: number,
): GolfTournamentVenue[] {
  const sorted = sortVenueLinks(venueLinks);
  const startIndex = preferredRotationIndex(tournament, sorted.length, seasonYear);
  const ordered: GolfTournamentVenue[] = [];

  for (let offset = 0; offset < sorted.length; offset += 1) {
    ordered.push(sorted[(startIndex + offset) % sorted.length]!);
  }

  return ordered;
}

export function treeHasVenueScheduleConflict(
  tree: readonly EventRecord[],
  existingEvents: readonly EventRecord[],
  priorPlannedEvents: readonly EventRecord[],
  venueSchedulingMode: Venue["schedulingMode"],
): boolean {
  const combined = [...existingEvents, ...priorPlannedEvents, ...tree];
  const eventsById = new Map(combined.map((event) => [event.id, event]));

  for (let index = 0; index < tree.length; index += 1) {
    const event = tree[index]!;
    const priorInTree = tree.slice(0, index);
    const eventsAtVenue = [
      ...existingEvents.filter((candidate) => candidate.venueId === event.venueId),
      ...priorPlannedEvents.filter(
        (candidate) => candidate.venueId === event.venueId,
      ),
      ...priorInTree.filter((candidate) => candidate.venueId === event.venueId),
    ];

    try {
      assertNoVenueScheduleConflict(
        event,
        eventsAtVenue,
        eventsById,
        venueSchedulingMode,
      );
    } catch (error) {
      if (
        error instanceof EventError &&
        error.code === EventErrorCodes.VENUE_SCHEDULE_CONFLICT
      ) {
        return true;
      }
      throw error;
    }
  }

  return false;
}

async function materializeAtVenueLink(input: {
  tournament: GolfTournament;
  venueLink: GolfTournamentVenue;
  seasonYear: number;
  locationRepository: LocationRepository;
  venueResourceRepository: VenueResourceRepository;
  existingEvents: readonly EventRecord[];
  priorPlannedEvents: readonly EventRecord[];
}): Promise<MaterializedVenuePick | null> {
  const venue = await getVenueStore().get(input.venueLink.venueId);
  const location = await input.locationRepository.get(venue.locationId);
  if (!location) {
    throw new GolfError(
      GolfErrorCodes.VENUE_NOT_FOUND,
      `Location missing for venue ${venue.name}`,
    );
  }

  const teeGroups = await input.venueResourceRepository.listByVenue(venue.id);
  const tree = buildTournamentEventTree({
    tournament: input.tournament,
    seasonYear: input.seasonYear,
    venueId: venue.id,
    timezone: location.timezone,
    teeGroups,
  });

  if (
    treeHasVenueScheduleConflict(
      tree,
      input.existingEvents,
      input.priorPlannedEvents,
      venue.schedulingMode,
    )
  ) {
    return null;
  }

  return {
    venueLink: input.venueLink,
    venue,
    location,
    tree,
  };
}

export async function pickAvailableVenueLink(input: {
  tournament: GolfTournament;
  venueLinks: readonly GolfTournamentVenue[];
  seasonYear: number;
  locationRepository: LocationRepository;
  venueResourceRepository: VenueResourceRepository;
  existingEvents: readonly EventRecord[];
  priorPlannedEvents: readonly EventRecord[];
}): Promise<MaterializedVenuePick> {
  if (input.venueLinks.length === 0) {
    throw new GolfError(
      GolfErrorCodes.VENUE_POOL_EMPTY,
      `No venues configured for tournament ${input.tournament.slug}`,
    );
  }

  const candidates =
    input.tournament.venueMode === "rotation"
      ? orderRotationVenueLinks(
          input.tournament,
          input.venueLinks,
          input.seasonYear,
        )
      : [
          sortVenueLinks(input.venueLinks).find((link) => link.isDefault) ??
            sortVenueLinks(input.venueLinks)[0]!,
        ];

  for (const venueLink of candidates) {
    const materialized = await materializeAtVenueLink({
      tournament: input.tournament,
      venueLink,
      seasonYear: input.seasonYear,
      locationRepository: input.locationRepository,
      venueResourceRepository: input.venueResourceRepository,
      existingEvents: input.existingEvents,
      priorPlannedEvents: input.priorPlannedEvents,
    });
    if (materialized) {
      return materialized;
    }
  }

  throw new GolfError(
    GolfErrorCodes.VENUE_POOL_EXHAUSTED,
    `No available venue in pool for ${input.tournament.slug} ${input.seasonYear}`,
  );
}
