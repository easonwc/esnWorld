export class LeagueError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "LeagueError";
    this.code = code;
  }
}

export const LeagueErrorCodes = {
  INVALID_ACTION: "INVALID_ACTION",
  INVALID_NAME: "INVALID_NAME",
  INVALID_ABBREVIATION: "INVALID_ABBREVIATION",
  INVALID_ID: "INVALID_ID",
  MISSING_ID: "MISSING_ID",
  LEAGUE_NOT_FOUND: "LEAGUE_NOT_FOUND",
  LEAGUE_HAS_TEAMS: "LEAGUE_HAS_TEAMS",
  INVALID_LOGO: "INVALID_LOGO",
} as const;
