import { WorldClockError, WorldClockErrorCodes } from "./errors";

export interface WorldClockTickerState {
  /** Frozen world epoch; base for elapsed-time calculation while running */
  epochMs: number;
  isRunning: boolean;
  lastStartedAtRealMs: number | null;
  simulatedMsPerRealMs: number;
}

export function createTickerState(
  epochMs: number,
  simulatedMsPerRealMs: number,
): WorldClockTickerState {
  return {
    epochMs,
    isRunning: false,
    lastStartedAtRealMs: null,
    simulatedMsPerRealMs,
  };
}

export function computeCurrentEpochMs(
  state: WorldClockTickerState,
  nowRealMs: number,
): number {
  if (!state.isRunning || state.lastStartedAtRealMs === null) {
    return state.epochMs;
  }

  const elapsedRealMs = nowRealMs - state.lastStartedAtRealMs;
  return state.epochMs + elapsedRealMs * state.simulatedMsPerRealMs;
}

export function startTicker(
  state: WorldClockTickerState,
  nowRealMs: number,
): WorldClockTickerState {
  if (state.isRunning) {
    throw new WorldClockError(
      WorldClockErrorCodes.CLOCK_ALREADY_RUNNING,
      "World clock is already running",
    );
  }

  return {
    ...state,
    isRunning: true,
    lastStartedAtRealMs: nowRealMs,
  };
}

export function stopTicker(
  state: WorldClockTickerState,
  nowRealMs: number,
): WorldClockTickerState {
  if (!state.isRunning) {
    throw new WorldClockError(
      WorldClockErrorCodes.CLOCK_NOT_RUNNING,
      "World clock is not running",
    );
  }

  return {
    ...state,
    epochMs: computeCurrentEpochMs(state, nowRealMs),
    isRunning: false,
    lastStartedAtRealMs: null,
  };
}
