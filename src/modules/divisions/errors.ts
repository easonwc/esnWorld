export class DivisionError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "DivisionError";
    this.code = code;
  }
}

export const DivisionErrorCodes = {
  INVALID_ACTION: "INVALID_ACTION",
  INVALID_NAME: "INVALID_NAME",
  INVALID_ABBREVIATION: "INVALID_ABBREVIATION",
  INVALID_CONFERENCE_ID: "INVALID_CONFERENCE_ID",
  MISSING_ID: "MISSING_ID",
  DIVISION_NOT_FOUND: "DIVISION_NOT_FOUND",
  CONFERENCE_NOT_FOUND: "CONFERENCE_NOT_FOUND",
  DIVISION_HAS_TEAMS: "DIVISION_HAS_TEAMS",
} as const;
