import { WorldClockError, WorldClockErrorCodes } from "./errors";

export const DEFAULT_INITIAL_ISO_UTC = "2020-01-01T00:00:00.000Z";
export const DEFAULT_SIMULATED_MS_PER_REAL_MS = 60;

export interface WorldClockConfig {
  initialIsoUtc: string;
  simulatedMsPerRealMs: number;
}

export function loadWorldClockConfig(
  env: NodeJS.ProcessEnv = process.env,
): WorldClockConfig {
  const initialIsoUtc =
    env.WORLD_CLOCK_INITIAL_ISO_UTC ?? DEFAULT_INITIAL_ISO_UTC;

  const rawRate =
    env.WORLD_CLOCK_SIMULATED_MS_PER_REAL_MS ??
    String(DEFAULT_SIMULATED_MS_PER_REAL_MS);

  const simulatedMsPerRealMs = Number(rawRate);

  if (!Number.isFinite(simulatedMsPerRealMs) || simulatedMsPerRealMs <= 0) {
    throw new WorldClockError(
      WorldClockErrorCodes.INVALID_TICK_RATE,
      `WORLD_CLOCK_SIMULATED_MS_PER_REAL_MS must be a positive number, received: ${rawRate}`,
    );
  }

  return { initialIsoUtc, simulatedMsPerRealMs };
}
