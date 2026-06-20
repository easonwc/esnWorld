import type { CompletePlayer } from "tennis-sim-library";
import { validateCompletePlayer, ValidationError } from "tennis-sim-library";
import type { Human } from "@/modules/humans/types";
import { humanDisplayName } from "@/modules/humans/transform";
import { TennisPlayerError, TennisPlayerErrorCodes } from "./errors";
import type { TennisBackhandStyle, TennisPlayer, TennisPlayerSkills } from "./types";

export function validateId(id: unknown): string {
  if (typeof id !== "string" || id.trim().length === 0) {
    throw new TennisPlayerError(TennisPlayerErrorCodes.MISSING_ID, "id is required");
  }

  return id.trim();
}

export function validateHumanId(humanId: unknown): string {
  if (typeof humanId !== "string" || humanId.trim().length === 0) {
    throw new TennisPlayerError(
      TennisPlayerErrorCodes.INVALID_HUMAN_ID,
      "humanId is required",
    );
  }

  return humanId.trim();
}

export function validatePlaysLeftHanded(playsLeftHanded: unknown): boolean {
  if (playsLeftHanded === undefined) {
    return false;
  }

  if (typeof playsLeftHanded !== "boolean") {
    throw new TennisPlayerError(
      TennisPlayerErrorCodes.INVALID_SKILLS,
      "playsLeftHanded must be a boolean",
    );
  }

  return playsLeftHanded;
}

export function validateBackhandStyle(
  backhandStyle: unknown,
): TennisBackhandStyle {
  if (backhandStyle === undefined) {
    return "two_handed";
  }

  if (backhandStyle !== "one_handed" && backhandStyle !== "two_handed") {
    throw new TennisPlayerError(
      TennisPlayerErrorCodes.INVALID_BACKHAND_STYLE,
      'backhandStyle must be "one_handed" or "two_handed"',
    );
  }

  return backhandStyle;
}

export function validateTurnedProYear(
  turnedProYear: unknown,
  birthYear: number,
): number | null {
  if (turnedProYear === undefined || turnedProYear === null) {
    return null;
  }

  if (
    typeof turnedProYear !== "number" ||
    !Number.isFinite(turnedProYear) ||
    !Number.isInteger(turnedProYear)
  ) {
    throw new TennisPlayerError(
      TennisPlayerErrorCodes.INVALID_TURNED_PRO_YEAR,
      "turnedProYear must be an integer or null",
    );
  }

  const minimumYear = birthYear + 14;
  if (turnedProYear < minimumYear) {
    throw new TennisPlayerError(
      TennisPlayerErrorCodes.INVALID_TURNED_PRO_YEAR,
      `turnedProYear must be ${minimumYear} or later for this human`,
    );
  }

  return turnedProYear;
}

function normalizeSurfacePreference(
  surfacePreference: unknown,
): TennisPlayerSkills["surfacePreference"] {
  if (surfacePreference === undefined || surfacePreference === null) {
    return null;
  }

  if (typeof surfacePreference !== "object") {
    throw new TennisPlayerError(
      TennisPlayerErrorCodes.INVALID_SKILLS,
      "surfacePreference must be an object or null",
    );
  }

  return surfacePreference as TennisPlayerSkills["surfacePreference"];
}

export function validateTennisPlayerSkills(
  humanId: string,
  input: {
    serve: unknown;
    return: unknown;
    baseline: unknown;
    net: unknown;
    surfacePreference?: unknown;
  },
): TennisPlayerSkills {
  const surfacePreference = normalizeSurfacePreference(input.surfacePreference);

  try {
    const validated = validateCompletePlayer({
      id: humanId,
      serve: input.serve,
      return: input.return,
      baseline: input.baseline,
      net: input.net,
      ...(surfacePreference ? { surfacePreference } : {}),
    });

    return {
      serve: validated.serve,
      return: validated.return,
      baseline: validated.baseline,
      net: validated.net,
      surfacePreference: validated.surfacePreference ?? null,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      throw new TennisPlayerError(
        TennisPlayerErrorCodes.INVALID_SKILLS,
        error.message,
      );
    }
    throw error;
  }
}

export function buildTennisPlayer(
  input: {
    humanId: unknown;
    playsLeftHanded?: unknown;
    backhandStyle?: unknown;
    turnedProYear?: unknown;
    serve: unknown;
    return: unknown;
    baseline: unknown;
    net: unknown;
    surfacePreference?: unknown;
  },
  id: string,
  human: Human,
): TennisPlayer {
  const humanId = validateHumanId(input.humanId);
  const birthYear = Number(human.birthDate.slice(0, 4));
  const skills = validateTennisPlayerSkills(humanId, input);

  return {
    id,
    humanId,
    humanDisplayName: humanDisplayName(human),
    humanGender: human.gender,
    playsLeftHanded: validatePlaysLeftHanded(input.playsLeftHanded),
    backhandStyle: validateBackhandStyle(input.backhandStyle),
    turnedProYear: validateTurnedProYear(input.turnedProYear, birthYear),
    ...skills,
  };
}

export function toCompletePlayer(
  human: Human,
  player: TennisPlayer,
): CompletePlayer {
  return {
    id: human.id,
    name: humanDisplayName(human),
    gender: human.gender,
    serve: player.serve,
    return: player.return,
    baseline: player.baseline,
    net: player.net,
    ...(player.surfacePreference
      ? { surfacePreference: player.surfacePreference }
      : {}),
  };
}
