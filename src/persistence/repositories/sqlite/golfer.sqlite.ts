import type { Golfer } from "@/modules/golfers/types";
import type {
  GolferApproachAttributes,
  GolferClubAttributes,
  GolferPuttingAttributes,
  GolferShortGameAttributes,
  GolferTeeShotAttributes,
} from "golf-sim-library";
import { GolferError, GolferErrorCodes } from "@/modules/golfers/errors";
import type { Database } from "better-sqlite3";
import { SqliteError } from "better-sqlite3";
import type { GolferRepository } from "../types";
import type { ListOptions } from "@/lib/pagination";
import { humanDisplayName } from "@/modules/humans/transform";
import type { HumanGender } from "@/modules/humans/types";
import {
  sqliteListBindings,
  sqliteListSuffix,
} from "./list-pagination";

type GolferRow = {
  id: string;
  human_id: string;
  given_name: string;
  family_name: string;
  preferred_name: string | null;
  human_gender: HumanGender;
  plays_left_handed: number;
  turned_pro_year: number | null;
  putting_json: string;
  approach_json: string;
  short_game_json: string;
  tee_shot_json: string;
  clubs_json: string;
};

function rowToGolfer(row: GolferRow): Golfer {
  return {
    id: row.id,
    humanId: row.human_id,
    humanDisplayName: humanDisplayName({
      givenName: row.given_name,
      familyName: row.family_name,
      preferredName: row.preferred_name,
    }),
    humanGender: row.human_gender,
    playsLeftHanded: row.plays_left_handed === 1,
    turnedProYear: row.turned_pro_year,
    putting: JSON.parse(row.putting_json) as GolferPuttingAttributes,
    approach: JSON.parse(row.approach_json) as GolferApproachAttributes,
    shortGame: JSON.parse(row.short_game_json) as GolferShortGameAttributes,
    teeShot: JSON.parse(row.tee_shot_json) as GolferTeeShotAttributes,
    clubs: JSON.parse(row.clubs_json) as GolferClubAttributes,
  };
}

const GOLFER_SELECT = `
  SELECT
    g.id,
    g.human_id,
    h.given_name,
    h.family_name,
    h.preferred_name,
    h.gender AS human_gender,
    g.plays_left_handed,
    g.turned_pro_year,
    g.putting_json,
    g.approach_json,
    g.short_game_json,
    g.tee_shot_json,
    g.clubs_json
  FROM golfers g
  INNER JOIN humans h ON h.id = g.human_id
`;

export class SqliteGolferRepository implements GolferRepository {
  constructor(private readonly db: Database) {}

  async list(options?: ListOptions): Promise<Golfer[]> {
    const rows = this.db
      .prepare(
        `${GOLFER_SELECT} ORDER BY h.family_name COLLATE NOCASE ASC, h.given_name COLLATE NOCASE ASC${sqliteListSuffix(options)}`,
      )
      .all(...sqliteListBindings(options)) as GolferRow[];
    return rows.map(rowToGolfer);
  }

  async count(): Promise<number> {
    const row = this.db
      .prepare("SELECT COUNT(*) AS count FROM golfers")
      .get() as { count: number };
    return row.count;
  }

  async get(id: string): Promise<Golfer | null> {
    const row = this.db
      .prepare(`${GOLFER_SELECT} WHERE g.id = ?`)
      .get(id) as GolferRow | undefined;
    return row ? rowToGolfer(row) : null;
  }

  async getByHumanId(humanId: string): Promise<Golfer | null> {
    const row = this.db
      .prepare(`${GOLFER_SELECT} WHERE g.human_id = ?`)
      .get(humanId) as GolferRow | undefined;
    return row ? rowToGolfer(row) : null;
  }

  async create(golfer: Golfer): Promise<Golfer> {
    try {
      this.db
        .prepare(
          `INSERT INTO golfers (
            id,
            human_id,
            plays_left_handed,
            turned_pro_year,
            putting_json,
            approach_json,
            short_game_json,
            tee_shot_json,
            clubs_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          golfer.id,
          golfer.humanId,
          golfer.playsLeftHanded ? 1 : 0,
          golfer.turnedProYear,
          JSON.stringify(golfer.putting),
          JSON.stringify(golfer.approach),
          JSON.stringify(golfer.shortGame),
          JSON.stringify(golfer.teeShot),
          JSON.stringify(golfer.clubs),
        );
    } catch (error) {
      if (error instanceof SqliteError) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
          throw new GolferError(
            GolferErrorCodes.GOLFER_ALREADY_EXISTS,
            `Golfer profile already exists for human: ${golfer.humanId}`,
          );
        }
        if (error.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
          throw new GolferError(
            GolferErrorCodes.HUMAN_NOT_FOUND,
            `Human not found: ${golfer.humanId}`,
          );
        }
      }
      throw error;
    }

    return (await this.get(golfer.id)) ?? golfer;
  }

  async delete(id: string): Promise<boolean> {
    const result = this.db.prepare("DELETE FROM golfers WHERE id = ?").run(id);
    return result.changes > 0;
  }

  async clear(): Promise<void> {
    this.db.prepare("DELETE FROM golfers").run();
  }
}
