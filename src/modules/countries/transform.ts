import { CountryError, CountryErrorCodes } from "./errors";
import type { Country } from "./types";

export function validateName(name: unknown): string {
  if (typeof name !== "string" || name.trim().length === 0) {
    throw new CountryError(
      CountryErrorCodes.INVALID_NAME,
      "name must be a non-empty string",
    );
  }

  if (name.trim().length > 100) {
    throw new CountryError(
      CountryErrorCodes.INVALID_NAME,
      "name must be 100 characters or fewer",
    );
  }

  return name.trim();
}

export function validateIsoCode(isoCode: unknown): string {
  if (typeof isoCode !== "string" || isoCode.trim().length === 0) {
    throw new CountryError(
      CountryErrorCodes.INVALID_ISO_CODE,
      "isoCode is required",
    );
  }

  const normalized = isoCode.trim().toUpperCase();

  if (!/^[A-Z]{2}$/.test(normalized)) {
    throw new CountryError(
      CountryErrorCodes.INVALID_ISO_CODE,
      "isoCode must be a two-letter ISO 3166-1 alpha-2 code",
    );
  }

  return normalized;
}

export function validateFlag(flag: unknown): string {
  if (typeof flag !== "string" || flag.trim().length === 0) {
    throw new CountryError(
      CountryErrorCodes.INVALID_FLAG,
      "flag must be a non-empty string",
    );
  }

  const normalized = flag.trim();

  if (normalized.length > 128) {
    throw new CountryError(
      CountryErrorCodes.INVALID_FLAG,
      "flag must be 128 characters or fewer",
    );
  }

  return normalized;
}

export function validateLanguages(languages: unknown): string[] {
  if (!Array.isArray(languages) || languages.length === 0) {
    throw new CountryError(
      CountryErrorCodes.INVALID_LANGUAGES,
      "languages must be a non-empty array of strings",
    );
  }

  const normalized: string[] = [];

  for (const language of languages) {
    if (typeof language !== "string" || language.trim().length === 0) {
      throw new CountryError(
        CountryErrorCodes.INVALID_LANGUAGES,
        "each language must be a non-empty string",
      );
    }

    if (language.trim().length > 80) {
      throw new CountryError(
        CountryErrorCodes.INVALID_LANGUAGES,
        "each language must be 80 characters or fewer",
      );
    }

    normalized.push(language.trim());
  }

  return normalized;
}

export function validateId(id: unknown): string {
  if (typeof id !== "string" || id.trim().length === 0) {
    throw new CountryError(
      CountryErrorCodes.MISSING_ID,
      "id is required",
    );
  }

  return id.trim();
}

export function buildCountry(
  input: {
    name: unknown;
    isoCode: unknown;
    flag: unknown;
    languages: unknown;
  },
  id: string,
  population = 0,
): Country {
  return {
    id,
    name: validateName(input.name),
    isoCode: validateIsoCode(input.isoCode),
    flag: validateFlag(input.flag),
    languages: validateLanguages(input.languages),
    population,
  };
}

export function parseLanguagesJson(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return validateLanguages(parsed);
  } catch {
    throw new CountryError(
      CountryErrorCodes.INVALID_LANGUAGES,
      "stored languages value is not valid JSON",
    );
  }
}

export function serializeLanguages(languages: string[]): string {
  return JSON.stringify(languages);
}
