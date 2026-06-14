export const UNITED_STATES = "United States";

export function requireUsSeedRegion(
  countryName: string,
  region: string | null | undefined,
  label: string,
): string | null {
  if (countryName !== UNITED_STATES) {
    const trimmed = region?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : null;
  }

  const trimmed = region?.trim();
  if (!trimmed) {
    throw new Error(
      `${label} is missing region (US state required in seed data)`,
    );
  }

  return trimmed;
}
