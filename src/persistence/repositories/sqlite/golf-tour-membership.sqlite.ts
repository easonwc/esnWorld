import type { GolfTourMembership } from "@/modules/golf-tour-memberships/types";
import {
  GolfTourMembershipError,
  GolfTourMembershipErrorCodes,
} from "@/modules/golf-tour-memberships/errors";
import type { Database } from "better-sqlite3";
import { SqliteError } from "better-sqlite3";
import type { GolfTourMembershipRepository } from "../types";

type MembershipRow = {
  id: string;
  golfer_id: string;
  tour_id: string;
  season_year: number;
  status: GolfTourMembership["status"];
  overall_skill: number;
};

function rowToMembership(row: MembershipRow): GolfTourMembership {
  return {
    id: row.id,
    golferId: row.golfer_id,
    tourId: row.tour_id,
    seasonYear: row.season_year,
    status: row.status,
    overallSkill: row.overall_skill,
  };
}

export class SqliteGolfTourMembershipRepository
  implements GolfTourMembershipRepository
{
  constructor(private readonly db: Database) {}

  async listByTourSeason(
    tourId: string,
    seasonYear: number,
  ): Promise<GolfTourMembership[]> {
    const rows = this.db
      .prepare(
        `SELECT id, golfer_id, tour_id, season_year, status, overall_skill
         FROM golf_tour_memberships
         WHERE tour_id = ? AND season_year = ?
         ORDER BY overall_skill DESC, golfer_id ASC`,
      )
      .all(tourId, seasonYear) as MembershipRow[];
    return rows.map(rowToMembership);
  }

  async countByTourSeason(tourId: string, seasonYear: number): Promise<number> {
    const row = this.db
      .prepare(
        `SELECT COUNT(*) AS count
         FROM golf_tour_memberships
         WHERE tour_id = ? AND season_year = ?`,
      )
      .get(tourId, seasonYear) as { count: number };
    return row.count;
  }

  async get(id: string): Promise<GolfTourMembership | null> {
    const row = this.db
      .prepare(
        `SELECT id, golfer_id, tour_id, season_year, status, overall_skill
         FROM golf_tour_memberships
         WHERE id = ?`,
      )
      .get(id) as MembershipRow | undefined;
    return row ? rowToMembership(row) : null;
  }

  async getByGolferTourSeason(
    golferId: string,
    tourId: string,
    seasonYear: number,
  ): Promise<GolfTourMembership | null> {
    const row = this.db
      .prepare(
        `SELECT id, golfer_id, tour_id, season_year, status, overall_skill
         FROM golf_tour_memberships
         WHERE golfer_id = ? AND tour_id = ? AND season_year = ?`,
      )
      .get(golferId, tourId, seasonYear) as MembershipRow | undefined;
    return row ? rowToMembership(row) : null;
  }

  async create(membership: GolfTourMembership): Promise<GolfTourMembership> {
    try {
      this.db
        .prepare(
          `INSERT INTO golf_tour_memberships (
             id, golfer_id, tour_id, season_year, status, overall_skill
           ) VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .run(
          membership.id,
          membership.golferId,
          membership.tourId,
          membership.seasonYear,
          membership.status,
          membership.overallSkill,
        );
    } catch (error) {
      if (
        error instanceof SqliteError &&
        error.code === "SQLITE_CONSTRAINT_UNIQUE"
      ) {
        throw new GolfTourMembershipError(
          GolfTourMembershipErrorCodes.MEMBERSHIP_ALREADY_EXISTS,
          `Tour membership already exists for golfer ${membership.golferId}`,
        );
      }
      throw error;
    }

    return membership;
  }

  async delete(id: string): Promise<boolean> {
    const result = this.db
      .prepare("DELETE FROM golf_tour_memberships WHERE id = ?")
      .run(id);
    return result.changes > 0;
  }

  async clear(): Promise<void> {
    this.db.prepare("DELETE FROM golf_tour_memberships").run();
  }
}
