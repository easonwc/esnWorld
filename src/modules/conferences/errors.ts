export class ConferenceError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "ConferenceError";
    this.code = code;
  }
}

export const ConferenceErrorCodes = {
  INVALID_ACTION: "INVALID_ACTION",
  INVALID_NAME: "INVALID_NAME",
  INVALID_ABBREVIATION: "INVALID_ABBREVIATION",
  INVALID_LEAGUE_ID: "INVALID_LEAGUE_ID",
  MISSING_ID: "MISSING_ID",
  CONFERENCE_NOT_FOUND: "CONFERENCE_NOT_FOUND",
  LEAGUE_NOT_FOUND: "LEAGUE_NOT_FOUND",
  CONFERENCE_HAS_DIVISIONS: "CONFERENCE_HAS_DIVISIONS",
} as const;
