import type {
  TennisEntryCriteria,
  TennisSeasonSchedule,
  TennisTour,
  TennisTourSchedulerState,
  TennisTournament,
  TennisTournamentScheduleReference,
  TennisTournamentVenue,
  TennisVenueMode,
} from "@/modules/tennis/types";
import type { Database } from "better-sqlite3";
import type {
  TennisSeasonScheduleRepository,
  TennisTourRepository,
  TennisTourSchedulerStateRepository,
  TennisTournamentRepository,
  TennisTournamentVenueRepository,
} from "../types";

function parseEntryCriteria(json: string): TennisEntryCriteria {
  return JSON.parse(json) as TennisEntryCriteria;
}

function parseScheduleReference(
  json: string | null,
): TennisTournamentScheduleReference | null {
  if (!json) {
    return null;
  }
  return JSON.parse(json) as TennisTournamentScheduleReference;
}

function serializeScheduleReference(
  reference: TennisTournamentScheduleReference | null,
): string | null {
  return reference ? JSON.stringify(reference) : null;
}

function rowToTournament(row: {
  id: string;
  tour_id: string;
  slug: string;
  name: string;
  is_major: number;
  prize_money_usd: number;
  entry_criteria_json: string;
  venue_mode: TennisVenueMode;
  typical_duration_days: number;
  active_court_count: number;
  draw_size: number;
  season_start_month: number;
  season_start_day: number;
  rotation_epoch_year: number | null;
  sort_order: number;
  materialize_on_schedule: number;
  schedule_reference_json: string | null;
}): TennisTournament {
  return {
    id: row.id,
    tourId: row.tour_id,
    slug: row.slug,
    name: row.name,
    isMajor: row.is_major === 1,
    prizeMoneyUsd: row.prize_money_usd,
    entryCriteria: parseEntryCriteria(row.entry_criteria_json),
    venueMode: row.venue_mode,
    typicalDurationDays: row.typical_duration_days,
    activeCourtCount: row.active_court_count,
    drawSize: row.draw_size,
    seasonStartMonth: row.season_start_month,
    seasonStartDay: row.season_start_day,
    rotationEpochYear: row.rotation_epoch_year,
    sortOrder: row.sort_order,
    materializeOnSchedule: row.materialize_on_schedule === 1,
    scheduleReference: parseScheduleReference(row.schedule_reference_json),
  };
}

const TOURNAMENT_COLUMNS = `
  id, tour_id, slug, name, is_major, prize_money_usd, entry_criteria_json,
  venue_mode, typical_duration_days, active_court_count, draw_size, season_start_month,
  season_start_day, rotation_epoch_year, sort_order, materialize_on_schedule,
  schedule_reference_json
`;

const TOUR_SELECT = "SELECT id, name, abbreviation, logo FROM tennis_tours";

export class SqliteTennisTourRepository implements TennisTourRepository {
  constructor(private readonly db: Database) {}

  async list(): Promise<TennisTour[]> {
    const rows = this.db
      .prepare(`${TOUR_SELECT} ORDER BY name ASC`)
      .all() as TennisTour[];
    return rows;
  }

  async get(id: string): Promise<TennisTour | null> {
    const row = this.db
      .prepare(`${TOUR_SELECT} WHERE id = ?`)
      .get(id) as TennisTour | undefined;
    return row ?? null;
  }

  async getByAbbreviation(abbreviation: string): Promise<TennisTour | null> {
    const row = this.db
      .prepare(`${TOUR_SELECT} WHERE upper(abbreviation) = upper(?)`)
      .get(abbreviation) as TennisTour | undefined;
    return row ?? null;
  }

  async create(tour: TennisTour): Promise<TennisTour> {
    this.db
      .prepare(
        "INSERT INTO tennis_tours (id, name, abbreviation, logo) VALUES (?, ?, ?, ?)",
      )
      .run(tour.id, tour.name, tour.abbreviation, tour.logo);
    return tour;
  }

  async updateLogo(id: string, logo: string): Promise<void> {
    this.db.prepare("UPDATE tennis_tours SET logo = ? WHERE id = ?").run(logo, id);
  }

  async delete(id: string): Promise<boolean> {
    const result = this.db.prepare("DELETE FROM tennis_tours WHERE id = ?").run(id);
    return result.changes > 0;
  }

  async clear(): Promise<void> {
    this.db.prepare("DELETE FROM tennis_tours").run();
  }
}

export class SqliteTennisTournamentRepository implements TennisTournamentRepository {
  constructor(private readonly db: Database) {}

  async listByTour(tourId: string): Promise<TennisTournament[]> {
    const rows = this.db
      .prepare(
        `SELECT ${TOURNAMENT_COLUMNS}
         FROM tennis_tournaments
         WHERE tour_id = ?
         ORDER BY sort_order ASC`,
      )
      .all(tourId) as Parameters<typeof rowToTournament>[0][];
    return rows.map(rowToTournament);
  }

  async get(id: string): Promise<TennisTournament | null> {
    const row = this.db
      .prepare(`SELECT ${TOURNAMENT_COLUMNS} FROM tennis_tournaments WHERE id = ?`)
      .get(id) as Parameters<typeof rowToTournament>[0] | undefined;
    return row ? rowToTournament(row) : null;
  }

  async getBySlug(tourId: string, slug: string): Promise<TennisTournament | null> {
    const row = this.db
      .prepare(
        `SELECT ${TOURNAMENT_COLUMNS}
         FROM tennis_tournaments
         WHERE tour_id = ? AND lower(slug) = lower(?)`,
      )
      .get(tourId, slug) as Parameters<typeof rowToTournament>[0] | undefined;
    return row ? rowToTournament(row) : null;
  }

  async create(tournament: TennisTournament): Promise<TennisTournament> {
    this.db
      .prepare(
        `INSERT INTO tennis_tournaments (
          id, tour_id, slug, name, is_major, prize_money_usd, entry_criteria_json,
          venue_mode, typical_duration_days, active_court_count, draw_size, season_start_month,
          season_start_day, rotation_epoch_year, sort_order, materialize_on_schedule,
          schedule_reference_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        tournament.id,
        tournament.tourId,
        tournament.slug,
        tournament.name,
        tournament.isMajor ? 1 : 0,
        tournament.prizeMoneyUsd,
        JSON.stringify(tournament.entryCriteria),
        tournament.venueMode,
        tournament.typicalDurationDays,
        tournament.activeCourtCount,
        tournament.drawSize,
        tournament.seasonStartMonth,
        tournament.seasonStartDay,
        tournament.rotationEpochYear,
        tournament.sortOrder,
        tournament.materializeOnSchedule ? 1 : 0,
        serializeScheduleReference(tournament.scheduleReference),
      );
    return tournament;
  }

  async updateMaterializeOnSchedule(
    id: string,
    materializeOnSchedule: boolean,
  ): Promise<void> {
    this.db
      .prepare(
        "UPDATE tennis_tournaments SET materialize_on_schedule = ? WHERE id = ?",
      )
      .run(materializeOnSchedule ? 1 : 0, id);
  }

  async updateScheduleReference(
    id: string,
    scheduleReference: TennisTournamentScheduleReference | null,
  ): Promise<void> {
    this.db
      .prepare(
        "UPDATE tennis_tournaments SET schedule_reference_json = ? WHERE id = ?",
      )
      .run(serializeScheduleReference(scheduleReference), id);
  }

  async delete(id: string): Promise<boolean> {
    const result = this.db
      .prepare("DELETE FROM tennis_tournaments WHERE id = ?")
      .run(id);
    return result.changes > 0;
  }

  async clear(): Promise<void> {
    this.db.prepare("DELETE FROM tennis_tournaments").run();
  }
}

export class SqliteTennisTournamentVenueRepository
  implements TennisTournamentVenueRepository
{
  constructor(private readonly db: Database) {}

  async listByTournament(tournamentId: string): Promise<TennisTournamentVenue[]> {
    const rows = this.db
      .prepare(
        `SELECT id, tournament_id, venue_id, rotation_order, is_default
         FROM tennis_tournament_venues
         WHERE tournament_id = ?
         ORDER BY rotation_order ASC`,
      )
      .all(tournamentId) as {
      id: string;
      tournament_id: string;
      venue_id: string;
      rotation_order: number;
      is_default: number;
    }[];

    return rows.map((row) => ({
      id: row.id,
      tournamentId: row.tournament_id,
      venueId: row.venue_id,
      rotationOrder: row.rotation_order,
      isDefault: row.is_default === 1,
    }));
  }

  async create(link: TennisTournamentVenue): Promise<TennisTournamentVenue> {
    this.db
      .prepare(
        `INSERT INTO tennis_tournament_venues (
          id, tournament_id, venue_id, rotation_order, is_default
        ) VALUES (?, ?, ?, ?, ?)`,
      )
      .run(
        link.id,
        link.tournamentId,
        link.venueId,
        link.rotationOrder,
        link.isDefault ? 1 : 0,
      );
    return link;
  }

  async deleteByTournament(tournamentId: string): Promise<void> {
    this.db
      .prepare("DELETE FROM tennis_tournament_venues WHERE tournament_id = ?")
      .run(tournamentId);
  }

  async clear(): Promise<void> {
    this.db.prepare("DELETE FROM tennis_tournament_venues").run();
  }
}

export class SqliteTennisSeasonScheduleRepository
  implements TennisSeasonScheduleRepository
{
  constructor(private readonly db: Database) {}

  async listByTour(
    tourId: string,
    seasonYear?: number,
  ): Promise<TennisSeasonSchedule[]> {
    const rows =
      seasonYear === undefined
        ? (this.db
            .prepare(
              `SELECT id, tour_id, tournament_id, season_year, venue_id,
                      root_event_id, scheduled_at_iso_utc
               FROM tennis_season_schedules
               WHERE tour_id = ?
               ORDER BY season_year ASC`,
            )
            .all(tourId) as TennisSeasonScheduleRow[])
        : (this.db
            .prepare(
              `SELECT id, tour_id, tournament_id, season_year, venue_id,
                      root_event_id, scheduled_at_iso_utc
               FROM tennis_season_schedules
               WHERE tour_id = ? AND season_year = ?
               ORDER BY season_year ASC`,
            )
            .all(tourId, seasonYear) as TennisSeasonScheduleRow[]);

    return rows.map(rowToSchedule);
  }

  async getByTourTournamentSeason(
    tourId: string,
    tournamentId: string,
    seasonYear: number,
  ): Promise<TennisSeasonSchedule | null> {
    const row = this.db
      .prepare(
        `SELECT id, tour_id, tournament_id, season_year, venue_id,
                root_event_id, scheduled_at_iso_utc
         FROM tennis_season_schedules
         WHERE tour_id = ? AND tournament_id = ? AND season_year = ?`,
      )
      .get(tourId, tournamentId, seasonYear) as TennisSeasonScheduleRow | undefined;
    return row ? rowToSchedule(row) : null;
  }

  async create(schedule: TennisSeasonSchedule): Promise<TennisSeasonSchedule> {
    this.db
      .prepare(
        `INSERT INTO tennis_season_schedules (
          id, tour_id, tournament_id, season_year, venue_id,
          root_event_id, scheduled_at_iso_utc
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        schedule.id,
        schedule.tourId,
        schedule.tournamentId,
        schedule.seasonYear,
        schedule.venueId,
        schedule.rootEventId,
        schedule.scheduledAtIsoUtc,
      );
    return schedule;
  }

  async deleteByTourSeason(tourId: string, seasonYear: number): Promise<void> {
    this.db
      .prepare(
        "DELETE FROM tennis_season_schedules WHERE tour_id = ? AND season_year = ?",
      )
      .run(tourId, seasonYear);
  }

  async clear(): Promise<void> {
    this.db.prepare("DELETE FROM tennis_season_schedules").run();
  }
}

type TennisSeasonScheduleRow = {
  id: string;
  tour_id: string;
  tournament_id: string;
  season_year: number;
  venue_id: string;
  root_event_id: string;
  scheduled_at_iso_utc: string;
};

function rowToSchedule(row: TennisSeasonScheduleRow): TennisSeasonSchedule {
  return {
    id: row.id,
    tourId: row.tour_id,
    tournamentId: row.tournament_id,
    seasonYear: row.season_year,
    venueId: row.venue_id,
    rootEventId: row.root_event_id,
    scheduledAtIsoUtc: row.scheduled_at_iso_utc,
  };
}

export class SqliteTennisTourSchedulerStateRepository
  implements TennisTourSchedulerStateRepository
{
  constructor(private readonly db: Database) {}

  async get(tourAbbreviation: string): Promise<TennisTourSchedulerState | null> {
    const row = this.db
      .prepare(
        `SELECT tour_abbreviation, last_processed_iso_utc, last_scheduled_season_year
         FROM tennis_tour_scheduler_state
         WHERE tour_abbreviation = ?`,
      )
      .get(tourAbbreviation.trim().toUpperCase()) as
      | {
          tour_abbreviation: string;
          last_processed_iso_utc: string;
          last_scheduled_season_year: number | null;
        }
      | undefined;

    if (!row) {
      return null;
    }

    return {
      tourAbbreviation: row.tour_abbreviation,
      lastProcessedIsoUtc: row.last_processed_iso_utc,
      lastScheduledSeasonYear: row.last_scheduled_season_year,
    };
  }

  async upsert(state: TennisTourSchedulerState): Promise<TennisTourSchedulerState> {
    const normalized = {
      ...state,
      tourAbbreviation: state.tourAbbreviation.trim().toUpperCase(),
    };

    this.db
      .prepare(
        `INSERT INTO tennis_tour_scheduler_state (
          tour_abbreviation, last_processed_iso_utc, last_scheduled_season_year
        ) VALUES (?, ?, ?)
        ON CONFLICT(tour_abbreviation) DO UPDATE SET
          last_processed_iso_utc = excluded.last_processed_iso_utc,
          last_scheduled_season_year = excluded.last_scheduled_season_year`,
      )
      .run(
        normalized.tourAbbreviation,
        normalized.lastProcessedIsoUtc,
        normalized.lastScheduledSeasonYear,
      );

    return normalized;
  }

  async clear(): Promise<void> {
    this.db.prepare("DELETE FROM tennis_tour_scheduler_state").run();
  }
}
