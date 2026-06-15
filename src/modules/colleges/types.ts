export type CollegeAction = "create" | "get" | "delete" | "listByLocation";

export interface CollegeCreateInput {
  action: "create";
  name: string;
  locationId: string;
  /** Total student enrollment / attendance */
  attendance: number;
}

export interface CollegeGetInput {
  action: "get";
  id: string;
}

export interface CollegeDeleteInput {
  action: "delete";
  id: string;
}

export interface CollegeListByLocationInput {
  action: "listByLocation";
  locationId: string;
}

export type CollegeInput =
  | CollegeCreateInput
  | CollegeGetInput
  | CollegeDeleteInput
  | CollegeListByLocationInput;

export interface College {
  id: string;
  name: string;
  locationId: string;
  locationName: string;
  locationRegion: string | null;
  attendance: number;
  logo: string;
}

export type CollegeOutput =
  | College
  | College[]
  | { deleted: true; id: string };
