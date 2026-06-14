export type TeamAction = "create" | "get" | "delete" | "listByDivision" | "listByLeague";

export interface TeamCreateInput {
  action: "create";
  divisionId: string;
  venueId: string;
  name: string;
  abbreviation: string;
  logo: string;
}

export interface TeamGetInput {
  action: "get";
  id: string;
}

export interface TeamDeleteInput {
  action: "delete";
  id: string;
}

export interface TeamListByDivisionInput {
  action: "listByDivision";
  divisionId: string;
}

export interface TeamListByLeagueInput {
  action: "listByLeague";
  leagueId: string;
}

export type TeamInput =
  | TeamCreateInput
  | TeamGetInput
  | TeamDeleteInput
  | TeamListByDivisionInput
  | TeamListByLeagueInput;

export interface Team {
  id: string;
  divisionId: string;
  divisionName: string;
  divisionAbbreviation: string;
  conferenceId: string;
  conferenceName: string;
  conferenceAbbreviation: string;
  leagueId: string;
  leagueName: string;
  venueId: string;
  venueName: string;
  locationId: string;
  locationName: string;
  locationRegion: string | null;
  name: string;
  abbreviation: string;
  logo: string;
}

export type TeamOutput =
  | Team
  | Team[]
  | { deleted: true; id: string };
