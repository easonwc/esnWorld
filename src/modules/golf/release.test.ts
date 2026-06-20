import { describe, expect, it } from "vitest";
import {
  computeReleaseInstantUtc,
  findCrossedReleaseYears,
  seasonYearForRelease,
} from "@/modules/golf/release";

describe("golf release schedule", () => {
  const config = {
    month: 10,
    day: 1,
    hour: 0,
    timezone: "America/New_York",
  };

  it("maps Oct 1 release to the next calendar season year", () => {
    expect(seasonYearForRelease(2025)).toBe(2026);
  });

  it("detects crossing Oct 1 release instant", () => {
    const releaseIso = computeReleaseInstantUtc(2025, config);
    const before = new Date(Date.parse(releaseIso) - 60_000).toISOString();
    const after = new Date(Date.parse(releaseIso) + 60_000).toISOString();

    expect(findCrossedReleaseYears(before, after, config)).toEqual([2025]);
  });
});
