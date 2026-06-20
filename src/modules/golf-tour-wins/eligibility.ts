import type { GolfEntryCriteria, GolfTournament } from "@/modules/golf/types";

export function priorSeasonYearForExemptions(seasonYear: number): number {
  return seasonYear - 1;
}

export function entryCriteriaRequiresPriorWinners(
  entryCriteria: GolfEntryCriteria,
): boolean {
  return (
    entryCriteria.kind === "exemptions" &&
    entryCriteria.exemptionCodes.includes("prior_winner")
  );
}

export function tournamentRequiresPriorWinners(
  tournament: Pick<GolfTournament, "entryCriteria">,
): boolean {
  return entryCriteriaRequiresPriorWinners(tournament.entryCriteria);
}
