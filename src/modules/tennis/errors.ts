export const TennisErrorCodes = {
  INVALID_ACTION: "INVALID_ACTION",
  TOUR_NOT_FOUND: "TOUR_NOT_FOUND",
  TOURNAMENT_NOT_FOUND: "TOURNAMENT_NOT_FOUND",
  MISSING_ID: "MISSING_ID",
  SCHEDULE_ALREADY_EXISTS: "SCHEDULE_ALREADY_EXISTS",
  SCHEDULE_BATCH_FAILED: "SCHEDULE_BATCH_FAILED",
  VENUE_NOT_FOUND: "VENUE_NOT_FOUND",
  VENUE_POOL_EMPTY: "VENUE_POOL_EMPTY",
  VENUE_POOL_EXHAUSTED: "VENUE_POOL_EXHAUSTED",
  TOUR_DISABLED: "TOUR_DISABLED",
  SCHEDULE_REFERENCE_NOT_FOUND: "SCHEDULE_REFERENCE_NOT_FOUND",
  SCHEDULING_NOT_IMPLEMENTED: "SCHEDULING_NOT_IMPLEMENTED",
} as const;

export type TennisErrorCode = (typeof TennisErrorCodes)[keyof typeof TennisErrorCodes];

export class TennisError extends Error {
  constructor(
    public readonly code: TennisErrorCode,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "TennisError";
  }
}
