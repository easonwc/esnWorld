export type WorldClockAction = "get" | "set" | "advance";

export interface WorldClockGetInput {
  action: "get";
}

export interface WorldClockSetInput {
  action: "set";
  /** ISO 8601 UTC datetime, e.g. "2026-06-14T12:00:00.000Z" */
  isoUtc: string;
}

export interface WorldClockAdvanceInput {
  action: "advance";
  /** Milliseconds to advance the world clock */
  milliseconds: number;
}

export type WorldClockInput =
  | WorldClockGetInput
  | WorldClockSetInput
  | WorldClockAdvanceInput;

export interface WorldClockState {
  /** Current world time as milliseconds since Unix epoch (UTC) */
  epochMs: number;
}

export interface WorldClockOutput {
  /** ISO 8601 UTC datetime */
  isoUtc: string;
  /** Milliseconds since Unix epoch */
  epochMs: number;
  /** Whether the clock is actively advancing */
  isRunning: boolean;
  /** Simulated milliseconds advanced per real millisecond */
  simulatedMsPerRealMs: number;
  /** Decomposed UTC components for calendar integration */
  utc: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    millisecond: number;
  };
}

export interface WorldClockResult {
  state: WorldClockState;
  output: WorldClockOutput;
}
