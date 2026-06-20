import type { CompleteGolfer } from "golf-sim-library";
import { validateCompleteGolfer, ValidationError } from "golf-sim-library";
import type { Human } from "@/modules/humans/types";
import { humanDisplayName } from "@/modules/humans/transform";
import { GolferError, GolferErrorCodes } from "./errors";
import type { Golfer, GolferSkills } from "./types";

export function validateId(id: unknown): string {
  if (typeof id !== "string" || id.trim().length === 0) {
    throw new GolferError(GolferErrorCodes.MISSING_ID, "id is required");
  }

  return id.trim();
}

export function validateHumanId(humanId: unknown): string {
  if (typeof humanId !== "string" || humanId.trim().length === 0) {
    throw new GolferError(
      GolferErrorCodes.INVALID_HUMAN_ID,
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
    throw new GolferError(
      GolferErrorCodes.INVALID_SKILLS,
      "playsLeftHanded must be a boolean",
    );
  }

  return playsLeftHanded;
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
    throw new GolferError(
      GolferErrorCodes.INVALID_TURNED_PRO_YEAR,
      "turnedProYear must be an integer or null",
    );
  }

  const minimumYear = birthYear + 14;
  if (turnedProYear < minimumYear) {
    throw new GolferError(
      GolferErrorCodes.INVALID_TURNED_PRO_YEAR,
      `turnedProYear must be ${minimumYear} or later for this human`,
    );
  }

  return turnedProYear;
}

export function validateGolferSkills(
  humanId: string,
  input: {
    putting: unknown;
    approach: unknown;
    shortGame: unknown;
    teeShot: unknown;
    clubs: unknown;
  },
): GolferSkills {
  try {
    const validated = validateCompleteGolfer(
      {
        id: humanId,
        putting: input.putting,
        approach: input.approach,
        shortGame: input.shortGame,
        teeShot: input.teeShot,
        clubs: input.clubs,
      },
      0,
      true,
    );

    return {
      putting: validated.putting,
      approach: validated.approach,
      shortGame: validated.shortGame,
      teeShot: validated.teeShot!,
      clubs: validated.clubs,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      throw new GolferError(GolferErrorCodes.INVALID_SKILLS, error.message);
    }
    throw error;
  }
}

export function buildGolfer(
  input: {
    humanId: unknown;
    playsLeftHanded?: unknown;
    turnedProYear?: unknown;
    putting: unknown;
    approach: unknown;
    shortGame: unknown;
    teeShot: unknown;
    clubs: unknown;
  },
  id: string,
  human: Human,
): Golfer {
  const humanId = validateHumanId(input.humanId);
  const birthYear = Number(human.birthDate.slice(0, 4));
  const skills = validateGolferSkills(humanId, input);

  return {
    id,
    humanId,
    humanDisplayName: humanDisplayName(human),
    humanGender: human.gender,
    playsLeftHanded: validatePlaysLeftHanded(input.playsLeftHanded),
    turnedProYear: validateTurnedProYear(input.turnedProYear, birthYear),
    ...skills,
  };
}

export function toCompleteGolfer(human: Human, golfer: Golfer): CompleteGolfer {
  return {
    id: human.id,
    name: humanDisplayName(human),
    gender: human.gender,
    putting: golfer.putting,
    approach: golfer.approach,
    shortGame: golfer.shortGame,
    teeShot: golfer.teeShot,
    clubs: golfer.clubs,
  };
}
