import { sampleTourPro } from "golf-sim-library/fixtures";
import { describe, expect, it } from "vitest";
import {
  compareGolfersByOverallSkill,
  golferOverallSkillAverage,
  rankGolfersByOverallSkill,
} from "./skill";
import type { Golfer } from "./types";

const baseGolfer = (overrides: Partial<Golfer>): Golfer => ({
  id: "golfer-a",
  humanId: "human-a",
  humanDisplayName: "Alpha Player",
  humanGender: "male",
  playsLeftHanded: false,
  turnedProYear: 2018,
  putting: sampleTourPro.putting,
  approach: sampleTourPro.approach,
  shortGame: sampleTourPro.shortGame,
  teeShot: sampleTourPro.teeShot!,
  clubs: sampleTourPro.clubs,
  ...overrides,
});

describe("golferOverallSkillAverage", () => {
  it("averages all 21 leaf ability ratings", () => {
    const average = golferOverallSkillAverage({
      putting: { putting: 80, shortPutting: 70, lagPutting: 60 },
      approach: { approach: 50, accuracy: 40, distanceControl: 30, dispersion: 20 },
      shortGame: { shortGame: 10, chipping: 20, bunkerPlay: 30, pitching: 40 },
      teeShot: { driving: 50, distance: 60, accuracy: 70, dispersion: 80 },
      clubs: {
        driver: 90,
        wood: 80,
        longIron: 70,
        midIron: 60,
        shortIron: 50,
        wedge: 40,
      },
    });

    expect(average).toBe(52.381);
  });
});

describe("compareGolfersByOverallSkill", () => {
  it("ranks higher skill first and breaks ties by display name", () => {
    const stronger = baseGolfer({
      id: "strong",
      humanDisplayName: "Zach Strong",
      putting: { ...sampleTourPro.putting, putting: 95 },
    });
    const weaker = baseGolfer({
      id: "weak",
      humanDisplayName: "Adam Weak",
      putting: { ...sampleTourPro.putting, putting: 55 },
    });

    expect(compareGolfersByOverallSkill(stronger, weaker)).toBeLessThan(0);
    expect(rankGolfersByOverallSkill([weaker, stronger]).map((g) => g.id)).toEqual([
      "strong",
      "weak",
    ]);
  });
});
