import { parseBoolean } from "../env";

export interface TennisTourSeedConfig {
  enabled: boolean;
}

export interface TennisTourScheduleReleaseConfig {
  month: number;
  day: number;
  hour: number;
  timezone: string;
}

export type AtpTourSeedConfig = TennisTourSeedConfig;
export type AtpTourScheduleReleaseConfig = TennisTourScheduleReleaseConfig;
export type WtaTourSeedConfig = TennisTourSeedConfig;
export type WtaTourScheduleReleaseConfig = TennisTourScheduleReleaseConfig;

function loadTennisTourScheduleReleaseConfig(
  env: NodeJS.ProcessEnv,
  prefix: "ATP_TOUR" | "WTA_TOUR",
): TennisTourScheduleReleaseConfig {
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

export function loadAtpTourSeedConfig(
  env: NodeJS.ProcessEnv = process.env,
): AtpTourSeedConfig {
  return {
    enabled: parseBoolean(env.ATP_TOUR_SEED_ON_STARTUP, false),
  };
}

export function loadWtaTourSeedConfig(
  env: NodeJS.ProcessEnv = process.env,
): WtaTourSeedConfig {
  return {
    enabled: parseBoolean(env.WTA_TOUR_SEED_ON_STARTUP, false),
  };
}

export function loadAtpTourScheduleReleaseConfig(
  env: NodeJS.ProcessEnv = process.env,
): AtpTourScheduleReleaseConfig {
  return loadTennisTourScheduleReleaseConfig(env, "ATP_TOUR");
}

export function loadWtaTourScheduleReleaseConfig(
  env: NodeJS.ProcessEnv = process.env,
): WtaTourScheduleReleaseConfig {
  return loadTennisTourScheduleReleaseConfig(env, "WTA_TOUR");
}

export function isAtpTourEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return parseBoolean(env.ATP_TOUR_ENABLED, false);
}

export function isWtaTourEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return parseBoolean(env.WTA_TOUR_ENABLED, false);
}
