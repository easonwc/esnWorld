import type { GolfTourMembership } from "@/modules/golf-tour-memberships/types";
import {
  GolfTourMembershipError,
  GolfTourMembershipErrorCodes,
} from "@/modules/golf-tour-memberships/errors";
import type { GolfTourMembershipRepository } from "../types";

export class MemoryGolfTourMembershipRepository
  implements GolfTourMembershipRepository
{
  private readonly memberships = new Map<string, GolfTourMembership>();

  async listByTourSeason(
    tourId: string,
    seasonYear: number,
  ): Promise<GolfTourMembership[]> {
    return [...this.memberships.values()]
      .filter(
        (membership) =>
          membership.tourId === tourId && membership.seasonYear === seasonYear,
      )
      .sort((a, b) => {
        const skillDiff = b.overallSkill - a.overallSkill;
        if (skillDiff !== 0) {
          return skillDiff;
        }
        return a.golferId.localeCompare(b.golferId);
      });
  }

  async countByTourSeason(tourId: string, seasonYear: number): Promise<number> {
    return (await this.listByTourSeason(tourId, seasonYear)).length;
  }

  async get(id: string): Promise<GolfTourMembership | null> {
    return this.memberships.get(id) ?? null;
  }

  async getByGolferTourSeason(
    golferId: string,
    tourId: string,
    seasonYear: number,
  ): Promise<GolfTourMembership | null> {
    return (
      [...this.memberships.values()].find(
        (membership) =>
          membership.golferId === golferId &&
          membership.tourId === tourId &&
          membership.seasonYear === seasonYear,
      ) ?? null
    );
  }

  async create(membership: GolfTourMembership): Promise<GolfTourMembership> {
    const duplicate = await this.getByGolferTourSeason(
      membership.golferId,
      membership.tourId,
      membership.seasonYear,
    );
    if (duplicate) {
      throw new GolfTourMembershipError(
        GolfTourMembershipErrorCodes.MEMBERSHIP_ALREADY_EXISTS,
        `Tour membership already exists for golfer ${membership.golferId}`,
      );
    }

    this.memberships.set(membership.id, membership);
    return membership;
  }

  async delete(id: string): Promise<boolean> {
    return this.memberships.delete(id);
  }

  async clear(): Promise<void> {
    this.memberships.clear();
  }
}
