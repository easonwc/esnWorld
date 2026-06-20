import { assertNoVenueScheduleConflict } from "@/modules/events/transform";
import type { EventRecord } from "@/modules/events/types";
import { EventError, EventErrorCodes } from "@/modules/events/errors";
import type { Location } from "@/modules/locations/types";
import { getVenueStore } from "@/modules/venues";
import type { Venue } from "@/modules/venues/types";
import type { LocationRepository, VenueResourceRepository } from "@/persistence/repositories";
import { TennisError, TennisErrorCodes } from "./errors";
import { buildTournamentEventTree } from "./materialize";
import type { TennisTournament, TennisTournamentVenue } from "./types";

export interface MaterializedVenuePick {
  venueLink: TennisTournamentVenue;
  venue: Venue;
  location: Location;
  tree: EventRecord[];
}

function sortVenueLinks(
  venueLinks: readonly TennisTournamentVenue[],
): TennisTournamentVenue[] {
  return [...venueLinks].sort(
    (left, right) => left.rotationOrder - right.rotationOrder,
  );
}

export function preferredRotationIndex(
  tournament: TennisTournament,
  poolSize: number,
  seasonYear: number,
): number {
  const epoch = tournament.rotationEpochYear ?? seasonYear;
  return ((seasonYear - epoch) % poolSize + poolSize) % poolSize;
}

/** Rotation pool order starting at the epoch-preferred index. */
export function orderRotationVenueLinks(
  tournament: TennisTournament,
  venueLinks: readonly TennisTournamentVenue[],
  seasonYear: number,
): TennisTournamentVenue[] {
  const sorted = sortVenueLinks(venueLinks);
  const startIndex = preferredRotationIndex(tournament, sorted.length, seasonYear);
  const ordered: TennisTournamentVenue[] = [];

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
  tournament: TennisTournament;
  venueLink: TennisTournamentVenue;
  seasonYear: number;
  locationRepository: LocationRepository;
  venueResourceRepository: VenueResourceRepository;
  existingEvents: readonly EventRecord[];
  priorPlannedEvents: readonly EventRecord[];
}): Promise<MaterializedVenuePick | null> {
  const venue = await getVenueStore().get(input.venueLink.venueId);
  const location = await input.locationRepository.get(venue.locationId);
  if (!location) {
    throw new TennisError(
      TennisErrorCodes.VENUE_NOT_FOUND,
      `Location missing for venue ${venue.name}`,
    );
  }

  const courts = await input.venueResourceRepository.listByVenue(venue.id);
  const tree = buildTournamentEventTree({
    tournament: input.tournament,
    seasonYear: input.seasonYear,
    venueId: venue.id,
    timezone: location.timezone,
    courts,
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
  tournament: TennisTournament;
  venueLinks: readonly TennisTournamentVenue[];
  seasonYear: number;
  locationRepository: LocationRepository;
  venueResourceRepository: VenueResourceRepository;
  existingEvents: readonly EventRecord[];
  priorPlannedEvents: readonly EventRecord[];
}): Promise<MaterializedVenuePick> {
  if (input.venueLinks.length === 0) {
    throw new TennisError(
      TennisErrorCodes.VENUE_POOL_EMPTY,
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

  throw new TennisError(
    TennisErrorCodes.VENUE_POOL_EXHAUSTED,
    `No available venue in pool for ${input.tournament.slug} ${input.seasonYear}`,
  );
}
