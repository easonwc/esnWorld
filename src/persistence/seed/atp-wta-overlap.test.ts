import { describe, expect, it } from "vitest";
import { ATP_TOURNAMENT_SEED_DATA } from "./atp-tour.data";
import { WTA_TOURNAMENT_SEED_DATA } from "./wta-tour.data";
import type { TennisTournamentSeedEntry } from "./tennis-tour-seed.types";

type CatalogEntry = TennisTournamentSeedEntry & {
  venues?: readonly { venueName: string }[];
  typicalDurationDays?: number;
};

function allVenues(entry: CatalogEntry): string[] {
  return entry.venues?.map((venue) => venue.venueName) ?? [];
}

function eventDuration(entry: CatalogEntry): number {
  return entry.typicalDurationDays ?? 7;
}

function schedulesOverlap(
  left: CatalogEntry,
  right: CatalogEntry,
): boolean {
  const duration = Math.max(eventDuration(left), eventDuration(right));
  const leftStart = new Date(2026, left.seasonStartMonth - 1, left.seasonStartDay);
  const rightStart = new Date(2026, right.seasonStartMonth - 1, right.seasonStartDay);
  const leftEnd = new Date(leftStart);
  leftEnd.setDate(leftEnd.getDate() + duration - 1);
  const rightEnd = new Date(rightStart);
  rightEnd.setDate(rightEnd.getDate() + duration - 1);
  return leftStart <= rightEnd && rightStart <= leftEnd;
}

describe("ATP vs WTA catalog overlap", () => {
  it("references every WTA tournament that shares a venue-week with ATP", () => {
    const unreferencedConflicts: string[] = [];

    for (const wta of WTA_TOURNAMENT_SEED_DATA) {
      const wtaVenues = new Set(allVenues(wta));
      for (const atp of ATP_TOURNAMENT_SEED_DATA) {
        const sharedVenues = allVenues(atp).filter((venue) => wtaVenues.has(venue));
        if (sharedVenues.length === 0 || !schedulesOverlap(atp, wta)) {
          continue;
        }
        if (
          !wta.scheduleReference ||
          wta.scheduleReference.tourAbbreviation !== "ATP" ||
          wta.scheduleReference.tournamentSlug !== atp.slug
        ) {
          unreferencedConflicts.push(
            `${wta.slug} ↔ ${atp.slug} @ ${sharedVenues.join(", ")}`,
          );
        }
      }
    }

    expect(unreferencedConflicts).toEqual([]);
  });

  it("seeds WTA joint events with matching ATP schedule references", async () => {
    const {
      MemoryCountryRepository,
      MemoryLocationRepository,
      MemoryTennisTournamentRepository,
      MemoryTennisTournamentVenueRepository,
      MemoryTennisTourRepository,
      MemoryVenueRepository,
      MemoryVenueResourceRepository,
    } = await import("@/persistence/repositories");
    const { mergeAtpTourSeed } = await import("./atp-tour");
    const { mergeWtaTourSeed } = await import("./wta-tour");

    const repositories = {
      countryRepository: new MemoryCountryRepository(),
      locationRepository: new MemoryLocationRepository(),
      venueRepository: new MemoryVenueRepository(),
      venueResourceRepository: new MemoryVenueResourceRepository(),
      tourRepository: new MemoryTennisTourRepository(),
      tournamentRepository: new MemoryTennisTournamentRepository(),
      tournamentVenueRepository: new MemoryTennisTournamentVenueRepository(),
    };

    await mergeAtpTourSeed(repositories, true);
    await mergeWtaTourSeed(repositories, true);

    const wtaTour = await repositories.tourRepository.getByAbbreviation("WTA");
    const wtaTournaments = await repositories.tournamentRepository.listByTour(
      wtaTour!.id,
    );

    expect(wtaTournaments).toHaveLength(WTA_TOURNAMENT_SEED_DATA.length);

    for (const tournament of wtaTournaments) {
      const seed = WTA_TOURNAMENT_SEED_DATA.find(
        (entry) => entry.slug === tournament.slug,
      );
      expect(tournament.scheduleReference).toEqual(
        seed?.scheduleReference ?? null,
      );
    }
  });
});
