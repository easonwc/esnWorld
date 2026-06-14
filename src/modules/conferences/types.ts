export type ConferenceAction = "create" | "get" | "delete" | "listByLeague";

export interface ConferenceCreateInput {
  action: "create";
  leagueId: string;
  name: string;
  abbreviation: string;
}

export interface ConferenceGetInput {
  action: "get";
  id: string;
}

export interface ConferenceDeleteInput {
  action: "delete";
  id: string;
}

export interface ConferenceListByLeagueInput {
  action: "listByLeague";
  leagueId: string;
}

export type ConferenceInput =
  | ConferenceCreateInput
  | ConferenceGetInput
  | ConferenceDeleteInput
  | ConferenceListByLeagueInput;

export interface Conference {
  id: string;
  leagueId: string;
  leagueName: string;
  name: string;
  abbreviation: string;
}

export type ConferenceOutput =
  | Conference
  | Conference[]
  | { deleted: true; id: string };
