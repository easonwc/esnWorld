export type DivisionAction = "create" | "get" | "delete" | "listByConference";

export interface DivisionCreateInput {
  action: "create";
  conferenceId: string;
  name: string;
  abbreviation: string;
}

export interface DivisionGetInput {
  action: "get";
  id: string;
}

export interface DivisionDeleteInput {
  action: "delete";
  id: string;
}

export interface DivisionListByConferenceInput {
  action: "listByConference";
  conferenceId: string;
}

export type DivisionInput =
  | DivisionCreateInput
  | DivisionGetInput
  | DivisionDeleteInput
  | DivisionListByConferenceInput;

export interface Division {
  id: string;
  conferenceId: string;
  conferenceName: string;
  conferenceAbbreviation: string;
  leagueId: string;
  leagueName: string;
  name: string;
  abbreviation: string;
}

export type DivisionOutput =
  | Division
  | Division[]
  | { deleted: true; id: string };
