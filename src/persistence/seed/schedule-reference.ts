import type { GolfTournamentScheduleReference } from "@/modules/golf/types";

export function scheduleReferencesEqual(
  left: GolfTournamentScheduleReference | null | undefined,
  right: GolfTournamentScheduleReference | null | undefined,
): boolean {
  if (!left && !right) {
    return true;
  }
  if (!left || !right) {
    return false;
  }
  return (
    left.tourAbbreviation.toUpperCase() === right.tourAbbreviation.toUpperCase() &&
    left.tournamentSlug === right.tournamentSlug
  );
}
