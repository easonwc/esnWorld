export class CalendarError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "CalendarError";
    this.code = code;
  }
}

export const CalendarErrorCodes = {
  INVALID_ACTION: "INVALID_ACTION",
  INVALID_ISO_UTC: "INVALID_ISO_UTC",
  MISSING_ISO_UTC: "MISSING_ISO_UTC",
  INVALID_YEAR: "INVALID_YEAR",
  INVALID_MONTH: "INVALID_MONTH",
  INVALID_DAY: "INVALID_DAY",
  INVALID_TIME: "INVALID_TIME",
} as const;
