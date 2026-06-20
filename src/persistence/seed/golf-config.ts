import { parseBoolean } from "../env";

export interface GolfTourSeedConfig {
  enabled: boolean;
}

export interface GolfTourScheduleReleaseConfig {
  month: number;
  day: number;
  hour: number;
  timezone: string;
}

export type PgaTourSeedConfig = GolfTourSeedConfig;
export type PgaTourScheduleReleaseConfig = GolfTourScheduleReleaseConfig;
export type LpgaTourSeedConfig = GolfTourSeedConfig;
export type LpgaTourScheduleReleaseConfig = GolfTourScheduleReleaseConfig;

function loadGolfTourScheduleReleaseConfig(
  env: NodeJS.ProcessEnv,
  prefix: "PGA_TOUR" | "LPGA_TOUR",
): GolfTourScheduleReleaseConfig {
  const month = Number.parseInt(env[`${prefix}_SCHEDULE_RELEASE_MONTH`] ?? "10", 10);
  const day = Number.parseInt(env[`${prefix}_SCHEDULE_RELEASE_DAY`] ?? "1", 10);
  const hour = Number.parseInt(env[`${prefix}_SCHEDULE_RELEASE_HOUR`] ?? "0", 10);

  return {
    month: Number.isFinite(month) ? month : 10,
    day: Number.isFinite(day) ? day : 1,
    hour: Number.isFinite(hour) ? hour : 0,
    timezone: env[`${prefix}_SCHEDULE_RELEASE_TIMEZONE`] ?? "America/New_York",
  };
}

export function loadPgaTourSeedConfig(
  env: NodeJS.ProcessEnv = process.env,
): PgaTourSeedConfig {
  return {
    enabled: parseBoolean(env.PGA_TOUR_SEED_ON_STARTUP, false),
  };
}

export function loadLpgaTourSeedConfig(
  env: NodeJS.ProcessEnv = process.env,
): LpgaTourSeedConfig {
  return {
    enabled: parseBoolean(env.LPGA_TOUR_SEED_ON_STARTUP, false),
  };
}

export function loadPgaTourScheduleReleaseConfig(
  env: NodeJS.ProcessEnv = process.env,
): PgaTourScheduleReleaseConfig {
  return loadGolfTourScheduleReleaseConfig(env, "PGA_TOUR");
}

export function loadLpgaTourScheduleReleaseConfig(
  env: NodeJS.ProcessEnv = process.env,
): LpgaTourScheduleReleaseConfig {
  return loadGolfTourScheduleReleaseConfig(env, "LPGA_TOUR");
}

export function isPgaTourEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return parseBoolean(env.PGA_TOUR_ENABLED, false);
}

export function isLpgaTourEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return parseBoolean(env.LPGA_TOUR_ENABLED, false);
}
