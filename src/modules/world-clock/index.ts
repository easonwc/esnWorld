import { registerGolfClockHandlers } from "@/modules/golf/register";
import { getDb } from "@/persistence/db";
import {
  loadWorldClockTickerState,
  saveWorldClockTickerState,
} from "@/persistence/world-clock-state";
import { loadWorldClockConfig } from "./config";
import {
  armWorldClockScheduler,
  finalizeWorldClockScheduler,
  runClockTransitionHandlers,
} from "./clock-scheduler";
import { WorldClockError, WorldClockErrorCodes } from "./errors";
import {
  computeCurrentEpochMs,
  createTickerState,
  startTicker,
  stopTicker,
  type WorldClockTickerState,
} from "./tick";
import { createInitialState, toWorldClockOutput, transformWorldClock } from "./transform";
import type { WorldClockInput, WorldClockOutput } from "./types";

const ISO_UTC_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;

const globalForWorldClock = globalThis as typeof globalThis & {
  __worldClockService?: WorldClockService;
};

function parseInitialEpochMs(isoUtc: string): number {
  if (!ISO_UTC_PATTERN.test(isoUtc)) {
    throw new WorldClockError(
      WorldClockErrorCodes.INVALID_ISO_UTC,
      `WORLD_CLOCK_INITIAL_ISO_UTC must be a valid UTC ISO 8601 string ending with Z, received: ${isoUtc}`,
    );
  }

  const epochMs = Date.parse(isoUtc);

  if (Number.isNaN(epochMs)) {
    throw new WorldClockError(
      WorldClockErrorCodes.INVALID_ISO_UTC,
      `WORLD_CLOCK_INITIAL_ISO_UTC could not be parsed: ${isoUtc}`,
    );
  }

  return epochMs;
}

export interface WorldClockServiceOptions {
  initialEpochMs?: number;
  simulatedMsPerRealMs?: number;
  now?: () => number;
  initialTicker?: WorldClockTickerState;
  persistTicker?: (ticker: WorldClockTickerState) => void;
}

export class WorldClockService {
  private ticker: WorldClockTickerState;
  private readonly now: () => number;
  private readonly persistTicker?: (ticker: WorldClockTickerState) => void;

  constructor(options: WorldClockServiceOptions = {}) {
    const config = loadWorldClockConfig();
    const initialEpochMs =
      options.initialEpochMs ?? parseInitialEpochMs(config.initialIsoUtc);
    const simulatedMsPerRealMs =
      options.simulatedMsPerRealMs ?? config.simulatedMsPerRealMs;

    this.now = options.now ?? Date.now;
    this.persistTicker = options.persistTicker;
    this.ticker =
      options.initialTicker ??
      createTickerState(initialEpochMs, simulatedMsPerRealMs);
  }

  private saveTickerState(): void {
    this.persistTicker?.({
      epochMs: computeCurrentEpochMs(this.ticker, this.now()),
      isRunning: this.ticker.isRunning,
      lastStartedAtRealMs: this.ticker.lastStartedAtRealMs,
      simulatedMsPerRealMs: this.ticker.simulatedMsPerRealMs,
    });
  }

  getTickerState(): WorldClockTickerState {
    return { ...this.ticker };
  }

  getCurrentOutput(): WorldClockOutput {
    const epochMs = computeCurrentEpochMs(this.ticker, this.now());
    return toWorldClockOutput(epochMs, {
      isRunning: this.ticker.isRunning,
      simulatedMsPerRealMs: this.ticker.simulatedMsPerRealMs,
    });
  }

  start(): WorldClockOutput {
    this.ticker = startTicker(this.ticker, this.now());
    this.saveTickerState();
    const output = this.getCurrentOutput();
    armWorldClockScheduler(() => this.getCurrentOutput().isoUtc);
    return output;
  }

  stop(): WorldClockOutput {
    const beforeIsoUtc = this.getCurrentOutput().isoUtc;
    this.ticker = stopTicker(this.ticker, this.now());
    this.saveTickerState();
    const afterIsoUtc = this.getCurrentOutput().isoUtc;
    void finalizeWorldClockScheduler(beforeIsoUtc, afterIsoUtc);
    return this.getCurrentOutput();
  }

  execute(input: WorldClockInput): WorldClockOutput {
    if (input.action === "get") {
      return this.getCurrentOutput();
    }

    const beforeIsoUtc = this.getCurrentOutput().isoUtc;
    const currentEpochMs = computeCurrentEpochMs(this.ticker, this.now());
    const wasRunning = this.ticker.isRunning;

    const result = transformWorldClock(
      createInitialState(currentEpochMs),
      input,
    );

    this.ticker = {
      ...this.ticker,
      epochMs: result.state.epochMs,
      lastStartedAtRealMs: wasRunning ? this.now() : null,
    };

    this.saveTickerState();
    const afterIsoUtc = this.getCurrentOutput().isoUtc;
    void runClockTransitionHandlers(beforeIsoUtc, afterIsoUtc);
    return this.getCurrentOutput();
  }
}

let singleton: WorldClockService | null = null;

function createWorldClockPersistenceOptions(): Pick<
  WorldClockServiceOptions,
  "initialTicker" | "persistTicker"
> {
  if (process.env.VITEST === "true") {
    return {};
  }

  const db = getDb();
  const initialTicker = loadWorldClockTickerState(db) ?? undefined;

  return {
    initialTicker,
    persistTicker: (ticker) => saveWorldClockTickerState(db, ticker),
  };
}

export function getWorldClockService(): WorldClockService {
  registerGolfClockHandlers();

  if (globalForWorldClock.__worldClockService) {
    return globalForWorldClock.__worldClockService;
  }

  if (!singleton) {
    singleton = new WorldClockService(createWorldClockPersistenceOptions());
    if (singleton.getTickerState().isRunning) {
      armWorldClockScheduler(() => singleton!.getCurrentOutput().isoUtc);
    }
  }

  globalForWorldClock.__worldClockService = singleton;
  return singleton;
}

export function resetWorldClockService(
  options?: WorldClockServiceOptions,
): WorldClockService {
  singleton = new WorldClockService(options);
  globalForWorldClock.__worldClockService = singleton;
  return singleton;
}

export * from "./types";
export * from "./errors";
export { loadWorldClockConfig } from "./config";
export {
  computeCurrentEpochMs,
  createTickerState,
  startTicker,
  stopTicker,
} from "./tick";
export {
  armWorldClockScheduler,
  clearClockTransitionHandlers,
  disarmWorldClockScheduler,
  finalizeWorldClockScheduler,
  registerClockTransitionHandler,
  runClockTransitionHandlers,
} from "./clock-scheduler";
export { createInitialState, toWorldClockOutput, transformWorldClock } from "./transform";
