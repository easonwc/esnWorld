export type GolfTourWinAction = "create" | "get" | "listByTourSeason" | "delete";

export interface GolfTourWinCreateInput {
  action: "create";
  golferId: string;
  tourId: string;
  seasonYear: number;
  tournamentId?: string | null;
}

export interface GolfTourWinGetInput {
  action: "get";
  id: string;
}

export interface GolfTourWinListByTourSeasonInput {
  action: "listByTourSeason";
  tourId: string;
  seasonYear: number;
}

export interface GolfTourWinDeleteInput {
  action: "delete";
  id: string;
}

export type GolfTourWinInput =
  | GolfTourWinCreateInput
  | GolfTourWinGetInput
  | GolfTourWinListByTourSeasonInput
  | GolfTourWinDeleteInput;

export interface GolfTourWin {
  id: string;
  golferId: string;
  tourId: string;
  seasonYear: number;
  tournamentId: string | null;
}

export type GolfTourWinOutput =
  | GolfTourWin
  | GolfTourWin[]
  | { deleted: true; id: string };
