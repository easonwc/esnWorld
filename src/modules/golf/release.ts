import { localTimeToIsoUtc } from "@/modules/locations";
import type { PgaTourScheduleReleaseConfig } from "@/persistence/seed/golf-config";

export function computeReleaseInstantUtc(
  releaseYear: number,
  config: PgaTourScheduleReleaseConfig,
): string {
  return localTimeToIsoUtc(
    {
      year: releaseYear,
      month: config.month,
      day: config.day,
      hour: config.hour,
      minute: 0,
      second: 0,
    },
    config.timezone,
  );
}

/** Release years whose instant was crossed moving from beforeIso to afterIso. */
export function findCrossedReleaseYears(
  beforeIso: string,
  afterIso: string,
  config: PgaTourScheduleReleaseConfig,
): number[] {
  const beforeMs = Date.parse(beforeIso);
  const afterMs = Date.parse(afterIso);

  if (!Number.isFinite(beforeMs) || !Number.isFinite(afterMs) || afterMs <= beforeMs) {
    return [];
  }

  const startYear = new Date(beforeMs).getUTCFullYear() - 1;
  const endYear = new Date(afterMs).getUTCFullYear() + 1;
  const crossed: number[] = [];

  for (let releaseYear = startYear; releaseYear <= endYear; releaseYear += 1) {
    const releaseMs = Date.parse(computeReleaseInstantUtc(releaseYear, config));
    if (beforeMs < releaseMs && afterMs >= releaseMs) {
      crossed.push(releaseYear);
    }
  }

  return crossed;
}

/** Oct 1 release in releaseYear schedules the next calendar year season. */
export function seasonYearForRelease(releaseYear: number): number {
  return releaseYear + 1;
}
