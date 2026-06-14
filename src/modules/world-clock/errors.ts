export class WorldClockError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "WorldClockError";
    this.code = code;
  }
}

export const WorldClockErrorCodes = {
  INVALID_ACTION: "INVALID_ACTION",
  INVALID_ISO_UTC: "INVALID_ISO_UTC",
  INVALID_ADVANCE_MS: "INVALID_ADVANCE_MS",
  MISSING_ISO_UTC: "MISSING_ISO_UTC",
  MISSING_ADVANCE_MS: "MISSING_ADVANCE_MS",
  INVALID_TICK_RATE: "INVALID_TICK_RATE",
  CLOCK_ALREADY_RUNNING: "CLOCK_ALREADY_RUNNING",
  CLOCK_NOT_RUNNING: "CLOCK_NOT_RUNNING",
} as const;
