export class GolferError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "GolferError";
    this.code = code;
  }
}

export const GolferErrorCodes = {
  INVALID_ACTION: "INVALID_ACTION",
  MISSING_ID: "MISSING_ID",
  INVALID_HUMAN_ID: "INVALID_HUMAN_ID",
  INVALID_SKILLS: "INVALID_SKILLS",
  INVALID_TURNED_PRO_YEAR: "INVALID_TURNED_PRO_YEAR",
  GOLFER_NOT_FOUND: "GOLFER_NOT_FOUND",
  HUMAN_NOT_FOUND: "HUMAN_NOT_FOUND",
  GOLFER_ALREADY_EXISTS: "GOLFER_ALREADY_EXISTS",
} as const;
