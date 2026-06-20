import { parseBoolean } from "../env";

export interface PgaTourSeedConfig {
  enabled: boolean;
}

export interface PgaTourScheduleReleaseConfig {
  month: number;
  day: number;
  hour: number;
  timezone: string;
}

export function loadPgaTourSeedConfig(
  env: NodeJS.ProcessEnv = process.env,
): PgaTourSeedConfig {
  return {
    enabled: parseBoolean(env.PGA_TOUR_SEED_ON_STARTUP, false),
  };
}

export function loadPgaTourScheduleReleaseConfig(
  env: NodeJS.ProcessEnv = process.env,
): PgaTourScheduleReleaseConfig {
  const month = Number.parseInt(env.PGA_TOUR_SCHEDULE_RELEASE_MONTH ?? "10", 10);
  const day = Number.parseInt(env.PGA_TOUR_SCHEDULE_RELEASE_DAY ?? "1", 10);
  const hour = Number.parseInt(env.PGA_TOUR_SCHEDULE_RELEASE_HOUR ?? "0", 10);

  return {
    month: Number.isFinite(month) ? month : 10,
    day: Number.isFinite(day) ? day : 1,
    hour: Number.isFinite(hour) ? hour : 0,
    timezone: env.PGA_TOUR_SCHEDULE_RELEASE_TIMEZONE ?? "America/New_York",
  };
}

export function isPgaTourEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return parseBoolean(env.PGA_TOUR_ENABLED, false);
}
