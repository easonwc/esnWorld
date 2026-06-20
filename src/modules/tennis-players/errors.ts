export class TennisPlayerError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "TennisPlayerError";
    this.code = code;
  }
}

export const TennisPlayerErrorCodes = {
  INVALID_ACTION: "INVALID_ACTION",
  MISSING_ID: "MISSING_ID",
  INVALID_HUMAN_ID: "INVALID_HUMAN_ID",
  INVALID_SKILLS: "INVALID_SKILLS",
  INVALID_BACKHAND_STYLE: "INVALID_BACKHAND_STYLE",
  INVALID_TURNED_PRO_YEAR: "INVALID_TURNED_PRO_YEAR",
  TENNIS_PLAYER_NOT_FOUND: "TENNIS_PLAYER_NOT_FOUND",
  HUMAN_NOT_FOUND: "HUMAN_NOT_FOUND",
  TENNIS_PLAYER_ALREADY_EXISTS: "TENNIS_PLAYER_ALREADY_EXISTS",
} as const;
