import { generateRandomGolferAttributes } from "golf-sim-library";
import { generateRandomPlayerAttributes } from "tennis-sim-library";
import type { Location } from "@/modules/locations/types";
import type { HumanGender } from "@/modules/humans/types";
import {
  athleteBackhandStyle,
  athleteBirthDate,
  athleteHeightCm,
  athletePlaysLeftHanded,
  athleteTurnedProYear,
  athleteWeightKg,
  athleteFamilyName,
  athleteGivenName,
  deriveAthleteSeed,
  pickLocationIndex,
  resolveAthleteNameCulture,
  type AthleteGender,
  type AthleteSportCode,
} from "./athletes.data";

export interface ProceduralHumanSeedInput {
  givenName: string;
  familyName: string;
  gender: HumanGender;
  birthDate: string;
  birthLocationId: string;
  nationalityCountryId: string;
  heightCm: number;
  weightKg: number;
}

export function buildProceduralHumanSeedInput(input: {
  sport: AthleteSportCode;
  gender: AthleteGender;
  index: number;
  baseSeed: number;
  asOfYear: number;
  locations: readonly Location[];
}): ProceduralHumanSeedInput | null {
  if (input.locations.length === 0) {
    return null;
  }

  const seed = deriveAthleteSeed(
    input.baseSeed,
    input.sport,
    input.gender,
    input.index,
  );
  const location =
    input.locations[pickLocationIndex(input.index, input.locations.length)]!;
  const nameCulture = resolveAthleteNameCulture(location.countryName);

  return {
    givenName: athleteGivenName(input.gender, input.index, nameCulture),
    familyName: athleteFamilyName(input.index, nameCulture),
    gender: input.gender,
    birthDate: athleteBirthDate(input.asOfYear, input.index),
    birthLocationId: location.id,
    nationalityCountryId: location.countryId,
    heightCm: athleteHeightCm(input.gender, seed),
    weightKg: athleteWeightKg(input.gender, seed),
  };
}

export function buildProceduralGolferSkills(
  gender: AthleteGender,
  baseSeed: number,
  index: number,
  birthDate: string,
) {
  const seed = deriveAthleteSeed(baseSeed, "golfer", gender, index);
  const skills = generateRandomGolferAttributes({ gender, seed });

  return {
    playsLeftHanded: athletePlaysLeftHanded(seed),
    turnedProYear: athleteTurnedProYear(birthDate, seed),
    putting: skills.putting,
    approach: skills.approach,
    shortGame: skills.shortGame,
    teeShot: skills.teeShot,
    clubs: skills.clubs,
  };
}

export function buildProceduralTennisPlayerSkills(
  gender: AthleteGender,
  baseSeed: number,
  index: number,
  birthDate: string,
) {
  const seed = deriveAthleteSeed(baseSeed, "tennis", gender, index);
  const skills = generateRandomPlayerAttributes({
    gender,
    seed,
    includeSurfacePreferences: true,
  });

  return {
    playsLeftHanded: athletePlaysLeftHanded(seed),
    backhandStyle: athleteBackhandStyle(seed),
    turnedProYear: athleteTurnedProYear(birthDate, seed),
    serve: skills.serve,
    return: skills.return,
    baseline: skills.baseline,
    net: skills.net,
    surfacePreference: skills.surfacePreference ?? null,
  };
}

export function countProfilesByGender<T extends { humanGender: HumanGender }>(
  profiles: readonly T[],
  gender: AthleteGender,
): number {
  return profiles.filter((profile) => profile.humanGender === gender).length;
}
