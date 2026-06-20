import type {
  TennisSeasonSchedule,
  TennisTour,
  TennisTourSchedulerState,
  TennisTournament,
  TennisTournamentScheduleReference,
  TennisTournamentVenue,
} from "@/modules/tennis/types";
import type {
  TennisSeasonScheduleRepository,
  TennisTourRepository,
  TennisTourSchedulerStateRepository,
  TennisTournamentRepository,
  TennisTournamentVenueRepository,
} from "../types";

export class MemoryTennisTourRepository implements TennisTourRepository {
  private readonly tours = new Map<string, TennisTour>();

  async list(): Promise<TennisTour[]> {
    return [...this.tours.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  async get(id: string): Promise<TennisTour | null> {
    return this.tours.get(id) ?? null;
  }

  async getByAbbreviation(abbreviation: string): Promise<TennisTour | null> {
    const normalized = abbreviation.trim().toUpperCase();
    return (
      [...this.tours.values()].find(
        (tour) => tour.abbreviation.toUpperCase() === normalized,
      ) ?? null
    );
  }

  async create(tour: TennisTour): Promise<TennisTour> {
    this.tours.set(tour.id, tour);
    return tour;
  }

  async updateLogo(id: string, logo: string): Promise<void> {
    const tour = this.tours.get(id);
    if (tour) {
      this.tours.set(id, { ...tour, logo });
    }
  }

  async delete(id: string): Promise<boolean> {
    return this.tours.delete(id);
  }

  async clear(): Promise<void> {
    this.tours.clear();
  }
}

export class MemoryTennisTournamentRepository implements TennisTournamentRepository {
  private readonly tournaments = new Map<string, TennisTournament>();

  async listByTour(tourId: string): Promise<TennisTournament[]> {
    return [...this.tournaments.values()]
      .filter((tournament) => tournament.tourId === tourId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async get(id: string): Promise<TennisTournament | null> {
    return this.tournaments.get(id) ?? null;
  }

  async getBySlug(tourId: string, slug: string): Promise<TennisTournament | null> {
    const normalized = slug.trim().toLowerCase();
    return (
      [...this.tournaments.values()].find(
        (tournament) =>
          tournament.tourId === tourId &&
          tournament.slug.toLowerCase() === normalized,
      ) ?? null
    );
  }

  async create(tournament: TennisTournament): Promise<TennisTournament> {
    this.tournaments.set(tournament.id, tournament);
    return tournament;
  }

  async updateMaterializeOnSchedule(
    id: string,
    materializeOnSchedule: boolean,
  ): Promise<void> {
    const tournament = this.tournaments.get(id);
    if (!tournament) {
      return;
    }
    this.tournaments.set(id, { ...tournament, materializeOnSchedule });
  }

  async updateScheduleReference(
    id: string,
    scheduleReference: TennisTournamentScheduleReference | null,
  ): Promise<void> {
    const tournament = this.tournaments.get(id);
    if (!tournament) {
      return;
    }
    this.tournaments.set(id, { ...tournament, scheduleReference });
  }

  async delete(id: string): Promise<boolean> {
    return this.tournaments.delete(id);
  }

  async clear(): Promise<void> {
    this.tournaments.clear();
  }
}

export class MemoryTennisTournamentVenueRepository
  implements TennisTournamentVenueRepository
{
  private readonly links = new Map<string, TennisTournamentVenue>();

  async listByTournament(tournamentId: string): Promise<TennisTournamentVenue[]> {
    return [...this.links.values()]
      .filter((link) => link.tournamentId === tournamentId)
      .sort((a, b) => a.rotationOrder - b.rotationOrder);
  }

  async create(link: TennisTournamentVenue): Promise<TennisTournamentVenue> {
    this.links.set(link.id, link);
    return link;
  }

  async deleteByTournament(tournamentId: string): Promise<void> {
    for (const [id, link] of this.links) {
      if (link.tournamentId === tournamentId) {
        this.links.delete(id);
      }
    }
  }

  async clear(): Promise<void> {
    this.links.clear();
  }
}

export class MemoryTennisSeasonScheduleRepository
  implements TennisSeasonScheduleRepository
{
  private readonly schedules = new Map<string, TennisSeasonSchedule>();

  async listByTour(
    tourId: string,
    seasonYear?: number,
  ): Promise<TennisSeasonSchedule[]> {
    return [...this.schedules.values()]
      .filter(
        (schedule) =>
          schedule.tourId === tourId &&
          (seasonYear === undefined || schedule.seasonYear === seasonYear),
      )
      .sort((a, b) => a.seasonYear - b.seasonYear);
  }

  async getByTourTournamentSeason(
    tourId: string,
    tournamentId: string,
    seasonYear: number,
  ): Promise<TennisSeasonSchedule | null> {
    return (
      [...this.schedules.values()].find(
        (schedule) =>
          schedule.tourId === tourId &&
          schedule.tournamentId === tournamentId &&
          schedule.seasonYear === seasonYear,
      ) ?? null
    );
  }

  async create(schedule: TennisSeasonSchedule): Promise<TennisSeasonSchedule> {
    this.schedules.set(schedule.id, schedule);
    return schedule;
  }

  async deleteByTourSeason(tourId: string, seasonYear: number): Promise<void> {
    for (const [id, schedule] of this.schedules) {
      if (schedule.tourId === tourId && schedule.seasonYear === seasonYear) {
        this.schedules.delete(id);
      }
    }
  }

  async clear(): Promise<void> {
    this.schedules.clear();
  }
}

export class MemoryTennisTourSchedulerStateRepository
  implements TennisTourSchedulerStateRepository
{
  private readonly states = new Map<string, TennisTourSchedulerState>();

  async get(tourAbbreviation: string): Promise<TennisTourSchedulerState | null> {
    return this.states.get(tourAbbreviation.trim().toUpperCase()) ?? null;
  }

  async upsert(state: TennisTourSchedulerState): Promise<TennisTourSchedulerState> {
    const normalized = {
      ...state,
      tourAbbreviation: state.tourAbbreviation.trim().toUpperCase(),
    };
    this.states.set(normalized.tourAbbreviation, normalized);
    return normalized;
  }

  async clear(): Promise<void> {
    this.states.clear();
  }
}
