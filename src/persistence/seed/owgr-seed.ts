import { getGolferStore } from "@/modules/golfers";
import {
  golferOverallSkillAverage,
  rankGolfersByOverallSkill,
} from "@/modules/golfers/skill";
import {
  bootstrapRankingPointsFromSkill,
  getGolfWorldRankingStore,
  worldRankingAsOfDateFromIsoUtc,
} from "@/modules/golf-world-rankings";
import { getWorldClockService } from "@/modules/world-clock";
import { loadOwgrSeedConfig } from "./owgr-config";

export interface OwgrSeedResult {
  enabled: boolean;
  asOfDate: string;
  maleGolferCount: number;
  rankingsAdded: number;
  missingMaleGolfers: boolean;
}

export async function mergeOwgrSeed(
  config = loadOwgrSeedConfig(),
): Promise<OwgrSeedResult> {
  const asOfDate = worldRankingAsOfDateFromIsoUtc(
    getWorldClockService().getCurrentOutput().isoUtc,
  );

  if (!config.enabled) {
    return {
      enabled: false,
      asOfDate,
      maleGolferCount: 0,
      rankingsAdded: 0,
      missingMaleGolfers: false,
    };
  }

  const maleGolfers = (await getGolferStore().list()).filter(
    (golfer) => golfer.humanGender === "male",
  );

  if (maleGolfers.length === 0) {
    return {
      enabled: true,
      asOfDate,
      maleGolferCount: 0,
      rankingsAdded: 0,
      missingMaleGolfers: true,
    };
  }

  const rankingStore = getGolfWorldRankingStore();
  const existingCount = await rankingStore.countBySystemDate("owgr", asOfDate);

  if (existingCount === maleGolfers.length) {
    return {
      enabled: true,
      asOfDate,
      maleGolferCount: maleGolfers.length,
      rankingsAdded: 0,
      missingMaleGolfers: false,
    };
  }

  const ranked = rankGolfersByOverallSkill(maleGolfers);
  const entries = ranked.map((golfer, index) => {
    const overallSkill = golferOverallSkillAverage(golfer);
    return {
      golferId: golfer.id,
      rankingSystem: "owgr" as const,
      asOfDate,
      rank: index + 1,
      rankingPoints: bootstrapRankingPointsFromSkill(overallSkill),
      overallSkill,
    };
  });

  await rankingStore.replaceSnapshot({
    rankingSystem: "owgr",
    asOfDate,
    entries,
  });

  return {
    enabled: true,
    asOfDate,
    maleGolferCount: maleGolfers.length,
    rankingsAdded: entries.length,
    missingMaleGolfers: false,
  };
}

const globalForOwgrSeed = globalThis as typeof globalThis & {
  __owgrSeedApplied?: boolean;
};

export async function seedOwgrOnStartup(): Promise<OwgrSeedResult | null> {
  if (process.env.VITEST === "true") {
    return null;
  }

  const config = loadOwgrSeedConfig();
  if (!config.enabled) {
    return null;
  }

  if (globalForOwgrSeed.__owgrSeedApplied) {
    return null;
  }

  globalForOwgrSeed.__owgrSeedApplied = true;
  return mergeOwgrSeed(config);
}
