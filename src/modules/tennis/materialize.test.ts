import { describe, expect, it } from "vitest";
import { buildTournamentEventTree } from "./materialize";
import type { TennisTournament } from "./types";

const slam: TennisTournament = {
  id: "tournament-1",
  tourId: "tour-1",
  slug: "australian-open",
  name: "Australian Open",
  isMajor: true,
  prizeMoneyUsd: 86_500_000,
  entryCriteria: { kind: "open", description: "Open draw" },
  venueMode: "fixed",
  typicalDurationDays: 14,
  activeCourtCount: 4,
  drawSize: 128,
  seasonStartMonth: 1,
  seasonStartDay: 12,
  rotationEpochYear: null,
  sortOrder: 1,
  materializeOnSchedule: true,
  scheduleReference: null,
};

describe("buildTournamentEventTree", () => {
  it("schedules courts from activeCourtCount, not main-draw drawSize", () => {
    const courts = Array.from({ length: 8 }, (_, index) => ({
      id: `court-${index + 1}`,
      venueId: "venue-1",
      name: `Court ${index + 1}`,
      resourceType: "court" as const,
    }));

    const events = buildTournamentEventTree({
      tournament: slam,
      seasonYear: 2026,
      venueId: "venue-1",
      timezone: "Australia/Melbourne",
      courts,
    });

    const courtEvents = events.filter((event) => event.name.startsWith("Court"));
    const dayEvents = events.filter((event) => event.name.startsWith("Day"));

    expect(dayEvents).toHaveLength(14);
    expect(courtEvents).toHaveLength(4 * 14);
    expect(new Set(courtEvents.map((event) => event.name))).toEqual(
      new Set(["Court 1", "Court 2", "Court 3", "Court 4"]),
    );
  });

  it("throws when the venue has fewer courts than activeCourtCount", () => {
    const courts = Array.from({ length: 2 }, (_, index) => ({
      id: `court-${index + 1}`,
      venueId: "venue-1",
      name: `Court ${index + 1}`,
      resourceType: "court" as const,
    }));

    expect(() =>
      buildTournamentEventTree({
        tournament: slam,
        seasonYear: 2026,
        venueId: "venue-1",
        timezone: "Australia/Melbourne",
        courts,
      }),
    ).toThrow(/requires 4/);
  });
});
