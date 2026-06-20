import type { GolfTourWin } from "@/modules/golf-tour-wins/types";
import type { Database } from "better-sqlite3";
import type { GolfTourWinRepository } from "../types";

type WinRow = {
  id: string;
  golfer_id: string;
  tour_id: string;
  season_year: number;
  tournament_id: string | null;
};

function rowToWin(row: WinRow): GolfTourWin {
  return {
    id: row.id,
    golferId: row.golfer_id,
    tourId: row.tour_id,
    seasonYear: row.season_year,
    tournamentId: row.tournament_id,
  };
}

export class SqliteGolfTourWinRepository implements GolfTourWinRepository {
  constructor(private readonly db: Database) {}

  async listByTourSeason(
    tourId: string,
    seasonYear: number,
  ): Promise<GolfTourWin[]> {
    const rows = this.db
      .prepare(
        `SELECT id, golfer_id, tour_id, season_year, tournament_id
         FROM golf_tour_wins
         WHERE tour_id = ? AND season_year = ?
         ORDER BY golfer_id ASC`,
      )
      .all(tourId, seasonYear) as WinRow[];
    return rows.map(rowToWin);
  }

  async listDistinctGolfersByTourSeason(
    tourId: string,
    seasonYear: number,
  ): Promise<string[]> {
    const rows = this.db
      .prepare(
        `SELECT DISTINCT golfer_id
         FROM golf_tour_wins
         WHERE tour_id = ? AND season_year = ?
         ORDER BY golfer_id ASC`,
      )
      .all(tourId, seasonYear) as { golfer_id: string }[];
    return rows.map((row) => row.golfer_id);
  }

  async countDistinctGolfersByTourSeason(
    tourId: string,
    seasonYear: number,
  ): Promise<number> {
    const row = this.db
      .prepare(
        `SELECT COUNT(DISTINCT golfer_id) AS count
         FROM golf_tour_wins
         WHERE tour_id = ? AND season_year = ?`,
      )
      .get(tourId, seasonYear) as { count: number };
    return row.count;
  }

  async get(id: string): Promise<GolfTourWin | null> {
    const row = this.db
      .prepare(
        `SELECT id, golfer_id, tour_id, season_year, tournament_id
         FROM golf_tour_wins
         WHERE id = ?`,
      )
      .get(id) as WinRow | undefined;
    return row ? rowToWin(row) : null;
  }

  async create(win: GolfTourWin): Promise<GolfTourWin> {
    this.db
      .prepare(
        `INSERT INTO golf_tour_wins (
           id, golfer_id, tour_id, season_year, tournament_id
         ) VALUES (?, ?, ?, ?, ?)`,
      )
      .run(
        win.id,
        win.golferId,
        win.tourId,
        win.seasonYear,
        win.tournamentId,
      );

    return win;
  }

  async delete(id: string): Promise<boolean> {
    const result = this.db
      .prepare("DELETE FROM golf_tour_wins WHERE id = ?")
      .run(id);
    return result.changes > 0;
  }

  async clear(): Promise<void> {
    this.db.prepare("DELETE FROM golf_tour_wins").run();
  }
}
