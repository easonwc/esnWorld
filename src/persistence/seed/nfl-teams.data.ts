import type { LocationSeedEntry } from "./types";

/** Stadium cities not covered by the world location catalog. */
export const NFL_LOCATION_SEED_DATA = [
  { name: "Orchard Park", region: "New York", countryName: "United States", latitude: 42.767, longitude: -78.7437, timezone: "America/New_York", population: 29_000 },
  { name: "Miami Gardens", region: "Florida", countryName: "United States", latitude: 25.942, longitude: -80.2456, timezone: "America/New_York", population: 110_000 },
  { name: "Foxborough", region: "Massachusetts", countryName: "United States", latitude: 42.0653, longitude: -71.248, timezone: "America/New_York", population: 19_000 },
  { name: "East Rutherford", region: "New Jersey", countryName: "United States", latitude: 40.8339, longitude: -74.0971, timezone: "America/New_York", population: 10_000 },
  { name: "Arlington", region: "Texas", countryName: "United States", latitude: 32.7357, longitude: -97.1081, timezone: "America/Chicago", population: 400_000 },
  { name: "Landover", region: "Maryland", countryName: "United States", latitude: 38.934, longitude: -76.8966, timezone: "America/New_York", population: 24_000 },
  { name: "Glendale", region: "Arizona", countryName: "United States", latitude: 33.5387, longitude: -112.186, timezone: "America/Phoenix", population: 252_000 },
  { name: "Santa Clara", region: "California", countryName: "United States", latitude: 37.3541, longitude: -121.9552, timezone: "America/Los_Angeles", population: 127_000 },
  { name: "Inglewood", region: "California", countryName: "United States", latitude: 33.9617, longitude: -118.3531, timezone: "America/Los_Angeles", population: 107_000 },
] as const satisfies readonly LocationSeedEntry[];

export interface NflConferenceSeedEntry {
  abbreviation: string;
  name: string;
}

export interface NflDivisionSeedEntry {
  conferenceAbbreviation: string;
  abbreviation: string;
  name: string;
}

export interface NflTeamSeedEntry {
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

export const NFL_LEAGUE_SEED = {
  name: "National Football League",
  abbreviation: "NFL",
} as const;

export const NFL_CONFERENCE_SEED_DATA: readonly NflConferenceSeedEntry[] = [
  { abbreviation: "AFC", name: "American Football Conference" },
  { abbreviation: "NFC", name: "National Football Conference" },
] as const;

export const NFL_DIVISION_SEED_DATA: readonly NflDivisionSeedEntry[] = [
  { conferenceAbbreviation: "AFC", abbreviation: "AFC_EAST", name: "AFC East" },
  { conferenceAbbreviation: "AFC", abbreviation: "AFC_NORTH", name: "AFC North" },
  { conferenceAbbreviation: "AFC", abbreviation: "AFC_SOUTH", name: "AFC South" },
  { conferenceAbbreviation: "AFC", abbreviation: "AFC_WEST", name: "AFC West" },
  { conferenceAbbreviation: "NFC", abbreviation: "NFC_EAST", name: "NFC East" },
  { conferenceAbbreviation: "NFC", abbreviation: "NFC_NORTH", name: "NFC North" },
  { conferenceAbbreviation: "NFC", abbreviation: "NFC_SOUTH", name: "NFC South" },
  { conferenceAbbreviation: "NFC", abbreviation: "NFC_WEST", name: "NFC West" },
] as const;

export const NFL_TEAM_SEED_DATA: readonly NflTeamSeedEntry[] = [
  { name: "Buffalo Bills", abbreviation: "BUF", conferenceAbbreviation: "AFC", divisionAbbreviation: "AFC_EAST", locationName: "Orchard Park", locationRegion: "New York", countryName: "United States", stadiumName: "Highmark Stadium", latitude: 42.7738, longitude: -78.787, isIndoor: false },
  { name: "Miami Dolphins", abbreviation: "MIA", conferenceAbbreviation: "AFC", divisionAbbreviation: "AFC_EAST", locationName: "Miami Gardens", locationRegion: "Florida", countryName: "United States", stadiumName: "Hard Rock Stadium", latitude: 25.958, longitude: -80.2389, isIndoor: false },
  { name: "New England Patriots", abbreviation: "NE", conferenceAbbreviation: "AFC", divisionAbbreviation: "AFC_EAST", locationName: "Foxborough", locationRegion: "Massachusetts", countryName: "United States", stadiumName: "Gillette Stadium", latitude: 42.0909, longitude: -71.2643, isIndoor: false },
  { name: "New York Jets", abbreviation: "NYJ", conferenceAbbreviation: "AFC", divisionAbbreviation: "AFC_EAST", locationName: "East Rutherford", locationRegion: "New Jersey", countryName: "United States", stadiumName: "MetLife Stadium", latitude: 40.8135, longitude: -74.0745, isIndoor: false },
  { name: "Baltimore Ravens", abbreviation: "BAL", conferenceAbbreviation: "AFC", divisionAbbreviation: "AFC_NORTH", locationName: "Baltimore", locationRegion: "Maryland", countryName: "United States", stadiumName: "M&T Bank Stadium", latitude: 39.278, longitude: -76.6227, isIndoor: false },
  { name: "Cincinnati Bengals", abbreviation: "CIN", conferenceAbbreviation: "AFC", divisionAbbreviation: "AFC_NORTH", locationName: "Cincinnati", locationRegion: "Ohio", countryName: "United States", stadiumName: "Paycor Stadium", latitude: 39.0954, longitude: -84.516, isIndoor: false },
  { name: "Cleveland Browns", abbreviation: "CLE", conferenceAbbreviation: "AFC", divisionAbbreviation: "AFC_NORTH", locationName: "Cleveland", locationRegion: "Ohio", countryName: "United States", stadiumName: "Cleveland Browns Stadium", latitude: 41.5061, longitude: -81.6995, isIndoor: false },
  { name: "Pittsburgh Steelers", abbreviation: "PIT", conferenceAbbreviation: "AFC", divisionAbbreviation: "AFC_NORTH", locationName: "Pittsburgh", locationRegion: "Pennsylvania", countryName: "United States", stadiumName: "Acrisure Stadium", latitude: 40.4468, longitude: -80.0158, isIndoor: false },
  { name: "Houston Texans", abbreviation: "HOU", conferenceAbbreviation: "AFC", divisionAbbreviation: "AFC_SOUTH", locationName: "Houston", locationRegion: "Texas", countryName: "United States", stadiumName: "NRG Stadium", latitude: 29.6847, longitude: -95.4107, isIndoor: true },
  { name: "Indianapolis Colts", abbreviation: "IND", conferenceAbbreviation: "AFC", divisionAbbreviation: "AFC_SOUTH", locationName: "Indianapolis", locationRegion: "Indiana", countryName: "United States", stadiumName: "Lucas Oil Stadium", latitude: 39.7601, longitude: -86.1639, isIndoor: true },
  { name: "Jacksonville Jaguars", abbreviation: "JAX", conferenceAbbreviation: "AFC", divisionAbbreviation: "AFC_SOUTH", locationName: "Jacksonville", locationRegion: "Florida", countryName: "United States", stadiumName: "EverBank Stadium", latitude: 30.3239, longitude: -81.6373, isIndoor: false },
  { name: "Tennessee Titans", abbreviation: "TEN", conferenceAbbreviation: "AFC", divisionAbbreviation: "AFC_SOUTH", locationName: "Nashville", locationRegion: "Tennessee", countryName: "United States", stadiumName: "Nissan Stadium", latitude: 36.1665, longitude: -86.7713, isIndoor: false },
  { name: "Denver Broncos", abbreviation: "DEN", conferenceAbbreviation: "AFC", divisionAbbreviation: "AFC_WEST", locationName: "Denver", locationRegion: "Colorado", countryName: "United States", stadiumName: "Empower Field at Mile High", latitude: 39.7439, longitude: -105.0201, isIndoor: false },
  { name: "Kansas City Chiefs", abbreviation: "KC", conferenceAbbreviation: "AFC", divisionAbbreviation: "AFC_WEST", locationName: "Kansas City", locationRegion: "Missouri", countryName: "United States", stadiumName: "GEHA Field at Arrowhead Stadium", latitude: 39.0489, longitude: -94.4839, isIndoor: false },
  { name: "Las Vegas Raiders", abbreviation: "LV", conferenceAbbreviation: "AFC", divisionAbbreviation: "AFC_WEST", locationName: "Las Vegas", locationRegion: "Nevada", countryName: "United States", stadiumName: "Allegiant Stadium", latitude: 36.0909, longitude: -115.1833, isIndoor: true },
  { name: "Los Angeles Chargers", abbreviation: "LAC", conferenceAbbreviation: "AFC", divisionAbbreviation: "AFC_WEST", locationName: "Inglewood", locationRegion: "California", countryName: "United States", stadiumName: "SoFi Stadium", latitude: 33.9535, longitude: -118.3392, isIndoor: true },
  { name: "Dallas Cowboys", abbreviation: "DAL", conferenceAbbreviation: "NFC", divisionAbbreviation: "NFC_EAST", locationName: "Arlington", locationRegion: "Texas", countryName: "United States", stadiumName: "AT&T Stadium", latitude: 32.7473, longitude: -97.0945, isIndoor: true },
  { name: "New York Giants", abbreviation: "NYG", conferenceAbbreviation: "NFC", divisionAbbreviation: "NFC_EAST", locationName: "East Rutherford", locationRegion: "New Jersey", countryName: "United States", stadiumName: "MetLife Stadium", latitude: 40.8135, longitude: -74.0745, isIndoor: false },
  { name: "Philadelphia Eagles", abbreviation: "PHI", conferenceAbbreviation: "NFC", divisionAbbreviation: "NFC_EAST", locationName: "Philadelphia", locationRegion: "Pennsylvania", countryName: "United States", stadiumName: "Lincoln Financial Field", latitude: 39.9008, longitude: -75.1675, isIndoor: false },
  { name: "Washington Commanders", abbreviation: "WAS", conferenceAbbreviation: "NFC", divisionAbbreviation: "NFC_EAST", locationName: "Landover", locationRegion: "Maryland", countryName: "United States", stadiumName: "Northwest Stadium", latitude: 38.9076, longitude: -76.8645, isIndoor: false },
  { name: "Chicago Bears", abbreviation: "CHI", conferenceAbbreviation: "NFC", divisionAbbreviation: "NFC_NORTH", locationName: "Chicago", locationRegion: "Illinois", countryName: "United States", stadiumName: "Soldier Field", latitude: 41.8623, longitude: -87.6167, isIndoor: false },
  { name: "Detroit Lions", abbreviation: "DET", conferenceAbbreviation: "NFC", divisionAbbreviation: "NFC_NORTH", locationName: "Detroit", locationRegion: "Michigan", countryName: "United States", stadiumName: "Ford Field", latitude: 42.34, longitude: -83.0456, isIndoor: true },
  { name: "Green Bay Packers", abbreviation: "GB", conferenceAbbreviation: "NFC", divisionAbbreviation: "NFC_NORTH", locationName: "Green Bay", locationRegion: "Wisconsin", countryName: "United States", stadiumName: "Lambeau Field", latitude: 44.5013, longitude: -88.0622, isIndoor: false },
  { name: "Minnesota Vikings", abbreviation: "MIN", conferenceAbbreviation: "NFC", divisionAbbreviation: "NFC_NORTH", locationName: "Minneapolis", locationRegion: "Minnesota", countryName: "United States", stadiumName: "U.S. Bank Stadium", latitude: 44.9745, longitude: -93.2581, isIndoor: true },
  { name: "Atlanta Falcons", abbreviation: "ATL", conferenceAbbreviation: "NFC", divisionAbbreviation: "NFC_SOUTH", locationName: "Atlanta", locationRegion: "Georgia", countryName: "United States", stadiumName: "Mercedes-Benz Stadium", latitude: 33.7553, longitude: -84.4006, isIndoor: true },
  { name: "Carolina Panthers", abbreviation: "CAR", conferenceAbbreviation: "NFC", divisionAbbreviation: "NFC_SOUTH", locationName: "Charlotte", locationRegion: "North Carolina", countryName: "United States", stadiumName: "Bank of America Stadium", latitude: 35.2258, longitude: -80.8528, isIndoor: false },
  { name: "New Orleans Saints", abbreviation: "NO", conferenceAbbreviation: "NFC", divisionAbbreviation: "NFC_SOUTH", locationName: "New Orleans", locationRegion: "Louisiana", countryName: "United States", stadiumName: "Caesars Superdome", latitude: 29.9511, longitude: -90.0812, isIndoor: true },
  { name: "Tampa Bay Buccaneers", abbreviation: "TB", conferenceAbbreviation: "NFC", divisionAbbreviation: "NFC_SOUTH", locationName: "Tampa", locationRegion: "Florida", countryName: "United States", stadiumName: "Raymond James Stadium", latitude: 27.9759, longitude: -82.5033, isIndoor: false },
  { name: "Arizona Cardinals", abbreviation: "ARI", conferenceAbbreviation: "NFC", divisionAbbreviation: "NFC_WEST", locationName: "Glendale", locationRegion: "Arizona", countryName: "United States", stadiumName: "State Farm Stadium", latitude: 33.5276, longitude: -112.2626, isIndoor: true },
  { name: "Los Angeles Rams", abbreviation: "LAR", conferenceAbbreviation: "NFC", divisionAbbreviation: "NFC_WEST", locationName: "Inglewood", locationRegion: "California", countryName: "United States", stadiumName: "SoFi Stadium", latitude: 33.9535, longitude: -118.3392, isIndoor: true },
  { name: "San Francisco 49ers", abbreviation: "SF", conferenceAbbreviation: "NFC", divisionAbbreviation: "NFC_WEST", locationName: "Santa Clara", locationRegion: "California", countryName: "United States", stadiumName: "Levi's Stadium", latitude: 37.4032, longitude: -121.9698, isIndoor: false },
  { name: "Seattle Seahawks", abbreviation: "SEA", conferenceAbbreviation: "NFC", divisionAbbreviation: "NFC_WEST", locationName: "Seattle", locationRegion: "Washington", countryName: "United States", stadiumName: "Lumen Field", latitude: 47.5952, longitude: -122.3316, isIndoor: false },
] as const;
