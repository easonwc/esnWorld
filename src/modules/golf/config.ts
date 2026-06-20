import {
  loadPgaTourScheduleReleaseConfig,
  loadPgaTourSeedConfig,
  isPgaTourEnabled,
} from "@/persistence/seed/golf-config";

export function loadPgaTourRuntimeConfig(
  env: NodeJS.ProcessEnv = process.env,
) {
  return {
    enabled: isPgaTourEnabled(env),
    seed: loadPgaTourSeedConfig(env),
    scheduleRelease: loadPgaTourScheduleReleaseConfig(env),
  };
}
