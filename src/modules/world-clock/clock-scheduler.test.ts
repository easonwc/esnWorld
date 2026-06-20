import { describe, expect, it } from "vitest";
import {
  clearClockTransitionHandlers,
  registerClockTransitionHandler,
  runClockTransitionHandlers,
} from "./clock-scheduler";

describe("clock scheduler handlers", () => {
  it("shares registered handlers via globalThis", async () => {
    clearClockTransitionHandlers();

    const seen: string[] = [];
    registerClockTransitionHandler(async (beforeIsoUtc, afterIsoUtc) => {
      seen.push(`${beforeIsoUtc}->${afterIsoUtc}`);
    });

    await runClockTransitionHandlers(
      "2020-09-30T00:00:00.000Z",
      "2020-10-02T00:00:00.000Z",
    );

    expect(seen).toEqual([
      "2020-09-30T00:00:00.000Z->2020-10-02T00:00:00.000Z",
    ]);
  });
});
