import type { LocationSeedEntry } from "./types";

/** Arena cities not covered by the world location catalog. */
export const WNBA_LOCATION_SEED_DATA = [
  { name: "Brooklyn", region: "New York", countryName: "United States", latitude: 40.6782, longitude: -73.9442, timezone: "America/New_York", population: 2_736_000 },
  { name: "College Park", region: "Georgia", countryName: "United States", latitude: 33.6534, longitude: -84.4494, timezone: "America/New_York", population: 35_000 },
  { name: "Uncasville", region: "Connecticut", countryName: "United States", latitude: 41.4334, longitude: -72.1098, timezone: "America/New_York", population: 1_500 },
  { name: "Arlington", region: "Texas", countryName: "United States", latitude: 32.7357, longitude: -97.1081, timezone: "America/Chicago", population: 394_000 },
] as const satisfies readonly LocationSeedEntry[];

export const WNBA_LEAGUE_SEED = {
  name: "Women's National Basketball Association",
  abbreviation: "WNBA",
} as const;

export const WNBA_CONFERENCE_SEED_DATA = [
  { abbreviation: "EAST", name: "Eastern Conference" },
  { abbreviation: "WEST", name: "Western Conference" },
] as const;

/** WNBA has no formal divisions; one division per conference holds all teams. */
export const WNBA_DIVISION_SEED_DATA = [
  { conferenceAbbreviation: "EAST", abbreviation: "WNBA_EAST", name: "Eastern Conference" },
  { conferenceAbbreviation: "WEST", abbreviation: "WNBA_WEST", name: "Western Conference" },
] as const;

export const WNBA_TEAM_SEED_DATA = [
  { name: "Atlanta Dream", abbreviation: "ATL", conferenceAbbreviation: "EAST", divisionAbbreviation: "WNBA_EAST", locationName: "College Park", locationRegion: "Georgia", countryName: "United States", stadiumName: "Gateway Center Arena", latitude: 33.6463, longitude: -84.459, isIndoor: true },
  { name: "Chicago Sky", abbreviation: "CHI", conferenceAbbreviation: "EAST", divisionAbbreviation: "WNBA_EAST", locationName: "Chicago", locationRegion: "Illinois", countryName: "United States", stadiumName: "Wintrust Arena", latitude: 41.8506, longitude: -87.6168, isIndoor: true },
  { name: "Connecticut Sun", abbreviation: "CON", conferenceAbbreviation: "EAST", divisionAbbreviation: "WNBA_EAST", locationName: "Uncasville", locationRegion: "Connecticut", countryName: "United States", stadiumName: "Mohegan Sun Arena", latitude: 41.491, longitude: -72.0888, isIndoor: true },
  { name: "Indiana Fever", abbreviation: "IND", conferenceAbbreviation: "EAST", divisionAbbreviation: "WNBA_EAST", locationName: "Indianapolis", locationRegion: "Indiana", countryName: "United States", stadiumName: "Gainbridge Fieldhouse", latitude: 39.764, longitude: -86.1555, isIndoor: true },
  { name: "New York Liberty", abbreviation: "NY", conferenceAbbreviation: "EAST", divisionAbbreviation: "WNBA_EAST", locationName: "Brooklyn", locationRegion: "New York", countryName: "United States", stadiumName: "Barclays Center", latitude: 40.6826, longitude: -73.9754, isIndoor: true },
  { name: "Washington Mystics", abbreviation: "WAS", conferenceAbbreviation: "EAST", divisionAbbreviation: "WNBA_EAST", locationName: "Washington, D.C.", locationRegion: "District of Columbia", countryName: "United States", stadiumName: "Entertainment and Sports Arena", latitude: 38.8683, longitude: -76.9939, isIndoor: true },
  { name: "Dallas Wings", abbreviation: "DAL", conferenceAbbreviation: "WEST", divisionAbbreviation: "WNBA_WEST", locationName: "Arlington", locationRegion: "Texas", countryName: "United States", stadiumName: "College Park Center", latitude: 32.7308, longitude: -97.1075, isIndoor: true },
  { name: "Golden State Valkyries", abbreviation: "GSV", conferenceAbbreviation: "WEST", divisionAbbreviation: "WNBA_WEST", locationName: "San Francisco", locationRegion: "California", countryName: "United States", stadiumName: "Chase Center", latitude: 37.768, longitude: -122.3877, isIndoor: true },
  { name: "Las Vegas Aces", abbreviation: "LV", conferenceAbbreviation: "WEST", divisionAbbreviation: "WNBA_WEST", locationName: "Las Vegas", locationRegion: "Nevada", countryName: "United States", stadiumName: "Michelob ULTRA Arena", latitude: 36.0908, longitude: -115.1761, isIndoor: true },
  { name: "Los Angeles Sparks", abbreviation: "LA", conferenceAbbreviation: "WEST", divisionAbbreviation: "WNBA_WEST", locationName: "Los Angeles", locationRegion: "California", countryName: "United States", stadiumName: "Crypto.com Arena", latitude: 34.043, longitude: -118.2673, isIndoor: true },
  { name: "Minnesota Lynx", abbreviation: "MIN", conferenceAbbreviation: "WEST", divisionAbbreviation: "WNBA_WEST", locationName: "Minneapolis", locationRegion: "Minnesota", countryName: "United States", stadiumName: "Target Center", latitude: 44.9795, longitude: -93.2761, isIndoor: true },
  { name: "Phoenix Mercury", abbreviation: "PHX", conferenceAbbreviation: "WEST", divisionAbbreviation: "WNBA_WEST", locationName: "Phoenix", locationRegion: "Arizona", countryName: "United States", stadiumName: "Footprint Center", latitude: 33.4457, longitude: -112.0712, isIndoor: true },
  { name: "Seattle Storm", abbreviation: "SEA", conferenceAbbreviation: "WEST", divisionAbbreviation: "WNBA_WEST", locationName: "Seattle", locationRegion: "Washington", countryName: "United States", stadiumName: "Climate Pledge Arena", latitude: 47.6221, longitude: -122.354, isIndoor: true },
] as const;
