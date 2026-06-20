import type { GolfWorldRanking } from "@/modules/golf-world-rankings/types";
import {
  GolfWorldRankingError,
  GolfWorldRankingErrorCodes,
} from "@/modules/golf-world-rankings/errors";
import type { Database } from "better-sqlite3";
import { SqliteError } from "better-sqlite3";
import type { GolfWorldRankingRepository } from "../types";

type RankingRow = {
  id: string;
  golfer_id: string;
  ranking_system: GolfWorldRanking["rankingSystem"];
  as_of_date: string;
  rank: number;
  ranking_points: number;
  overall_skill: number;
};

function rowToRanking(row: RankingRow): GolfWorldRanking {
  return {
    id: row.id,
    golferId: row.golfer_id,
    rankingSystem: row.ranking_system,
    asOfDate: row.as_of_date,
    rank: row.rank,
    rankingPoints: row.ranking_points,
    overallSkill: row.overall_skill,
  };
}

export class SqliteGolfWorldRankingRepository
  implements GolfWorldRankingRepository
{
  constructor(private readonly db: Database) {}

  async listBySystemDate(
    rankingSystem: GolfWorldRanking["rankingSystem"],
    asOfDate: string,
  ): Promise<GolfWorldRanking[]> {
    const rows = this.db
      .prepare(
        `SELECT id, golfer_id, ranking_system, as_of_date, rank, ranking_points, overall_skill
         FROM golf_world_rankings
         WHERE ranking_system = ? AND as_of_date = ?
         ORDER BY rank ASC`,
      )
      .all(rankingSystem, asOfDate) as RankingRow[];
    return rows.map(rowToRanking);
  }

  async countBySystemDate(
    rankingSystem: GolfWorldRanking["rankingSystem"],
    asOfDate: string,
  ): Promise<number> {
    const row = this.db
      .prepare(
        `SELECT COUNT(*) AS count
         FROM golf_world_rankings
         WHERE ranking_system = ? AND as_of_date = ?`,
      )
      .get(rankingSystem, asOfDate) as { count: number };
    return row.count;
  }

  async get(id: string): Promise<GolfWorldRanking | null> {
    const row = this.db
      .prepare(
        `SELECT id, golfer_id, ranking_system, as_of_date, rank, ranking_points, overall_skill
         FROM golf_world_rankings
         WHERE id = ?`,
      )
      .get(id) as RankingRow | undefined;
    return row ? rowToRanking(row) : null;
  }

  async getByGolferSystemDate(
    golferId: string,
    rankingSystem: GolfWorldRanking["rankingSystem"],
    asOfDate: string,
  ): Promise<GolfWorldRanking | null> {
    const row = this.db
      .prepare(
        `SELECT id, golfer_id, ranking_system, as_of_date, rank, ranking_points, overall_skill
         FROM golf_world_rankings
         WHERE golfer_id = ? AND ranking_system = ? AND as_of_date = ?`,
      )
      .get(golferId, rankingSystem, asOfDate) as RankingRow | undefined;
    return row ? rowToRanking(row) : null;
  }

  async create(ranking: GolfWorldRanking): Promise<GolfWorldRanking> {
    try {
      this.db
        .prepare(
          `INSERT INTO golf_world_rankings (
             id, golfer_id, ranking_system, as_of_date, rank, ranking_points, overall_skill
           ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          ranking.id,
          ranking.golferId,
          ranking.rankingSystem,
          ranking.asOfDate,
          ranking.rank,
          ranking.rankingPoints,
          ranking.overallSkill,
        );
    } catch (error) {
      if (
        error instanceof SqliteError &&
        error.code === "SQLITE_CONSTRAINT_UNIQUE"
      ) {
        throw new GolfWorldRankingError(
          GolfWorldRankingErrorCodes.RANKING_ALREADY_EXISTS,
          `Ranking already exists for golfer ${ranking.golferId}`,
        );
      }
      throw error;
    }

    return ranking;
  }

  async update(ranking: GolfWorldRanking): Promise<GolfWorldRanking> {
    const result = this.db
      .prepare(
        `UPDATE golf_world_rankings
         SET rank = ?, ranking_points = ?, overall_skill = ?
         WHERE id = ?`,
      )
      .run(
        ranking.rank,
        ranking.rankingPoints,
        ranking.overallSkill,
        ranking.id,
      );

    if (result.changes === 0) {
      throw new GolfWorldRankingError(
        GolfWorldRankingErrorCodes.RANKING_NOT_FOUND,
        `World ranking not found: ${ranking.id}`,
      );
    }

    return ranking;
  }

  async deleteBySystemDate(
    rankingSystem: GolfWorldRanking["rankingSystem"],
    asOfDate: string,
  ): Promise<void> {
    this.db
      .prepare(
        `DELETE FROM golf_world_rankings
         WHERE ranking_system = ? AND as_of_date = ?`,
      )
      .run(rankingSystem, asOfDate);
  }

  async clear(): Promise<void> {
    this.db.prepare("DELETE FROM golf_world_rankings").run();
  }
}
