export class TeamError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "TeamError";
    this.code = code;
  }
}

export const TeamErrorCodes = {
  INVALID_ACTION: "INVALID_ACTION",
  INVALID_NAME: "INVALID_NAME",
  INVALID_ABBREVIATION: "INVALID_ABBREVIATION",
  INVALID_LOGO: "INVALID_LOGO",
  INVALID_DIVISION_ID: "INVALID_DIVISION_ID",
  INVALID_VENUE_ID: "INVALID_VENUE_ID",
  MISSING_ID: "MISSING_ID",
  TEAM_NOT_FOUND: "TEAM_NOT_FOUND",
  DIVISION_NOT_FOUND: "DIVISION_NOT_FOUND",
  VENUE_NOT_FOUND: "VENUE_NOT_FOUND",
} as const;
