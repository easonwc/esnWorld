import type { Golfer, GolferSkills } from "./types";

function collectAbilityRatings(skills: GolferSkills): number[] {
  return [
    skills.putting.putting,
    skills.putting.shortPutting,
    skills.putting.lagPutting,
    skills.approach.approach,
    skills.approach.accuracy,
    skills.approach.distanceControl,
    skills.approach.dispersion,
    skills.shortGame.shortGame,
    skills.shortGame.chipping,
    skills.shortGame.bunkerPlay,
    skills.shortGame.pitching,
    skills.teeShot.driving,
    skills.teeShot.distance,
    skills.teeShot.accuracy,
    skills.teeShot.dispersion,
    skills.clubs.driver,
    skills.clubs.wood,
    skills.clubs.longIron,
    skills.clubs.midIron,
    skills.clubs.shortIron,
    skills.clubs.wedge,
  ];
}

/** Mean of all leaf ability ratings on the 0–100 scale (higher is better). */
export function golferOverallSkillAverage(skills: GolferSkills): number {
  const ratings = collectAbilityRatings(skills);
  const sum = ratings.reduce((total, value) => total + value, 0);
  return Math.round((sum / ratings.length) * 1000) / 1000;
}

export function compareGolfersByOverallSkill(a: Golfer, b: Golfer): number {
  const skillDiff = golferOverallSkillAverage(b) - golferOverallSkillAverage(a);
  if (skillDiff !== 0) {
    return skillDiff;
  }

  const nameDiff = a.humanDisplayName.localeCompare(b.humanDisplayName);
  if (nameDiff !== 0) {
    return nameDiff;
  }

  return a.id.localeCompare(b.id);
}

export function rankGolfersByOverallSkill(golfers: readonly Golfer[]): Golfer[] {
  return [...golfers].sort(compareGolfersByOverallSkill);
}
