import type {
  PlayerBaselineAttributes,
  PlayerNetAttributes,
  PlayerReturnAttributes,
  PlayerServeAttributes,
  PlayerSurfacePreferences,
} from "tennis-sim-library";
import type { HumanGender } from "@/modules/humans/types";

export type TennisBackhandStyle = "one_handed" | "two_handed";

export type TennisPlayerAction = "create" | "get" | "getByHuman" | "delete";

export interface TennisPlayerSkillInput {
  serve: PlayerServeAttributes;
  return: PlayerReturnAttributes;
  baseline: PlayerBaselineAttributes;
  net: PlayerNetAttributes;
  surfacePreference?: PlayerSurfacePreferences | null;
}

export interface TennisPlayerCreateInput extends TennisPlayerSkillInput {
  action: "create";
  humanId: string;
  playsLeftHanded?: boolean;
  backhandStyle?: TennisBackhandStyle;
  turnedProYear?: number | null;
}

export interface TennisPlayerGetInput {
  action: "get";
  id: string;
}

export interface TennisPlayerGetByHumanInput {
  action: "getByHuman";
  humanId: string;
}

export interface TennisPlayerDeleteInput {
  action: "delete";
  id: string;
}

export type TennisPlayerInput =
  | TennisPlayerCreateInput
  | TennisPlayerGetInput
  | TennisPlayerGetByHumanInput
  | TennisPlayerDeleteInput;

export interface TennisPlayerSkills {
  serve: PlayerServeAttributes;
  return: PlayerReturnAttributes;
  baseline: PlayerBaselineAttributes;
  net: PlayerNetAttributes;
  surfacePreference: PlayerSurfacePreferences | null;
}

export interface TennisPlayer extends TennisPlayerSkills {
  id: string;
  humanId: string;
  humanDisplayName: string;
  humanGender: HumanGender;
  playsLeftHanded: boolean;
  backhandStyle: TennisBackhandStyle;
  turnedProYear: number | null;
}

export type TennisPlayerOutput =
  | TennisPlayer
  | TennisPlayer[]
  | { deleted: true; id: string };

export type {
  PlayerBaselineAttributes,
  PlayerNetAttributes,
  PlayerReturnAttributes,
  PlayerServeAttributes,
  PlayerSurfacePreferences,
} from "tennis-sim-library";
