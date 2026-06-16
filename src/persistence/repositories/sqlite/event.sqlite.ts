import type { EventRecord } from "@/modules/events/types";
import type { Database } from "better-sqlite3";
import type { ListOptions } from "@/lib/pagination";
import type { EventRepository } from "../types";
import {
  sqliteListBindings,
  sqliteListSuffix,
} from "./list-pagination";

type EventRow = {
  id: string;
  parent_id: string | null;
  venue_id: string;
  name: string;
  local_start_year: number;
  local_start_month: number;
  local_start_day: number;
  local_start_hour: number;
  local_start_minute: number;
  local_start_second: number;
  iso_utc_start: string;
  iso_utc_end: string;
  duration_minutes: number;
};

const EVENT_COLUMNS = `
  id,
  parent_id,
  venue_id,
  name,
  local_start_year,
  local_start_month,
  local_start_day,
  local_start_hour,
  local_start_minute,
  local_start_second,
  iso_utc_start,
  iso_utc_end,
  duration_minutes
`;

function rowToEvent(row: EventRow): EventRecord {
  return {
    id: row.id,
    parentId: row.parent_id,
    venueId: row.venue_id,
    name: row.name,
    localStart: {
      year: row.local_start_year,
      month: row.local_start_month,
      day: row.local_start_day,
      hour: row.local_start_hour,
      minute: row.local_start_minute,
      second: row.local_start_second,
    },
    isoUtcStart: row.iso_utc_start,
    isoUtcEnd: row.iso_utc_end,
    durationMinutes: row.duration_minutes,
  };
}

export class SqliteEventRepository implements EventRepository {
  constructor(private readonly db: Database) {}

  async list(options?: ListOptions): Promise<EventRecord[]> {
    const rows = this.db
      .prepare(
        `SELECT ${EVENT_COLUMNS} FROM events ORDER BY iso_utc_start ASC${sqliteListSuffix(options)}`,
      )
      .all(...sqliteListBindings(options)) as EventRow[];
    return rows.map(rowToEvent);
  }

  async count(): Promise<number> {
    const row = this.db
      .prepare("SELECT COUNT(*) AS count FROM events")
      .get() as { count: number };
    return row.count;
  }

  async listByVenue(venueId: string): Promise<EventRecord[]> {
    const rows = this.db
      .prepare(
        `SELECT ${EVENT_COLUMNS}
         FROM events
         WHERE venue_id = ?
         ORDER BY iso_utc_start ASC`,
      )
      .all(venueId) as EventRow[];
    return rows.map(rowToEvent);
  }

  async listDirectChildren(parentId: string): Promise<EventRecord[]> {
    const rows = this.db
      .prepare(
        `SELECT ${EVENT_COLUMNS}
         FROM events
         WHERE parent_id = ?
         ORDER BY iso_utc_start ASC`,
      )
      .all(parentId) as EventRow[];
    return rows.map(rowToEvent);
  }

  async listActiveAt(isoUtc: string): Promise<EventRecord[]> {
    const rows = this.db
      .prepare(
        `SELECT ${EVENT_COLUMNS}
         FROM events
         WHERE iso_utc_start <= ? AND iso_utc_end > ?
         ORDER BY iso_utc_start ASC`,
      )
      .all(isoUtc, isoUtc) as EventRow[];
    return rows.map(rowToEvent);
  }

  async get(id: string): Promise<EventRecord | null> {
    const row = this.db
      .prepare(`SELECT ${EVENT_COLUMNS} FROM events WHERE id = ?`)
      .get(id) as EventRow | undefined;
    return row ? rowToEvent(row) : null;
  }

  async create(event: EventRecord): Promise<EventRecord> {
    this.db
      .prepare(
        `INSERT INTO events (
          id,
          parent_id,
          venue_id,
          name,
          local_start_year,
          local_start_month,
          local_start_day,
          local_start_hour,
          local_start_minute,
          local_start_second,
          iso_utc_start,
          iso_utc_end,
          duration_minutes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        event.id,
        event.parentId,
        event.venueId,
        event.name,
        event.localStart.year,
        event.localStart.month,
        event.localStart.day,
        event.localStart.hour,
        event.localStart.minute,
        event.localStart.second,
        event.isoUtcStart,
        event.isoUtcEnd,
        event.durationMinutes,
      );
    return event;
  }

  async update(event: EventRecord): Promise<EventRecord> {
    this.db
      .prepare(
        `UPDATE events
         SET
           parent_id = ?,
           venue_id = ?,
           name = ?,
           local_start_year = ?,
           local_start_month = ?,
           local_start_day = ?,
           local_start_hour = ?,
           local_start_minute = ?,
           local_start_second = ?,
           iso_utc_start = ?,
           iso_utc_end = ?,
           duration_minutes = ?
         WHERE id = ?`,
      )
      .run(
        event.parentId,
        event.venueId,
        event.name,
        event.localStart.year,
        event.localStart.month,
        event.localStart.day,
        event.localStart.hour,
        event.localStart.minute,
        event.localStart.second,
        event.isoUtcStart,
        event.isoUtcEnd,
        event.durationMinutes,
        event.id,
      );
    return event;
  }

  async delete(id: string): Promise<boolean> {
    const result = this.db.prepare("DELETE FROM events WHERE id = ?").run(id);
    return result.changes > 0;
  }

  async clear(): Promise<void> {
    this.db.prepare("DELETE FROM events").run();
  }
}
