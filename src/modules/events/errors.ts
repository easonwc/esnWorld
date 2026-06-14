export class EventError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "EventError";
    this.code = code;
  }
}

export const EventErrorCodes = {
  INVALID_ACTION: "INVALID_ACTION",
  INVALID_NAME: "INVALID_NAME",
  INVALID_ID: "INVALID_ID",
  MISSING_ID: "MISSING_ID",
  MISSING_VENUE_ID: "MISSING_VENUE_ID",
  INVALID_LOCAL_START: "INVALID_LOCAL_START",
  INVALID_DURATION: "INVALID_DURATION",
  EVENT_NOT_FOUND: "EVENT_NOT_FOUND",
  VENUE_NOT_FOUND: "VENUE_NOT_FOUND",
  INVALID_ISO_UTC: "INVALID_ISO_UTC",
} as const;
