import { describe, expect, it } from "vitest";
import { loadWorldClockConfig } from "./config";
import { WorldClockErrorCodes } from "./errors";
import { WorldClockService } from "./index";
import {
  computeCurrentEpochMs,
  createTickerState,
  startTicker,
  stopTicker,
} from "./tick";

const INITIAL_EPOCH = Date.parse("2020-01-01T00:00:00.000Z");

describe("world-clock config", () => {
  it("uses defaults when env vars are absent", () => {
    const config = loadWorldClockConfig({});

    expect(config.initialIsoUtc).toBe("2020-01-01T00:00:00.000Z");
    expect(config.simulatedMsPerRealMs).toBe(60);
  });

  it("reads env overrides", () => {
    const config = loadWorldClockConfig({
      WORLD_CLOCK_INITIAL_ISO_UTC: "2021-06-01T00:00:00.000Z",
      WORLD_CLOCK_SIMULATED_MS_PER_REAL_MS: "120",
    });

    expect(config.initialIsoUtc).toBe("2021-06-01T00:00:00.000Z");
    expect(config.simulatedMsPerRealMs).toBe(120);
  });

  it("rejects invalid tick rate", () => {
    expect(() =>
      loadWorldClockConfig({ WORLD_CLOCK_SIMULATED_MS_PER_REAL_MS: "0" }),
    ).toThrowError(
      expect.objectContaining({ code: WorldClockErrorCodes.INVALID_TICK_RATE }),
    );
  });
});

describe("world-clock tick", () => {
  const base = createTickerState(INITIAL_EPOCH, 60);

  it("returns frozen epoch when stopped", () => {
    expect(computeCurrentEpochMs(base, 1_000_000)).toBe(INITIAL_EPOCH);
  });

  it("advances 1 simulated minute per 1 real second", () => {
    const running = startTicker(base, 1_000_000);
    const afterOneSecond = computeCurrentEpochMs(running, 1_001_000);

    expect(afterOneSecond - INITIAL_EPOCH).toBe(60_000);
  });

  it("freezes epoch on stop", () => {
    const running = startTicker(base, 1_000_000);
    const stopped = stopTicker(running, 1_002_000);

    expect(stopped.isRunning).toBe(false);
    expect(stopped.epochMs - INITIAL_EPOCH).toBe(120_000);
    expect(computeCurrentEpochMs(stopped, 9_999_999)).toBe(stopped.epochMs);
  });

  it("rejects start when already running", () => {
    const running = startTicker(base, 1_000_000);

    expect(() => startTicker(running, 1_000_500)).toThrowError(
      expect.objectContaining({ code: WorldClockErrorCodes.CLOCK_ALREADY_RUNNING }),
    );
  });

  it("rejects stop when not running", () => {
    expect(() => stopTicker(base, 1_000_000)).toThrowError(
      expect.objectContaining({ code: WorldClockErrorCodes.CLOCK_NOT_RUNNING }),
    );
  });
});

describe("world-clock service", () => {
  it("initializes to Jan 1 2020 by default", () => {
    const service = new WorldClockService({
      initialEpochMs: INITIAL_EPOCH,
      simulatedMsPerRealMs: 60,
      now: () => 0,
    });

    const output = service.getCurrentOutput();

    expect(output.isoUtc).toBe("2020-01-01T00:00:00.000Z");
    expect(output.isRunning).toBe(false);
    expect(output.simulatedMsPerRealMs).toBe(60);
  });

  it("start and stop control ticking", () => {
    let now = 1_000_000;
    const service = new WorldClockService({
      initialEpochMs: INITIAL_EPOCH,
      simulatedMsPerRealMs: 60,
      now: () => now,
    });

    const started = service.start();
    expect(started.isRunning).toBe(true);

    now += 5_000;
    const ticking = service.getCurrentOutput();
    expect(ticking.epochMs - INITIAL_EPOCH).toBe(300_000);

    now += 2_000;
    const stopped = service.stop();
    expect(stopped.isRunning).toBe(false);
    expect(stopped.epochMs - INITIAL_EPOCH).toBe(420_000);

    now += 10_000;
    expect(service.getCurrentOutput().epochMs).toBe(stopped.epochMs);
  });
});
