import { describe, expect, it } from "vitest";
import {
  WorldClockError,
  WorldClockErrorCodes,
  createInitialState,
  toWorldClockOutput,
  transformWorldClock,
} from "@/modules/world-clock";

describe("world-clock transform", () => {
  const baseState = createInitialState(Date.parse("2026-01-15T10:30:00.000Z"));

  describe("get", () => {
    it("returns current state without mutation", () => {
      const result = transformWorldClock(baseState, { action: "get" });

      expect(result.state.epochMs).toBe(baseState.epochMs);
      expect(result.output.isoUtc).toBe("2026-01-15T10:30:00.000Z");
      expect(result.output.utc).toEqual({
        year: 2026,
        month: 1,
        day: 15,
        hour: 10,
        minute: 30,
        second: 0,
        millisecond: 0,
      });
    });
  });

  describe("set", () => {
    it("sets world time from a valid ISO UTC string", () => {
      const result = transformWorldClock(baseState, {
        action: "set",
        isoUtc: "2026-06-14T18:45:30.500Z",
      });

      expect(result.state.epochMs).toBe(Date.parse("2026-06-14T18:45:30.500Z"));
      expect(result.output.utc.month).toBe(6);
      expect(result.output.utc.day).toBe(14);
      expect(result.output.utc.hour).toBe(18);
      expect(result.output.utc.millisecond).toBe(500);
    });

    it("rejects missing isoUtc", () => {
      expect(() =>
        transformWorldClock(baseState, { action: "set", isoUtc: "" }),
      ).toThrowError(
        expect.objectContaining({
          code: WorldClockErrorCodes.MISSING_ISO_UTC,
        }),
      );
    });

    it("rejects invalid ISO UTC format", () => {
      expect(() =>
        transformWorldClock(baseState, {
          action: "set",
          isoUtc: "2026-06-14T18:45:30",
        }),
      ).toThrow(WorldClockError);

      expect(() =>
        transformWorldClock(baseState, {
          action: "set",
          isoUtc: "not-a-date",
        }),
      ).toThrowError(
        expect.objectContaining({
          code: WorldClockErrorCodes.INVALID_ISO_UTC,
        }),
      );
    });
  });

  describe("advance", () => {
    it("advances time by milliseconds", () => {
      const result = transformWorldClock(baseState, {
        action: "advance",
        milliseconds: 90_000,
      });

      expect(result.output.isoUtc).toBe("2026-01-15T10:31:30.000Z");
    });

    it("rejects negative milliseconds", () => {
      expect(() =>
        transformWorldClock(baseState, {
          action: "advance",
          milliseconds: -30_000,
        }),
      ).toThrowError(
        expect.objectContaining({
          code: WorldClockErrorCodes.INVALID_ADVANCE_MS,
        }),
      );
    });

    it("rejects zero milliseconds", () => {
      expect(() =>
        transformWorldClock(baseState, {
          action: "advance",
          milliseconds: 0,
        }),
      ).toThrowError(
        expect.objectContaining({
          code: WorldClockErrorCodes.INVALID_ADVANCE_MS,
        }),
      );
    });

    it("rejects non-finite milliseconds", () => {
      expect(() =>
        transformWorldClock(baseState, {
          action: "advance",
          milliseconds: Number.NaN,
        }),
      ).toThrowError(
        expect.objectContaining({
          code: WorldClockErrorCodes.INVALID_ADVANCE_MS,
        }),
      );
    });
  });

  describe("toWorldClockOutput", () => {
    it("decomposes UTC components correctly at year boundary", () => {
      const output = toWorldClockOutput(Date.parse("2025-12-31T23:59:59.999Z"));

      expect(output.utc).toEqual({
        year: 2025,
        month: 12,
        day: 31,
        hour: 23,
        minute: 59,
        second: 59,
        millisecond: 999,
      });
    });
  });
});
