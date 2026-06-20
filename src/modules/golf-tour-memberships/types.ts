export type GolfTourMembershipStatus = "member" | "inactive";

export type GolfTourMembershipAction =
  | "create"
  | "get"
  | "listByTourSeason"
  | "delete";

export interface GolfTourMembershipCreateInput {
  action: "create";
  golferId: string;
  tourId: string;
  seasonYear: number;
  status?: GolfTourMembershipStatus;
  overallSkill: number;
}

export interface GolfTourMembershipGetInput {
  action: "get";
  id: string;
}

export interface GolfTourMembershipListByTourSeasonInput {
  action: "listByTourSeason";
  tourId: string;
  seasonYear: number;
}

export interface GolfTourMembershipDeleteInput {
  action: "delete";
  id: string;
}

export type GolfTourMembershipInput =
  | GolfTourMembershipCreateInput
  | GolfTourMembershipGetInput
  | GolfTourMembershipListByTourSeasonInput
  | GolfTourMembershipDeleteInput;

export interface GolfTourMembership {
  id: string;
  golferId: string;
  tourId: string;
  seasonYear: number;
  status: GolfTourMembershipStatus;
  overallSkill: number;
}

export type GolfTourMembershipOutput =
  | GolfTourMembership
  | GolfTourMembership[]
  | { deleted: true; id: string };
