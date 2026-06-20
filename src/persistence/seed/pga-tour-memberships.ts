import { getGolferStore } from "@/modules/golfers";
import {
  compareGolfersByOverallSkill,
  golferOverallSkillAverage,
  rankGolfersByOverallSkill,
} from "@/modules/golfers/skill";
import { getGolfTourMembershipStore } from "@/modules/golf-tour-memberships";
import { getWorldClockService } from "@/modules/world-clock";
import {
  getDefaultGolfTourRepository,
  type GolfTourRepository,
} from "@/persistence/repositories";
import { PGA_TOUR_SEED } from "./pga-tour.data";
import { loadPgaMembershipSeedConfig } from "./pga-membership-config";

export interface PgaTourMembershipSeedDependencies {
  tourRepository?: GolfTourRepository;
}

export interface PgaTourMembershipSeedResult {
  enabled: boolean;
  targetMemberCount: number;
  seasonYear: number;
  membershipsAdded: number;
  missingTour: boolean;
  missingMaleGolfers: boolean;
}

export async function mergePgaTourMembershipsSeed(
  config = loadPgaMembershipSeedConfig(),
  dependencies: PgaTourMembershipSeedDependencies = {},
): Promise<PgaTourMembershipSeedResult> {
  const seasonYear = new Date(
    getWorldClockService().getCurrentOutput().isoUtc,
  ).getUTCFullYear();

  if (!config.enabled) {
    return {
      enabled: false,
      targetMemberCount: config.memberCount,
      seasonYear,
      membershipsAdded: 0,
      missingTour: false,
      missingMaleGolfers: false,
    };
  }

  const tourRepository =
    dependencies.tourRepository ?? getDefaultGolfTourRepository();
  const tour = await tourRepository.getByAbbreviation(
    PGA_TOUR_SEED.abbreviation,
  );
  if (!tour) {
    return {
      enabled: true,
      targetMemberCount: config.memberCount,
      seasonYear,
      membershipsAdded: 0,
      missingTour: true,
      missingMaleGolfers: false,
    };
  }

  const membershipStore = getGolfTourMembershipStore();
  const existing = await membershipStore.listByTourSeason(tour.id, seasonYear);
  if (existing.length >= config.memberCount) {
    return {
      enabled: true,
      targetMemberCount: config.memberCount,
      seasonYear,
      membershipsAdded: 0,
      missingTour: false,
      missingMaleGolfers: false,
    };
  }

  const maleGolfers = (await getGolferStore().list()).filter(
    (golfer) => golfer.humanGender === "male",
  );
  if (maleGolfers.length === 0) {
    return {
      enabled: true,
      targetMemberCount: config.memberCount,
      seasonYear,
      membershipsAdded: 0,
      missingTour: false,
      missingMaleGolfers: true,
    };
  }

  const existingIds = new Set(existing.map((membership) => membership.golferId));
  const ranked = rankGolfersByOverallSkill(maleGolfers);
  const targetCount = Math.min(config.memberCount, ranked.length);

  let membershipsAdded = 0;
  for (const golfer of ranked) {
    if (existing.length + membershipsAdded >= targetCount) {
      break;
    }

    if (existingIds.has(golfer.id)) {
      continue;
    }

    await membershipStore.create({
      golferId: golfer.id,
      tourId: tour.id,
      seasonYear,
      status: "member",
      overallSkill: golferOverallSkillAverage(golfer),
    });
    membershipsAdded += 1;
  }

  return {
    enabled: true,
    targetMemberCount: config.memberCount,
    seasonYear,
    membershipsAdded,
    missingTour: false,
    missingMaleGolfers: false,
  };
}

const globalForPgaMembershipSeed = globalThis as typeof globalThis & {
  __pgaMembershipSeedApplied?: boolean;
};

export async function seedPgaTourMembershipsOnStartup(): Promise<PgaTourMembershipSeedResult | null> {
  if (process.env.VITEST === "true") {
    return null;
  }

  const config = loadPgaMembershipSeedConfig();
  if (!config.enabled) {
    return null;
  }

  if (globalForPgaMembershipSeed.__pgaMembershipSeedApplied) {
    return null;
  }

  globalForPgaMembershipSeed.__pgaMembershipSeedApplied = true;
  return mergePgaTourMembershipsSeed();
}
