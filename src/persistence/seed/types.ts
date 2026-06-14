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

export interface CollegeSeedEntry {
  name: string;
  locationName: string;
  locationRegion?: string | null;
  countryName: string;
  attendance: number;
}

export interface CollegeSeedResult {
  enabled: boolean;
  added: number;
  skipped: number;
  total: number;
}

export interface WorldSeedResult {
  countries: CountrySeedResult | null;
  locations: LocationSeedResult | null;
  colleges: CollegeSeedResult | null;
}

export type { SportsLeagueSeedResult } from "./sports-league-types";
