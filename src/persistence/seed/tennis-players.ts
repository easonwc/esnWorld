import { getHumanStore } from "@/modules/humans";
import { getLocationStore } from "@/modules/locations";
import { getTennisPlayerStore } from "@/modules/tennis-players";
import { getWorldClockService } from "@/modules/world-clock";
import { loadTennisPlayersSeedConfig } from "./athletes-config";
import {
  buildProceduralHumanSeedInput,
  buildProceduralTennisPlayerSkills,
  countProfilesByGender,
} from "./athletes-generate";
import type { AthleteGender } from "./athletes.data";

export interface TennisPlayersSeedResult {
  enabled: boolean;
  targetMaleCount: number;
  targetFemaleCount: number;
  humansAdded: number;
  tennisPlayersAdded: number;
  missingLocations: boolean;
}

async function seedTennisPlayersForGender(input: {
  gender: AthleteGender;
  targetCount: number;
  baseSeed: number;
  asOfYear: number;
  locations: Awaited<ReturnType<ReturnType<typeof getLocationStore>["list"]>>;
  humanStore: ReturnType<typeof getHumanStore>;
  tennisPlayerStore: ReturnType<typeof getTennisPlayerStore>;
  existingCount: number;
}): Promise<{ humansAdded: number; tennisPlayersAdded: number }> {
  if (input.existingCount >= input.targetCount) {
    return { humansAdded: 0, tennisPlayersAdded: 0 };
  }

  let humansAdded = 0;
  let tennisPlayersAdded = 0;

  for (let index = input.existingCount; index < input.targetCount; index += 1) {
    const humanInput = buildProceduralHumanSeedInput({
      sport: "tennis",
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

    await input.tennisPlayerStore.create({
      humanId: human.id,
      ...buildProceduralTennisPlayerSkills(
        input.gender,
        input.baseSeed,
        index,
        human.birthDate,
      ),
    });
    tennisPlayersAdded += 1;
  }

  return { humansAdded, tennisPlayersAdded };
}

export async function mergeTennisPlayersSeed(
  config = loadTennisPlayersSeedConfig(),
): Promise<TennisPlayersSeedResult> {
  if (!config.enabled) {
    return {
      enabled: false,
      targetMaleCount: config.maleCount,
      targetFemaleCount: config.femaleCount,
      humansAdded: 0,
      tennisPlayersAdded: 0,
      missingLocations: false,
    };
  }

  const humanStore = getHumanStore();
  const tennisPlayerStore = getTennisPlayerStore();
  const locations = await getLocationStore().list();

  if (locations.length === 0) {
    return {
      enabled: true,
      targetMaleCount: config.maleCount,
      targetFemaleCount: config.femaleCount,
      humansAdded: 0,
      tennisPlayersAdded: 0,
      missingLocations: true,
    };
  }

  const asOfYear = new Date(
    getWorldClockService().getCurrentOutput().isoUtc,
  ).getUTCFullYear();
  const existingPlayers = await tennisPlayerStore.list();

  const male = await seedTennisPlayersForGender({
    gender: "male",
    targetCount: config.maleCount,
    baseSeed: config.baseSeed,
    asOfYear,
    locations,
    humanStore,
    tennisPlayerStore,
    existingCount: countProfilesByGender(existingPlayers, "male"),
  });
  const female = await seedTennisPlayersForGender({
    gender: "female",
    targetCount: config.femaleCount,
    baseSeed: config.baseSeed,
    asOfYear,
    locations,
    humanStore,
    tennisPlayerStore,
    existingCount: countProfilesByGender(existingPlayers, "female"),
  });

  return {
    enabled: true,
    targetMaleCount: config.maleCount,
    targetFemaleCount: config.femaleCount,
    humansAdded: male.humansAdded + female.humansAdded,
    tennisPlayersAdded: male.tennisPlayersAdded + female.tennisPlayersAdded,
    missingLocations: false,
  };
}

const globalForTennisPlayersSeed = globalThis as typeof globalThis & {
  __tennisPlayersSeedApplied?: boolean;
};

export async function seedTennisPlayersOnStartup(): Promise<TennisPlayersSeedResult | null> {
  if (process.env.VITEST === "true") {
    return null;
  }

  const config = loadTennisPlayersSeedConfig();
  if (!config.enabled) {
    return null;
  }

  if (globalForTennisPlayersSeed.__tennisPlayersSeedApplied) {
    return null;
  }

  globalForTennisPlayersSeed.__tennisPlayersSeedApplied = true;
  return mergeTennisPlayersSeed();
}
