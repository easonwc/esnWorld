import type {
  GolfSeasonSchedule,
  GolfTour,
  GolfTourSchedulerState,
  GolfTournament,
  GolfTournamentVenue,
} from "@/modules/golf/types";
import type {
  GolfSeasonScheduleRepository,
  GolfTourRepository,
  GolfTourSchedulerStateRepository,
  GolfTournamentRepository,
  GolfTournamentVenueRepository,
} from "../types";

export class MemoryGolfTourRepository implements GolfTourRepository {
  private readonly tours = new Map<string, GolfTour>();

  async list(): Promise<GolfTour[]> {
    return [...this.tours.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  async get(id: string): Promise<GolfTour | null> {
    return this.tours.get(id) ?? null;
  }

  async getByAbbreviation(abbreviation: string): Promise<GolfTour | null> {
    const normalized = abbreviation.trim().toUpperCase();
    return (
      [...this.tours.values()].find(
        (tour) => tour.abbreviation.toUpperCase() === normalized,
      ) ?? null
    );
  }

  async create(tour: GolfTour): Promise<GolfTour> {
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

export class MemoryGolfTournamentRepository implements GolfTournamentRepository {
  private readonly tournaments = new Map<string, GolfTournament>();

  async listByTour(tourId: string): Promise<GolfTournament[]> {
    return [...this.tournaments.values()]
      .filter((tournament) => tournament.tourId === tourId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async get(id: string): Promise<GolfTournament | null> {
    return this.tournaments.get(id) ?? null;
  }

  async getBySlug(tourId: string, slug: string): Promise<GolfTournament | null> {
    const normalized = slug.trim().toLowerCase();
    return (
      [...this.tournaments.values()].find(
        (tournament) =>
          tournament.tourId === tourId &&
          tournament.slug.toLowerCase() === normalized,
      ) ?? null
    );
  }

  async create(tournament: GolfTournament): Promise<GolfTournament> {
    this.tournaments.set(tournament.id, tournament);
    return tournament;
  }

  async delete(id: string): Promise<boolean> {
    return this.tournaments.delete(id);
  }

  async clear(): Promise<void> {
    this.tournaments.clear();
  }
}

export class MemoryGolfTournamentVenueRepository
  implements GolfTournamentVenueRepository
{
  private readonly links = new Map<string, GolfTournamentVenue>();

  async listByTournament(tournamentId: string): Promise<GolfTournamentVenue[]> {
    return [...this.links.values()]
      .filter((link) => link.tournamentId === tournamentId)
      .sort((a, b) => a.rotationOrder - b.rotationOrder);
  }

  async create(link: GolfTournamentVenue): Promise<GolfTournamentVenue> {
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

export class MemoryGolfSeasonScheduleRepository
  implements GolfSeasonScheduleRepository
{
  private readonly schedules = new Map<string, GolfSeasonSchedule>();

  async listByTour(
    tourId: string,
    seasonYear?: number,
  ): Promise<GolfSeasonSchedule[]> {
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
  ): Promise<GolfSeasonSchedule | null> {
    return (
      [...this.schedules.values()].find(
        (schedule) =>
          schedule.tourId === tourId &&
          schedule.tournamentId === tournamentId &&
          schedule.seasonYear === seasonYear,
      ) ?? null
    );
  }

  async create(schedule: GolfSeasonSchedule): Promise<GolfSeasonSchedule> {
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

export class MemoryGolfTourSchedulerStateRepository
  implements GolfTourSchedulerStateRepository
{
  private readonly states = new Map<string, GolfTourSchedulerState>();

  async get(tourAbbreviation: string): Promise<GolfTourSchedulerState | null> {
    return this.states.get(tourAbbreviation.trim().toUpperCase()) ?? null;
  }

  async upsert(state: GolfTourSchedulerState): Promise<GolfTourSchedulerState> {
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
