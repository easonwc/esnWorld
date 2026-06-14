export class CollegeError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "CollegeError";
    this.code = code;
  }
}

export const CollegeErrorCodes = {
  INVALID_ACTION: "INVALID_ACTION",
  INVALID_NAME: "INVALID_NAME",
  INVALID_ATTENDANCE: "INVALID_ATTENDANCE",
  MISSING_ID: "MISSING_ID",
  INVALID_LOCATION_ID: "INVALID_LOCATION_ID",
  COLLEGE_NOT_FOUND: "COLLEGE_NOT_FOUND",
  LOCATION_NOT_FOUND: "LOCATION_NOT_FOUND",
} as const;
