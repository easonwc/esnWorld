export const GolfWorldRankingErrorCodes = {
  INVALID_ACTION: "INVALID_ACTION",
  MISSING_ID: "MISSING_ID",
  INVALID_GOLFER_ID: "INVALID_GOLFER_ID",
  INVALID_RANKING_SYSTEM: "INVALID_RANKING_SYSTEM",
  INVALID_AS_OF_DATE: "INVALID_AS_OF_DATE",
  INVALID_RANK: "INVALID_RANK",
  INVALID_RANKING_POINTS: "INVALID_RANKING_POINTS",
  INVALID_OVERALL_SKILL: "INVALID_OVERALL_SKILL",
  RANKING_NOT_FOUND: "RANKING_NOT_FOUND",
  GOLFER_NOT_FOUND: "GOLFER_NOT_FOUND",
  RANKING_ALREADY_EXISTS: "RANKING_ALREADY_EXISTS",
  GOLFER_NOT_ELIGIBLE: "GOLFER_NOT_ELIGIBLE",
} as const;

export type GolfWorldRankingErrorCode =
  (typeof GolfWorldRankingErrorCodes)[keyof typeof GolfWorldRankingErrorCodes];

export class GolfWorldRankingError extends Error {
  constructor(
    public readonly code: GolfWorldRankingErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "GolfWorldRankingError";
  }
}
