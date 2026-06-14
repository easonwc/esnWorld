import { WorldClockError, WorldClockErrorCodes } from "./errors";
import type {
  WorldClockInput,
  WorldClockOutput,
  WorldClockResult,
  WorldClockState,
} from "./types";

const ISO_UTC_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;

export function createInitialState(epochMs?: number): WorldClockState {
  return { epochMs: epochMs ?? Date.now() };
}

export function toWorldClockOutput(
  epochMs: number,
  meta?: { isRunning: boolean; simulatedMsPerRealMs: number },
): WorldClockOutput {
  const date = new Date(epochMs);

  return {
    isoUtc: date.toISOString(),
    epochMs,
    isRunning: meta?.isRunning ?? false,
    simulatedMsPerRealMs: meta?.simulatedMsPerRealMs ?? 60,
    utc: {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
      hour: date.getUTCHours(),
      minute: date.getUTCMinutes(),
      second: date.getUTCSeconds(),
      millisecond: date.getUTCMilliseconds(),
    },
  };
}

function parseIsoUtc(isoUtc: string): number {
  if (!ISO_UTC_PATTERN.test(isoUtc)) {
    throw new WorldClockError(
      WorldClockErrorCodes.INVALID_ISO_UTC,
      `isoUtc must be a valid UTC ISO 8601 string ending with Z, received: ${isoUtc}`,
    );
  }

  const epochMs = Date.parse(isoUtc);

  if (Number.isNaN(epochMs)) {
    throw new WorldClockError(
      WorldClockErrorCodes.INVALID_ISO_UTC,
      `isoUtc could not be parsed as a valid datetime: ${isoUtc}`,
    );
  }

  return epochMs;
}

function validateAdvanceMs(milliseconds: unknown): number {
  if (milliseconds === undefined || milliseconds === null) {
    throw new WorldClockError(
      WorldClockErrorCodes.MISSING_ADVANCE_MS,
      "milliseconds is required for advance action",
    );
  }

  if (typeof milliseconds !== "number" || !Number.isFinite(milliseconds)) {
    throw new WorldClockError(
      WorldClockErrorCodes.INVALID_ADVANCE_MS,
      "milliseconds must be a finite number",
    );
  }

  if (milliseconds <= 0) {
    throw new WorldClockError(
      WorldClockErrorCodes.INVALID_ADVANCE_MS,
      "milliseconds must be a positive number",
    );
  }

  return milliseconds;
}

export function transformWorldClock(
  state: WorldClockState,
  input: WorldClockInput,
): WorldClockResult {
  let nextEpochMs = state.epochMs;

  switch (input.action) {
    case "get":
      break;

    case "set": {
      if (!input.isoUtc) {
        throw new WorldClockError(
          WorldClockErrorCodes.MISSING_ISO_UTC,
          "isoUtc is required for set action",
        );
      }
      nextEpochMs = parseIsoUtc(input.isoUtc);
      break;
    }

    case "advance": {
      const delta = validateAdvanceMs(input.milliseconds);
      nextEpochMs += delta;
      break;
    }

    default: {
      const unknownAction = (input as { action: string }).action;
      throw new WorldClockError(
        WorldClockErrorCodes.INVALID_ACTION,
        `Unknown action: ${unknownAction}`,
      );
    }
  }

  const nextState: WorldClockState = { epochMs: nextEpochMs };

  return {
    state: nextState,
    output: toWorldClockOutput(nextEpochMs),
  };
}
