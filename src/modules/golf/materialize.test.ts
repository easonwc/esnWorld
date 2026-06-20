import { describe, expect, it } from "vitest";
import { buildTournamentEventTree } from "./materialize";
import type { GolfTournament } from "./types";

const tournament: GolfTournament = {
  id: "tournament-1",
  tourId: "tour-1",
  slug: "test-open",
  name: "Test Open",
  isMajor: false,
  purseUsd: 10_000_000,
  entryCriteria: { kind: "open", description: "Open field" },
  venueMode: "fixed",
  typicalDurationDays: 4,
  teeGroupCount: 3,
  fieldSize: 156,
  seasonStartMonth: 3,
  seasonStartDay: 10,
  rotationEpochYear: null,
  sortOrder: 1,
};

describe("buildTournamentEventTree", () => {
  it("schedules tee groups from teeGroupCount, not golfer fieldSize", () => {
    const teeGroups = Array.from({ length: 5 }, (_, index) => ({
      id: `group-${index + 1}`,
      venueId: "venue-1",
      name: `Tee Group ${index + 1}`,
      resourceType: "tee_group" as const,
    }));

    const events = buildTournamentEventTree({
      tournament,
      seasonYear: 2026,
      venueId: "venue-1",
      timezone: "America/New_York",
      teeGroups,
    });

    const teeGroupEvents = events.filter((event) =>
      event.name.startsWith("Tee Group"),
    );

    expect(teeGroupEvents).toHaveLength(3 * 4);
    expect(
      new Set(teeGroupEvents.map((event) => event.name)),
    ).toEqual(new Set(["Tee Group 1", "Tee Group 2", "Tee Group 3"]));
  });
});
