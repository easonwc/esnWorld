import { HumanError, HumanErrorCodes } from "./errors";
import type { Human, HumanGender } from "./types";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MIN_HEIGHT_CM = 140;
const MAX_HEIGHT_CM = 220;
const MIN_WEIGHT_KG = 45;
const MAX_WEIGHT_KG = 150;
const MIN_BIRTH_YEAR = 1900;

export function humanDisplayName(input: {
  givenName: string;
  familyName: string;
  preferredName: string | null;
}): string {
  const first = input.preferredName ?? input.givenName;
  return `${first} ${input.familyName}`;
}

export function computeHumanAge(
  birthDate: string,
  asOfIsoUtc: string,
): number {
  const asOf = new Date(asOfIsoUtc);
  const [year, month, day] = birthDate.split("-").map(Number);
  let age = asOf.getUTCFullYear() - year;

  const asOfMonth = asOf.getUTCMonth() + 1;
  const asOfDay = asOf.getUTCDate();
  if (asOfMonth < month || (asOfMonth === month && asOfDay < day)) {
    age -= 1;
  }

  return age;
}

export function validateId(id: unknown): string {
  if (typeof id !== "string" || id.trim().length === 0) {
    throw new HumanError(HumanErrorCodes.MISSING_ID, "id is required");
  }

  return id.trim();
}

function validatePersonName(
  value: unknown,
  code: string,
  label: string,
): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new HumanError(code, `${label} must be a non-empty string`);
  }

  if (value.trim().length > 100) {
    throw new HumanError(code, `${label} must be 100 characters or fewer`);
  }

  return value.trim();
}

export function validateGivenName(givenName: unknown): string {
  return validatePersonName(
    givenName,
    HumanErrorCodes.INVALID_GIVEN_NAME,
    "givenName",
  );
}

export function validateFamilyName(familyName: unknown): string {
  return validatePersonName(
    familyName,
    HumanErrorCodes.INVALID_FAMILY_NAME,
    "familyName",
  );
}

export function validatePreferredName(
  preferredName: unknown,
): string | null {
  if (preferredName === undefined || preferredName === null) {
    return null;
  }

  if (typeof preferredName !== "string") {
    throw new HumanError(
      HumanErrorCodes.INVALID_PREFERRED_NAME,
      "preferredName must be a string or null",
    );
  }

  const trimmed = preferredName.trim();
  if (trimmed.length === 0) {
    return null;
  }

  if (trimmed.length > 100) {
    throw new HumanError(
      HumanErrorCodes.INVALID_PREFERRED_NAME,
      "preferredName must be 100 characters or fewer",
    );
  }

  return trimmed;
}

export function validateGender(gender: unknown): HumanGender {
  if (gender !== "male" && gender !== "female") {
    throw new HumanError(
      HumanErrorCodes.INVALID_GENDER,
      'gender must be "male" or "female"',
    );
  }

  return gender;
}

export function validateBirthLocationId(birthLocationId: unknown): string {
  if (typeof birthLocationId !== "string" || birthLocationId.trim().length === 0) {
    throw new HumanError(
      HumanErrorCodes.INVALID_BIRTH_LOCATION_ID,
      "birthLocationId is required",
    );
  }

  return birthLocationId.trim();
}

export function validateNationalityCountryId(
  nationalityCountryId: unknown,
): string {
  if (
    typeof nationalityCountryId !== "string" ||
    nationalityCountryId.trim().length === 0
  ) {
    throw new HumanError(
      HumanErrorCodes.INVALID_NATIONALITY_COUNTRY_ID,
      "nationalityCountryId is required",
    );
  }

  return nationalityCountryId.trim();
}

function parseIsoDateParts(birthDate: string): {
  year: number;
  month: number;
  day: number;
} {
  if (!ISO_DATE_PATTERN.test(birthDate)) {
    throw new HumanError(
      HumanErrorCodes.INVALID_BIRTH_DATE,
      "birthDate must be an ISO calendar date (YYYY-MM-DD)",
    );
  }

  const [year, month, day] = birthDate.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new HumanError(
      HumanErrorCodes.INVALID_BIRTH_DATE,
      "birthDate is not a valid calendar date",
    );
  }

  return { year, month, day };
}

export function validateBirthDate(
  birthDate: unknown,
  asOfIsoUtc: string,
): string {
  if (typeof birthDate !== "string") {
    throw new HumanError(
      HumanErrorCodes.INVALID_BIRTH_DATE,
      "birthDate must be an ISO calendar date (YYYY-MM-DD)",
    );
  }

  const trimmed = birthDate.trim();
  const { year } = parseIsoDateParts(trimmed);

  if (year < MIN_BIRTH_YEAR) {
    throw new HumanError(
      HumanErrorCodes.INVALID_BIRTH_DATE,
      `birthDate year must be ${MIN_BIRTH_YEAR} or later`,
    );
  }

  const asOf = new Date(asOfIsoUtc);
  const asOfDate = Date.UTC(
    asOf.getUTCFullYear(),
    asOf.getUTCMonth(),
    asOf.getUTCDate(),
  );
  const birthUtc = Date.UTC(
    year,
    Number(trimmed.slice(5, 7)) - 1,
    Number(trimmed.slice(8, 10)),
  );

  if (birthUtc > asOfDate) {
    throw new HumanError(
      HumanErrorCodes.INVALID_BIRTH_DATE,
      "birthDate cannot be in the future",
    );
  }

  return trimmed;
}

export function validateHeightCm(heightCm: unknown): number {
  if (typeof heightCm !== "number" || !Number.isFinite(heightCm)) {
    throw new HumanError(
      HumanErrorCodes.INVALID_HEIGHT_CM,
      "heightCm must be a finite number",
    );
  }

  if (!Number.isInteger(heightCm)) {
    throw new HumanError(
      HumanErrorCodes.INVALID_HEIGHT_CM,
      "heightCm must be an integer",
    );
  }

  if (heightCm < MIN_HEIGHT_CM || heightCm > MAX_HEIGHT_CM) {
    throw new HumanError(
      HumanErrorCodes.INVALID_HEIGHT_CM,
      `heightCm must be between ${MIN_HEIGHT_CM} and ${MAX_HEIGHT_CM}`,
    );
  }

  return heightCm;
}

export function validateWeightKg(weightKg: unknown): number {
  if (typeof weightKg !== "number" || !Number.isFinite(weightKg)) {
    throw new HumanError(
      HumanErrorCodes.INVALID_WEIGHT_KG,
      "weightKg must be a finite number",
    );
  }

  if (weightKg < MIN_WEIGHT_KG || weightKg > MAX_WEIGHT_KG) {
    throw new HumanError(
      HumanErrorCodes.INVALID_WEIGHT_KG,
      `weightKg must be between ${MIN_WEIGHT_KG} and ${MAX_WEIGHT_KG}`,
    );
  }

  return Math.round(weightKg * 10) / 10;
}

export function buildHuman(
  input: {
    givenName: unknown;
    familyName: unknown;
    preferredName?: unknown;
    gender: unknown;
    birthDate: unknown;
    birthLocationId: unknown;
    nationalityCountryId: unknown;
    heightCm: unknown;
    weightKg: unknown;
  },
  id: string,
  birthLocationName: string,
  birthLocationRegion: string | null,
  birthLocationCountryName: string,
  nationalityCountryName: string,
  asOfIsoUtc: string,
): Human {
  const givenName = validateGivenName(input.givenName);
  const familyName = validateFamilyName(input.familyName);
  const preferredName = validatePreferredName(input.preferredName);

  return {
    id,
    givenName,
    familyName,
    preferredName,
    displayName: humanDisplayName({ givenName, familyName, preferredName }),
    gender: validateGender(input.gender),
    birthDate: validateBirthDate(input.birthDate, asOfIsoUtc),
    birthLocationId: validateBirthLocationId(input.birthLocationId),
    birthLocationName: birthLocationName.trim(),
    birthLocationRegion,
    birthLocationCountryName: birthLocationCountryName.trim(),
    nationalityCountryId: validateNationalityCountryId(input.nationalityCountryId),
    nationalityCountryName: nationalityCountryName.trim(),
    heightCm: validateHeightCm(input.heightCm),
    weightKg: validateWeightKg(input.weightKg),
  };
}
