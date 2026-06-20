export const GolfErrorCodes = {
  INVALID_ACTION: "INVALID_ACTION",
  TOUR_NOT_FOUND: "TOUR_NOT_FOUND",
  TOURNAMENT_NOT_FOUND: "TOURNAMENT_NOT_FOUND",
  MISSING_ID: "MISSING_ID",
  MISSING_ABBREVIATION: "MISSING_ABBREVIATION",
  MISSING_TOURNAMENT_ID: "MISSING_TOURNAMENT_ID",
  SCHEDULE_ALREADY_EXISTS: "SCHEDULE_ALREADY_EXISTS",
  SCHEDULE_BATCH_FAILED: "SCHEDULE_BATCH_FAILED",
  VENUE_NOT_FOUND: "VENUE_NOT_FOUND",
  VENUE_POOL_EMPTY: "VENUE_POOL_EMPTY",
  VENUE_POOL_EXHAUSTED: "VENUE_POOL_EXHAUSTED",
  TOUR_DISABLED: "TOUR_DISABLED",
  SCHEDULE_REFERENCE_NOT_FOUND: "SCHEDULE_REFERENCE_NOT_FOUND",
} as const;

export type GolfErrorCode = (typeof GolfErrorCodes)[keyof typeof GolfErrorCodes];

export class GolfError extends Error {
  constructor(
    public readonly code: GolfErrorCode,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "GolfError";
  }
}
