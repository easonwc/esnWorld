import { describe, expect, it } from "vitest";
import {
  orderRotationVenueLinks,
  preferredRotationIndex,
} from "./venue-pick";
import type { GolfTournament, GolfTournamentVenue } from "./types";

const rotationTournament: GolfTournament = {
  id: "tournament-1",
  tourId: "tour-1",
  slug: "test-rotation",
  name: "Test Rotation",
  isMajor: true,
  purseUsd: 10_000_000,
  entryCriteria: { kind: "open", description: "Open field" },
  venueMode: "rotation",
  typicalDurationDays: 4,
  teeGroupCount: 3,
  fieldSize: 156,
  seasonStartMonth: 5,
  seasonStartDay: 15,
  rotationEpochYear: 2020,
  sortOrder: 1,
  materializeOnSchedule: true,
  scheduleReference: null,
};

function venueLink(rotationOrder: number): GolfTournamentVenue {
  return {
    id: `link-${rotationOrder}`,
    tournamentId: rotationTournament.id,
    venueId: `venue-${rotationOrder}`,
    rotationOrder,
    isDefault: rotationOrder === 0,
  };
}

describe("orderRotationVenueLinks", () => {
  it("starts at the epoch-preferred index and walks the pool", () => {
    const links = [0, 1, 2, 3].map((order) => venueLink(order));

    expect(preferredRotationIndex(rotationTournament, links.length, 2026)).toBe(2);

    const ordered = orderRotationVenueLinks(rotationTournament, links, 2026);
    expect(ordered.map((link) => link.rotationOrder)).toEqual([2, 3, 0, 1]);
  });
});
