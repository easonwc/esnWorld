export type HumanGender = "male" | "female";

export type HumanAction = "create" | "get" | "delete";

export interface HumanCreateInput {
  action: "create";
  givenName: string;
  familyName: string;
  preferredName?: string | null;
  gender: HumanGender;
  birthDate: string;
  birthLocationId: string;
  nationalityCountryId: string;
  heightCm: number;
  weightKg: number;
}

export interface HumanGetInput {
  action: "get";
  id: string;
}

export interface HumanDeleteInput {
  action: "delete";
  id: string;
}

export type HumanInput = HumanCreateInput | HumanGetInput | HumanDeleteInput;

export interface Human {
  id: string;
  givenName: string;
  familyName: string;
  preferredName: string | null;
  displayName: string;
  gender: HumanGender;
  /** ISO calendar date YYYY-MM-DD */
  birthDate: string;
  birthLocationId: string;
  birthLocationName: string;
  birthLocationRegion: string | null;
  birthLocationCountryName: string;
  nationalityCountryId: string;
  nationalityCountryName: string;
  heightCm: number;
  weightKg: number;
}

export type HumanOutput = Human | Human[] | { deleted: true; id: string };
