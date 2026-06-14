export type LeagueAction = "create" | "get" | "delete";

export interface LeagueCreateInput {
  action: "create";
  name: string;
  /** Short league code, e.g. NFL, NBA, MLB */
  abbreviation: string;
}

export interface LeagueGetInput {
  action: "get";
  id: string;
}

export interface LeagueDeleteInput {
  action: "delete";
  id: string;
}

export type LeagueInput =
  | LeagueCreateInput
  | LeagueGetInput
  | LeagueDeleteInput;

/** Professional sports league container for teams. */
export interface League {
  id: string;
  name: string;
  abbreviation: string;
  logo: string;
}

export type LeagueOutput =
  | League
  | League[]
  | { deleted: true; id: string };
