export class CountryError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "CountryError";
    this.code = code;
  }
}

export const CountryErrorCodes = {
  INVALID_ACTION: "INVALID_ACTION",
  INVALID_NAME: "INVALID_NAME",
  INVALID_FLAG: "INVALID_FLAG",
  INVALID_ISO_CODE: "INVALID_ISO_CODE",
  INVALID_LANGUAGES: "INVALID_LANGUAGES",
  INVALID_ID: "INVALID_ID",
  MISSING_ID: "MISSING_ID",
  COUNTRY_NOT_FOUND: "COUNTRY_NOT_FOUND",
  COUNTRY_HAS_LOCATIONS: "COUNTRY_HAS_LOCATIONS",
} as const;
