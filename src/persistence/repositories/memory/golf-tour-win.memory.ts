import type { GolfTourWin } from "@/modules/golf-tour-wins/types";
import type { GolfTourWinRepository } from "../types";

export class MemoryGolfTourWinRepository implements GolfTourWinRepository {
  private readonly wins = new Map<string, GolfTourWin>();

  async listByTourSeason(
    tourId: string,
    seasonYear: number,
  ): Promise<GolfTourWin[]> {
    return [...this.wins.values()]
      .filter(
        (win) => win.tourId === tourId && win.seasonYear === seasonYear,
      )
      .sort((a, b) => a.golferId.localeCompare(b.golferId));
  }

  async listDistinctGolfersByTourSeason(
    tourId: string,
    seasonYear: number,
  ): Promise<string[]> {
    const wins = await this.listByTourSeason(tourId, seasonYear);
    return [...new Set(wins.map((win) => win.golferId))];
  }

  async countDistinctGolfersByTourSeason(
    tourId: string,
    seasonYear: number,
  ): Promise<number> {
    return (await this.listDistinctGolfersByTourSeason(tourId, seasonYear))
      .length;
  }

  async get(id: string): Promise<GolfTourWin | null> {
    return this.wins.get(id) ?? null;
  }

  async create(win: GolfTourWin): Promise<GolfTourWin> {
    this.wins.set(win.id, win);
    return win;
  }

  async delete(id: string): Promise<boolean> {
    return this.wins.delete(id);
  }

  async clear(): Promise<void> {
    this.wins.clear();
  }
}
