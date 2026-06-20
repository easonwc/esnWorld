export type AthleteSportCode = "golfer" | "tennis";

export type AthleteGender = "male" | "female";

export {
  athleteFamilyName,
  athleteGivenName,
  athleteNameCultureUsesPool,
  resolveAthleteNameCulture,
  listUnmappedAthleteNameCountries,
  type AthleteNameCulture,
} from "./athletes-names.data";
const SPORT_SEED_OFFSET: Record<AthleteSportCode, number> = {
  golfer: 0,
  tennis: 2_000_000,
};

const GENDER_SEED_OFFSET: Record<AthleteGender, number> = {
  male: 0,
  female: 500_000,
};

export function deriveAthleteSeed(
  baseSeed: number,
  sport: AthleteSportCode,
  gender: AthleteGender,
  index: number,
): number {
  return (
    baseSeed + SPORT_SEED_OFFSET[sport] + GENDER_SEED_OFFSET[gender] + index
  );
}

export function athleteHeightCm(gender: AthleteGender, seed: number): number {
  const random = seededUnit(seed, 11);
  if (gender === "male") {
    return 170 + Math.floor(random * 26);
  }
  return 165 + Math.floor(random * 19);
}

export function athleteWeightKg(gender: AthleteGender, seed: number): number {
  const random = seededUnit(seed, 13);
  if (gender === "male") {
    return Math.round((72 + random * 28) * 10) / 10;
  }
  return Math.round((55 + random * 22) * 10) / 10;
}

const BIRTH_AGE_SPAN = 18;
const BIRTH_MONTH_SPAN = 12;
const BIRTH_DAY_SPAN = 28;

/** Unique birth-date slots per cohort index (18 ages x 12 months x 28 days). */
export const ATHLETE_BIRTH_DATE_CAPACITY =
  BIRTH_AGE_SPAN * BIRTH_MONTH_SPAN * BIRTH_DAY_SPAN;

export function athleteBirthDate(asOfYear: number, index: number): string {
  const ageOffset = index % BIRTH_AGE_SPAN;
  const monthOffset =
    Math.floor(index / BIRTH_AGE_SPAN) % BIRTH_MONTH_SPAN;
  const dayOffset =
    Math.floor(index / (BIRTH_AGE_SPAN * BIRTH_MONTH_SPAN)) % BIRTH_DAY_SPAN;

  const age = 22 + ageOffset;
  const year = asOfYear - age;
  const month = 1 + monthOffset;
  const day = 1 + dayOffset;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function athleteTurnedProYear(birthDate: string, seed: number): number {
  const birthYear = Number(birthDate.slice(0, 4));
  return birthYear + 18 + (seed % 5);
}

export function athletePlaysLeftHanded(seed: number): boolean {
  return seed % 10 === 0;
}

export function athleteBackhandStyle(
  seed: number,
): "one_handed" | "two_handed" {
  return seed % 5 === 0 ? "one_handed" : "two_handed";
}

function seededUnit(seed: number, salt: number): number {
  const mixed = Math.sin((seed + salt) * 12_989.123) * 43_758.5453;
  return mixed - Math.floor(mixed);
}

export function pickLocationIndex(index: number, locationCount: number): number {
  if (locationCount <= 0) {
    return 0;
  }
  // Spread cohort indices across cities so name repeats do not cluster in one place.
  return (index * 9973) % locationCount;
}

export function athleteHumanIdentityKey(input: {
  givenName: string;
  familyName: string;
  gender: AthleteGender;
  birthDate: string;
  birthLocationId: string;
}): string {
  return [
    input.gender,
    input.givenName,
    input.familyName,
    input.birthDate,
    input.birthLocationId,
  ].join("\0");
}
