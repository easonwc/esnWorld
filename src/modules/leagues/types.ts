import type { Conference } from "@/modules/conferences/types";
import type { Division } from "@/modules/divisions/types";
import type { Team } from "@/modules/teams/types";

export type LeagueAction =
  | "create"
  | "get"
  | "delete"
  | "listConferences"
  | "listDivisions"
  | "listTeams";

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

export interface LeagueListConferencesInput {
  action: "listConferences";
  leagueId: string;
}

export interface LeagueListDivisionsInput {
  action: "listDivisions";
  leagueId: string;
}

export interface LeagueListTeamsInput {
  action: "listTeams";
  leagueId: string;
}

export type LeagueInput =
  | LeagueCreateInput
  | LeagueGetInput
  | LeagueDeleteInput
  | LeagueListConferencesInput
  | LeagueListDivisionsInput
  | LeagueListTeamsInput;

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
  | Conference[]
  | Division[]
  | Team[]
  | { deleted: true; id: string };
