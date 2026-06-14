export interface CountrySeedEntry {
  name: string;
  isoCode: string;
  languages: string[];
}

export interface CountrySeedResult {
  enabled: boolean;
  added: number;
  skipped: number;
  total: number;
}

export interface LocationSeedEntry {
  name: string;
  countryName: string;
  /** State, province, or administrative region (optional) */
  region?: string | null;
  latitude: number;
  longitude: number;
  timezone: string;
  population: number;
}

export interface LocationSeedResult {
  enabled: boolean;
  added: number;
  skipped: number;
  total: number;
}

export interface WorldSeedResult {
  countries: CountrySeedResult | null;
  locations: LocationSeedResult | null;
}
