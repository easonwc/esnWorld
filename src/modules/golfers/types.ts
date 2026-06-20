import type {
  GolferApproachAttributes,
  GolferClubAttributes,
  GolferPuttingAttributes,
  GolferShortGameAttributes,
  GolferTeeShotAttributes,
} from "golf-sim-library";
import type { HumanGender } from "@/modules/humans/types";

export type GolferAction = "create" | "get" | "getByHuman" | "delete";

export interface GolferSkillInput {
  putting: GolferPuttingAttributes;
  approach: GolferApproachAttributes;
  shortGame: GolferShortGameAttributes;
  teeShot: GolferTeeShotAttributes;
  clubs: GolferClubAttributes;
}

export interface GolferCreateInput extends GolferSkillInput {
  action: "create";
  humanId: string;
  playsLeftHanded?: boolean;
  turnedProYear?: number | null;
}

export interface GolferGetInput {
  action: "get";
  id: string;
}

export interface GolferGetByHumanInput {
  action: "getByHuman";
  humanId: string;
}

export interface GolferDeleteInput {
  action: "delete";
  id: string;
}

export type GolferInput =
  | GolferCreateInput
  | GolferGetInput
  | GolferGetByHumanInput
  | GolferDeleteInput;

export interface GolferSkills {
  putting: GolferPuttingAttributes;
  approach: GolferApproachAttributes;
  shortGame: GolferShortGameAttributes;
  teeShot: GolferTeeShotAttributes;
  clubs: GolferClubAttributes;
}

export interface Golfer extends GolferSkills {
  id: string;
  humanId: string;
  humanDisplayName: string;
  humanGender: HumanGender;
  playsLeftHanded: boolean;
  turnedProYear: number | null;
}

export type GolferOutput = Golfer | Golfer[] | { deleted: true; id: string };

export type {
  GolferApproachAttributes,
  GolferClubAttributes,
  GolferPuttingAttributes,
  GolferShortGameAttributes,
  GolferTeeShotAttributes,
} from "golf-sim-library";
