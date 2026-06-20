import { getGolferStore } from "@/modules/golfers";
import { getHumanStore } from "@/modules/humans";
import { getLocationStore } from "@/modules/locations";
import { getWorldClockService } from "@/modules/world-clock";
import { loadGolfersSeedConfig } from "./athletes-config";
import {
  buildProceduralGolferSkills,
  buildProceduralHumanSeedInput,
  countProfilesByGender,
} from "./athletes-generate";
import type { AthleteGender } from "./athletes.data";

export interface GolfersSeedResult {
  enabled: boolean;
  targetMaleCount: number;
  targetFemaleCount: number;
  humansAdded: number;
  golfersAdded: number;
  missingLocations: boolean;
}

async function seedGolfersForGender(input: {
  gender: AthleteGender;
  targetCount: number;
  baseSeed: number;
  asOfYear: number;
  locations: Awaited<ReturnType<ReturnType<typeof getLocationStore>["list"]>>;
  humanStore: ReturnType<typeof getHumanStore>;
  golferStore: ReturnType<typeof getGolferStore>;
  existingCount: number;
}): Promise<{ humansAdded: number; golfersAdded: number }> {
  if (input.existingCount >= input.targetCount) {
    return { humansAdded: 0, golfersAdded: 0 };
  }

  let humansAdded = 0;
  let golfersAdded = 0;

  for (let index = input.existingCount; index < input.targetCount; index += 1) {
    const humanInput = buildProceduralHumanSeedInput({
      sport: "golfer",
      gender: input.gender,
      index,
      baseSeed: input.baseSeed,
      asOfYear: input.asOfYear,
      locations: input.locations,
    });

    if (!humanInput) {
      break;
    }

    const human = await input.humanStore.create(humanInput);
    humansAdded += 1;

    await input.golferStore.create({
      humanId: human.id,
      ...buildProceduralGolferSkills(
        input.gender,
        input.baseSeed,
        index,
        human.birthDate,
      ),
    });
    golfersAdded += 1;
  }

  return { humansAdded, golfersAdded };
}

export async function mergeGolfersSeed(
  config = loadGolfersSeedConfig(),
): Promise<GolfersSeedResult> {
  if (!config.enabled) {
    return {
      enabled: false,
      targetMaleCount: config.maleCount,
      targetFemaleCount: config.femaleCount,
      humansAdded: 0,
      golfersAdded: 0,
      missingLocations: false,
    };
  }

  const humanStore = getHumanStore();
  const golferStore = getGolferStore();
  const locations = await getLocationStore().list();

  if (locations.length === 0) {
    return {
      enabled: true,
      targetMaleCount: config.maleCount,
      targetFemaleCount: config.femaleCount,
      humansAdded: 0,
      golfersAdded: 0,
      missingLocations: true,
    };
  }

  const asOfYear = new Date(
    getWorldClockService().getCurrentOutput().isoUtc,
  ).getUTCFullYear();
  const golferRepository = getGolferStore();
  const existingGolfers = await golferRepository.list();

  const male = await seedGolfersForGender({
    gender: "male",
    targetCount: config.maleCount,
    baseSeed: config.baseSeed,
    asOfYear,
    locations,
    humanStore,
    golferStore,
    existingCount: countProfilesByGender(existingGolfers, "male"),
  });
  const female = await seedGolfersForGender({
    gender: "female",
    targetCount: config.femaleCount,
    baseSeed: config.baseSeed,
    asOfYear,
    locations,
    humanStore,
    golferStore,
    existingCount: countProfilesByGender(existingGolfers, "female"),
  });

  return {
    enabled: true,
    targetMaleCount: config.maleCount,
    targetFemaleCount: config.femaleCount,
    humansAdded: male.humansAdded + female.humansAdded,
    golfersAdded: male.golfersAdded + female.golfersAdded,
    missingLocations: false,
  };
}

const globalForGolfersSeed = globalThis as typeof globalThis & {
  __golfersSeedApplied?: boolean;
};

export async function seedGolfersOnStartup(): Promise<GolfersSeedResult | null> {
  if (process.env.VITEST === "true") {
    return null;
  }

  const config = loadGolfersSeedConfig();
  if (!config.enabled) {
    return null;
  }

  if (globalForGolfersSeed.__golfersSeedApplied) {
    return null;
  }

  globalForGolfersSeed.__golfersSeedApplied = true;
  return mergeGolfersSeed();
}
