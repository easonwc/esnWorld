/** Shared schedule-reference shape for co-sanctioned / joint events across tours. */
export interface TourScheduleReference {
  tourAbbreviation: string;
  tournamentSlug: string;
}

export function scheduleReferencesEqual(
  left: TourScheduleReference | null | undefined,
  right: TourScheduleReference | null | undefined,
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
