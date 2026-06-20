import type { TennisPlayer } from "@/modules/tennis-players/types";
import { TennisPlayerError, TennisPlayerErrorCodes } from "@/modules/tennis-players/errors";
import type {
  PlayerBaselineAttributes,
  PlayerNetAttributes,
  PlayerReturnAttributes,
  PlayerServeAttributes,
  PlayerSurfacePreferences,
} from "tennis-sim-library";
import type { Database } from "better-sqlite3";
import { SqliteError } from "better-sqlite3";
import type { TennisPlayerRepository } from "../types";
import type { ListOptions } from "@/lib/pagination";
import { humanDisplayName } from "@/modules/humans/transform";
import type { HumanGender } from "@/modules/humans/types";
import type { TennisBackhandStyle } from "@/modules/tennis-players/types";
import {
  sqliteListBindings,
  sqliteListSuffix,
} from "./list-pagination";

type TennisPlayerRow = {
  id: string;
  human_id: string;
  given_name: string;
  family_name: string;
  preferred_name: string | null;
  human_gender: HumanGender;
  plays_left_handed: number;
  backhand_style: TennisBackhandStyle;
  turned_pro_year: number | null;
  serve_json: string;
  return_json: string;
  baseline_json: string;
  net_json: string;
  surface_preference_json: string | null;
};

function rowToTennisPlayer(row: TennisPlayerRow): TennisPlayer {
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
    backhandStyle: row.backhand_style,
    turnedProYear: row.turned_pro_year,
    serve: JSON.parse(row.serve_json) as PlayerServeAttributes,
    return: JSON.parse(row.return_json) as PlayerReturnAttributes,
    baseline: JSON.parse(row.baseline_json) as PlayerBaselineAttributes,
    net: JSON.parse(row.net_json) as PlayerNetAttributes,
    surfacePreference: row.surface_preference_json
      ? (JSON.parse(row.surface_preference_json) as PlayerSurfacePreferences)
      : null,
  };
}

const TENNIS_PLAYER_SELECT = `
  SELECT
    tp.id,
    tp.human_id,
    h.given_name,
    h.family_name,
    h.preferred_name,
    h.gender AS human_gender,
    tp.plays_left_handed,
    tp.backhand_style,
    tp.turned_pro_year,
    tp.serve_json,
    tp.return_json,
    tp.baseline_json,
    tp.net_json,
    tp.surface_preference_json
  FROM tennis_players tp
  INNER JOIN humans h ON h.id = tp.human_id
`;

export class SqliteTennisPlayerRepository implements TennisPlayerRepository {
  constructor(private readonly db: Database) {}

  async list(options?: ListOptions): Promise<TennisPlayer[]> {
    const rows = this.db
      .prepare(
        `${TENNIS_PLAYER_SELECT} ORDER BY h.family_name COLLATE NOCASE ASC, h.given_name COLLATE NOCASE ASC${sqliteListSuffix(options)}`,
      )
      .all(...sqliteListBindings(options)) as TennisPlayerRow[];
    return rows.map(rowToTennisPlayer);
  }

  async count(): Promise<number> {
    const row = this.db
      .prepare("SELECT COUNT(*) AS count FROM tennis_players")
      .get() as { count: number };
    return row.count;
  }

  async get(id: string): Promise<TennisPlayer | null> {
    const row = this.db
      .prepare(`${TENNIS_PLAYER_SELECT} WHERE tp.id = ?`)
      .get(id) as TennisPlayerRow | undefined;
    return row ? rowToTennisPlayer(row) : null;
  }

  async getByHumanId(humanId: string): Promise<TennisPlayer | null> {
    const row = this.db
      .prepare(`${TENNIS_PLAYER_SELECT} WHERE tp.human_id = ?`)
      .get(humanId) as TennisPlayerRow | undefined;
    return row ? rowToTennisPlayer(row) : null;
  }

  async create(player: TennisPlayer): Promise<TennisPlayer> {
    try {
      this.db
        .prepare(
          `INSERT INTO tennis_players (
            id,
            human_id,
            plays_left_handed,
            backhand_style,
            turned_pro_year,
            serve_json,
            return_json,
            baseline_json,
            net_json,
            surface_preference_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          player.id,
          player.humanId,
          player.playsLeftHanded ? 1 : 0,
          player.backhandStyle,
          player.turnedProYear,
          JSON.stringify(player.serve),
          JSON.stringify(player.return),
          JSON.stringify(player.baseline),
          JSON.stringify(player.net),
          player.surfacePreference
            ? JSON.stringify(player.surfacePreference)
            : null,
        );
    } catch (error) {
      if (error instanceof SqliteError) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
          throw new TennisPlayerError(
            TennisPlayerErrorCodes.TENNIS_PLAYER_ALREADY_EXISTS,
            `Tennis player profile already exists for human: ${player.humanId}`,
          );
        }
        if (error.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
          throw new TennisPlayerError(
            TennisPlayerErrorCodes.HUMAN_NOT_FOUND,
            `Human not found: ${player.humanId}`,
          );
        }
      }
      throw error;
    }

    return (await this.get(player.id)) ?? player;
  }

  async delete(id: string): Promise<boolean> {
    const result = this.db
      .prepare("DELETE FROM tennis_players WHERE id = ?")
      .run(id);
    return result.changes > 0;
  }

  async clear(): Promise<void> {
    this.db.prepare("DELETE FROM tennis_players").run();
  }
}
