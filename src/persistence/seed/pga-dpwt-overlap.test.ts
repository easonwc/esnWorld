import { describe, expect, it } from "vitest";
import { DP_WORLD_TOURNAMENT_SEED_DATA } from "./dp-world-tour.data";
import { PGA_TOURNAMENT_SEED_DATA } from "./pga-tour.data";
import type { GolfTournamentSeedEntry } from "./golf-tour-seed.types";

type CatalogEntry = GolfTournamentSeedEntry & {
  venues?: readonly { venueName: string }[];
};

function allVenues(entry: CatalogEntry): string[] {
  return entry.venues?.map((venue) => venue.venueName) ?? [];
}

function schedulesOverlap(
  left: GolfTournamentSeedEntry,
  right: GolfTournamentSeedEntry,
  durationDays = 4,
): boolean {
  const leftStart = new Date(2026, left.seasonStartMonth - 1, left.seasonStartDay);
  const rightStart = new Date(2026, right.seasonStartMonth - 1, right.seasonStartDay);
  const leftEnd = new Date(leftStart);
  leftEnd.setDate(leftEnd.getDate() + durationDays - 1);
  const rightEnd = new Date(rightStart);
  rightEnd.setDate(rightEnd.getDate() + durationDays - 1);
  return leftStart <= rightEnd && rightStart <= leftEnd;
}

describe("PGA vs DP World catalog overlap", () => {
  it("references every DP World tournament that would conflict with PGA materialization", () => {
    const unreferencedConflicts: string[] = [];

    for (const dpwt of DP_WORLD_TOURNAMENT_SEED_DATA) {
      const dpwtVenues = new Set(allVenues(dpwt));
      for (const pga of PGA_TOURNAMENT_SEED_DATA) {
        const sharedVenues = allVenues(pga).filter((venue) => dpwtVenues.has(venue));
        if (sharedVenues.length === 0 || !schedulesOverlap(pga, dpwt)) {
          continue;
        }
        if (!dpwt.scheduleReference) {
          unreferencedConflicts.push(
            `${dpwt.slug} ↔ ${pga.slug} @ ${sharedVenues.join(", ")}`,
          );
        }
      }
    }

    expect(unreferencedConflicts).toEqual([]);
  });
});
