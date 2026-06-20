import type { GolfWorldRanking } from "@/modules/golf-world-rankings/types";
import {
  GolfWorldRankingError,
  GolfWorldRankingErrorCodes,
} from "@/modules/golf-world-rankings/errors";
import type { GolfWorldRankingRepository } from "../types";

export class MemoryGolfWorldRankingRepository
  implements GolfWorldRankingRepository
{
  private readonly rankings = new Map<string, GolfWorldRanking>();

  async listBySystemDate(
    rankingSystem: GolfWorldRanking["rankingSystem"],
    asOfDate: string,
  ): Promise<GolfWorldRanking[]> {
    return [...this.rankings.values()]
      .filter(
        (ranking) =>
          ranking.rankingSystem === rankingSystem &&
          ranking.asOfDate === asOfDate,
      )
      .sort((a, b) => a.rank - b.rank);
  }

  async countBySystemDate(
    rankingSystem: GolfWorldRanking["rankingSystem"],
    asOfDate: string,
  ): Promise<number> {
    return (await this.listBySystemDate(rankingSystem, asOfDate)).length;
  }

  async get(id: string): Promise<GolfWorldRanking | null> {
    return this.rankings.get(id) ?? null;
  }

  async getByGolferSystemDate(
    golferId: string,
    rankingSystem: GolfWorldRanking["rankingSystem"],
    asOfDate: string,
  ): Promise<GolfWorldRanking | null> {
    return (
      [...this.rankings.values()].find(
        (ranking) =>
          ranking.golferId === golferId &&
          ranking.rankingSystem === rankingSystem &&
          ranking.asOfDate === asOfDate,
      ) ?? null
    );
  }

  async create(ranking: GolfWorldRanking): Promise<GolfWorldRanking> {
    const duplicateRank = [...this.rankings.values()].find(
      (entry) =>
        entry.rankingSystem === ranking.rankingSystem &&
        entry.asOfDate === ranking.asOfDate &&
        entry.rank === ranking.rank,
    );
    if (duplicateRank) {
      throw new GolfWorldRankingError(
        GolfWorldRankingErrorCodes.RANKING_ALREADY_EXISTS,
        `Rank ${ranking.rank} already assigned for ${ranking.rankingSystem} on ${ranking.asOfDate}`,
      );
    }

    const duplicateGolfer = await this.getByGolferSystemDate(
      ranking.golferId,
      ranking.rankingSystem,
      ranking.asOfDate,
    );
    if (duplicateGolfer) {
      throw new GolfWorldRankingError(
        GolfWorldRankingErrorCodes.RANKING_ALREADY_EXISTS,
        `Ranking already exists for golfer ${ranking.golferId}`,
      );
    }

    this.rankings.set(ranking.id, ranking);
    return ranking;
  }

  async update(ranking: GolfWorldRanking): Promise<GolfWorldRanking> {
    if (!this.rankings.has(ranking.id)) {
      throw new GolfWorldRankingError(
        GolfWorldRankingErrorCodes.RANKING_NOT_FOUND,
        `World ranking not found: ${ranking.id}`,
      );
    }

    this.rankings.set(ranking.id, ranking);
    return ranking;
  }

  async deleteBySystemDate(
    rankingSystem: GolfWorldRanking["rankingSystem"],
    asOfDate: string,
  ): Promise<void> {
    for (const [id, ranking] of this.rankings.entries()) {
      if (
        ranking.rankingSystem === rankingSystem &&
        ranking.asOfDate === asOfDate
      ) {
        this.rankings.delete(id);
      }
    }
  }

  async clear(): Promise<void> {
    this.rankings.clear();
  }
}
