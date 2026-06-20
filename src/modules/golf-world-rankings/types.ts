export type GolfWorldRankingSystem = "owgr" | "rolex";

export type GolfWorldRankingAction =
  | "get"
  | "getByGolfer"
  | "listBySystemDate";

export interface GolfWorldRankingGetInput {
  action: "get";
  id: string;
}

export interface GolfWorldRankingGetByGolferInput {
  action: "getByGolfer";
  golferId: string;
  rankingSystem: GolfWorldRankingSystem;
  asOfDate: string;
}

export interface GolfWorldRankingListBySystemDateInput {
  action: "listBySystemDate";
  rankingSystem: GolfWorldRankingSystem;
  asOfDate: string;
}

export type GolfWorldRankingInput =
  | GolfWorldRankingGetInput
  | GolfWorldRankingGetByGolferInput
  | GolfWorldRankingListBySystemDateInput;

export interface GolfWorldRanking {
  id: string;
  golferId: string;
  rankingSystem: GolfWorldRankingSystem;
  asOfDate: string;
  rank: number;
  rankingPoints: number;
  overallSkill: number;
}

export type GolfWorldRankingOutput = GolfWorldRanking | GolfWorldRanking[];

export interface GolfWorldRankingUpsertInput {
  golferId: string;
  rankingSystem: GolfWorldRankingSystem;
  asOfDate: string;
  rank: number;
  rankingPoints: number;
  overallSkill: number;
}
