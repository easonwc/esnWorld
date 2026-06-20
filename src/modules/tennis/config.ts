import {
  isAtpTourEnabled,
  isWtaTourEnabled,
  loadAtpTourScheduleReleaseConfig,
  loadAtpTourSeedConfig,
  loadWtaTourScheduleReleaseConfig,
  loadWtaTourSeedConfig,
} from "@/persistence/seed/tennis-config";

export function loadAtpTourRuntimeConfig(
  env: NodeJS.ProcessEnv = process.env,
) {
  return {
    enabled: isAtpTourEnabled(env),
    seed: loadAtpTourSeedConfig(env),
    scheduleRelease: loadAtpTourScheduleReleaseConfig(env),
  };
}

export function loadWtaTourRuntimeConfig(
  env: NodeJS.ProcessEnv = process.env,
) {
  return {
    enabled: isWtaTourEnabled(env),
    seed: loadWtaTourSeedConfig(env),
    scheduleRelease: loadWtaTourScheduleReleaseConfig(env),
  };
}
