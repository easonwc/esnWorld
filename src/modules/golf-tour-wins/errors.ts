export const GolfTourWinErrorCodes = {
  INVALID_ACTION: "INVALID_ACTION",
  MISSING_ID: "MISSING_ID",
  INVALID_GOLFER_ID: "INVALID_GOLFER_ID",
  INVALID_TOUR_ID: "INVALID_TOUR_ID",
  INVALID_SEASON_YEAR: "INVALID_SEASON_YEAR",
  INVALID_TOURNAMENT_ID: "INVALID_TOURNAMENT_ID",
  WIN_NOT_FOUND: "WIN_NOT_FOUND",
  GOLFER_NOT_FOUND: "GOLFER_NOT_FOUND",
  TOUR_NOT_FOUND: "TOUR_NOT_FOUND",
  GOLFER_NOT_ELIGIBLE: "GOLFER_NOT_ELIGIBLE",
} as const;

export type GolfTourWinErrorCode =
  (typeof GolfTourWinErrorCodes)[keyof typeof GolfTourWinErrorCodes];

export class GolfTourWinError extends Error {
  constructor(
    public readonly code: GolfTourWinErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "GolfTourWinError";
  }
}
