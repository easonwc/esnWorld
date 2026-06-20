export const GolfTourMembershipErrorCodes = {
  INVALID_ACTION: "INVALID_ACTION",
  MISSING_ID: "MISSING_ID",
  INVALID_GOLFER_ID: "INVALID_GOLFER_ID",
  INVALID_TOUR_ID: "INVALID_TOUR_ID",
  INVALID_SEASON_YEAR: "INVALID_SEASON_YEAR",
  INVALID_STATUS: "INVALID_STATUS",
  INVALID_OVERALL_SKILL: "INVALID_OVERALL_SKILL",
  MEMBERSHIP_NOT_FOUND: "MEMBERSHIP_NOT_FOUND",
  GOLFER_NOT_FOUND: "GOLFER_NOT_FOUND",
  TOUR_NOT_FOUND: "TOUR_NOT_FOUND",
  MEMBERSHIP_ALREADY_EXISTS: "MEMBERSHIP_ALREADY_EXISTS",
  GOLFER_NOT_ELIGIBLE: "GOLFER_NOT_ELIGIBLE",
} as const;

export type GolfTourMembershipErrorCode =
  (typeof GolfTourMembershipErrorCodes)[keyof typeof GolfTourMembershipErrorCodes];

export class GolfTourMembershipError extends Error {
  constructor(
    public readonly code: GolfTourMembershipErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "GolfTourMembershipError";
  }
}
