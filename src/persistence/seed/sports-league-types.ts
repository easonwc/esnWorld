import type { LocationSeedEntry } from "./types";

export interface SportsTeamSeedEntry {
  name: string;
  abbreviation: string;
  conferenceAbbreviation: string;
  divisionAbbreviation: string;
  locationName: string;
  locationRegion: string;
  countryName: string;
  stadiumName: string;
  latitude: number;
  longitude: number;
  isIndoor: boolean;
}

export interface SportsConferenceSeedEntry {
  abbreviation: string;
  name: string;
}

export interface SportsDivisionSeedEntry {
  conferenceAbbreviation: string;
  abbreviation: string;
  name: string;
}

export interface SportsLeagueSeedCatalog {
  league: { name: string; abbreviation: string };
  conferences: readonly SportsConferenceSeedEntry[];
  divisions: readonly SportsDivisionSeedEntry[];
  supplementalLocations: readonly LocationSeedEntry[];
  teams: readonly SportsTeamSeedEntry[];
  downloadLogo: (abbreviation: string) => Promise<string>;
  downloadLeagueLogo: (abbreviation: string) => Promise<string>;
}

export interface SportsLeagueSeedResult {
  enabled: boolean;
  leagueAdded: boolean;
  conferencesAdded: number;
  divisionsAdded: number;
  venuesAdded: number;
  teamsAdded: number;
  teamsSkipped: number;
  totalTeams: number;
}
