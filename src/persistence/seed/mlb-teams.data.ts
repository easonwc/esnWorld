import type { LocationSeedEntry } from "./types";

/** Stadium cities not covered by the world location catalog. */
export const MLB_LOCATION_SEED_DATA = [
  { name: "St. Petersburg", region: "Florida", countryName: "United States", latitude: 27.7676, longitude: -82.6403, timezone: "America/New_York", population: 265_000 },
  { name: "Cumberland", region: "Georgia", countryName: "United States", latitude: 33.9513, longitude: -84.4755, timezone: "America/New_York", population: 200_000 },
  { name: "Arlington", region: "Texas", countryName: "United States", latitude: 32.7357, longitude: -97.1081, timezone: "America/Chicago", population: 400_000 },
] as const satisfies readonly LocationSeedEntry[];

export const MLB_LEAGUE_SEED = {
  name: "Major League Baseball",
  abbreviation: "MLB",
} as const;

export const MLB_CONFERENCE_SEED_DATA = [
  { abbreviation: "AL", name: "American League" },
  { abbreviation: "NL", name: "National League" },
] as const;

export const MLB_DIVISION_SEED_DATA = [
  { conferenceAbbreviation: "AL", abbreviation: "AL_EAST", name: "American League East" },
  { conferenceAbbreviation: "AL", abbreviation: "AL_CENTRAL", name: "American League Central" },
  { conferenceAbbreviation: "AL", abbreviation: "AL_WEST", name: "American League West" },
  { conferenceAbbreviation: "NL", abbreviation: "NL_EAST", name: "National League East" },
  { conferenceAbbreviation: "NL", abbreviation: "NL_CENTRAL", name: "National League Central" },
  { conferenceAbbreviation: "NL", abbreviation: "NL_WEST", name: "National League West" },
] as const;

export const MLB_TEAM_SEED_DATA = [
  { name: "Baltimore Orioles", abbreviation: "BAL", conferenceAbbreviation: "AL", divisionAbbreviation: "AL_EAST", locationName: "Baltimore", locationRegion: "Maryland", countryName: "United States", stadiumName: "Oriole Park at Camden Yards", latitude: 39.2839, longitude: -76.6217, isIndoor: false },
  { name: "Boston Red Sox", abbreviation: "BOS", conferenceAbbreviation: "AL", divisionAbbreviation: "AL_EAST", locationName: "Boston", locationRegion: "Massachusetts", countryName: "United States", stadiumName: "Fenway Park", latitude: 42.3467, longitude: -71.0972, isIndoor: false },
  { name: "New York Yankees", abbreviation: "NYY", conferenceAbbreviation: "AL", divisionAbbreviation: "AL_EAST", locationName: "New York", locationRegion: "New York", countryName: "United States", stadiumName: "Yankee Stadium", latitude: 40.8296, longitude: -73.9262, isIndoor: false },
  { name: "Tampa Bay Rays", abbreviation: "TB", conferenceAbbreviation: "AL", divisionAbbreviation: "AL_EAST", locationName: "St. Petersburg", locationRegion: "Florida", countryName: "United States", stadiumName: "Tropicana Field", latitude: 27.7682, longitude: -82.6534, isIndoor: true },
  { name: "Toronto Blue Jays", abbreviation: "TOR", conferenceAbbreviation: "AL", divisionAbbreviation: "AL_EAST", locationName: "Toronto", locationRegion: "Ontario", countryName: "Canada", stadiumName: "Rogers Centre", latitude: 43.6414, longitude: -79.3894, isIndoor: true },
  { name: "Chicago White Sox", abbreviation: "CWS", conferenceAbbreviation: "AL", divisionAbbreviation: "AL_CENTRAL", locationName: "Chicago", locationRegion: "Illinois", countryName: "United States", stadiumName: "Guaranteed Rate Field", latitude: 41.83, longitude: -87.6339, isIndoor: false },
  { name: "Cleveland Guardians", abbreviation: "CLE", conferenceAbbreviation: "AL", divisionAbbreviation: "AL_CENTRAL", locationName: "Cleveland", locationRegion: "Ohio", countryName: "United States", stadiumName: "Progressive Field", latitude: 41.4962, longitude: -81.6852, isIndoor: false },
  { name: "Detroit Tigers", abbreviation: "DET", conferenceAbbreviation: "AL", divisionAbbreviation: "AL_CENTRAL", locationName: "Detroit", locationRegion: "Michigan", countryName: "United States", stadiumName: "Comerica Park", latitude: 42.339, longitude: -83.0485, isIndoor: false },
  { name: "Kansas City Royals", abbreviation: "KC", conferenceAbbreviation: "AL", divisionAbbreviation: "AL_CENTRAL", locationName: "Kansas City", locationRegion: "Missouri", countryName: "United States", stadiumName: "Kauffman Stadium", latitude: 39.0517, longitude: -94.4803, isIndoor: false },
  { name: "Minnesota Twins", abbreviation: "MIN", conferenceAbbreviation: "AL", divisionAbbreviation: "AL_CENTRAL", locationName: "Minneapolis", locationRegion: "Minnesota", countryName: "United States", stadiumName: "Target Field", latitude: 44.9817, longitude: -93.2775, isIndoor: false },
  { name: "Houston Astros", abbreviation: "HOU", conferenceAbbreviation: "AL", divisionAbbreviation: "AL_WEST", locationName: "Houston", locationRegion: "Texas", countryName: "United States", stadiumName: "Minute Maid Park", latitude: 29.7573, longitude: -95.3555, isIndoor: true },
  { name: "Los Angeles Angels", abbreviation: "LAA", conferenceAbbreviation: "AL", divisionAbbreviation: "AL_WEST", locationName: "Anaheim", locationRegion: "California", countryName: "United States", stadiumName: "Angel Stadium", latitude: 33.8003, longitude: -117.8827, isIndoor: false },
  { name: "Oakland Athletics", abbreviation: "OAK", conferenceAbbreviation: "AL", divisionAbbreviation: "AL_WEST", locationName: "Sacramento", locationRegion: "California", countryName: "United States", stadiumName: "Sutter Health Park", latitude: 38.5805, longitude: -121.5136, isIndoor: false },
  { name: "Seattle Mariners", abbreviation: "SEA", conferenceAbbreviation: "AL", divisionAbbreviation: "AL_WEST", locationName: "Seattle", locationRegion: "Washington", countryName: "United States", stadiumName: "T-Mobile Park", latitude: 47.5914, longitude: -122.3325, isIndoor: false },
  { name: "Texas Rangers", abbreviation: "TEX", conferenceAbbreviation: "AL", divisionAbbreviation: "AL_WEST", locationName: "Arlington", locationRegion: "Texas", countryName: "United States", stadiumName: "Globe Life Field", latitude: 32.7473, longitude: -97.0827, isIndoor: true },
  { name: "Atlanta Braves", abbreviation: "ATL", conferenceAbbreviation: "NL", divisionAbbreviation: "NL_EAST", locationName: "Cumberland", locationRegion: "Georgia", countryName: "United States", stadiumName: "Truist Park", latitude: 33.8907, longitude: -84.4677, isIndoor: false },
  { name: "Miami Marlins", abbreviation: "MIA", conferenceAbbreviation: "NL", divisionAbbreviation: "NL_EAST", locationName: "Miami", locationRegion: "Florida", countryName: "United States", stadiumName: "loanDepot park", latitude: 25.7781, longitude: -80.2197, isIndoor: true },
  { name: "New York Mets", abbreviation: "NYM", conferenceAbbreviation: "NL", divisionAbbreviation: "NL_EAST", locationName: "New York", locationRegion: "New York", countryName: "United States", stadiumName: "Citi Field", latitude: 40.7571, longitude: -73.8458, isIndoor: false },
  { name: "Philadelphia Phillies", abbreviation: "PHI", conferenceAbbreviation: "NL", divisionAbbreviation: "NL_EAST", locationName: "Philadelphia", locationRegion: "Pennsylvania", countryName: "United States", stadiumName: "Citizens Bank Park", latitude: 39.9061, longitude: -75.1665, isIndoor: false },
  { name: "Washington Nationals", abbreviation: "WSH", conferenceAbbreviation: "NL", divisionAbbreviation: "NL_EAST", locationName: "Washington, D.C.", locationRegion: "District of Columbia", countryName: "United States", stadiumName: "Nationals Park", latitude: 38.873, longitude: -77.0074, isIndoor: false },
  { name: "Chicago Cubs", abbreviation: "CHC", conferenceAbbreviation: "NL", divisionAbbreviation: "NL_CENTRAL", locationName: "Chicago", locationRegion: "Illinois", countryName: "United States", stadiumName: "Wrigley Field", latitude: 41.9484, longitude: -87.6553, isIndoor: false },
  { name: "Cincinnati Reds", abbreviation: "CIN", conferenceAbbreviation: "NL", divisionAbbreviation: "NL_CENTRAL", locationName: "Cincinnati", locationRegion: "Ohio", countryName: "United States", stadiumName: "Great American Ball Park", latitude: 39.0974, longitude: -84.5068, isIndoor: false },
  { name: "Milwaukee Brewers", abbreviation: "MIL", conferenceAbbreviation: "NL", divisionAbbreviation: "NL_CENTRAL", locationName: "Milwaukee", locationRegion: "Wisconsin", countryName: "United States", stadiumName: "American Family Field", latitude: 43.028, longitude: -87.9712, isIndoor: true },
  { name: "Pittsburgh Pirates", abbreviation: "PIT", conferenceAbbreviation: "NL", divisionAbbreviation: "NL_CENTRAL", locationName: "Pittsburgh", locationRegion: "Pennsylvania", countryName: "United States", stadiumName: "PNC Park", latitude: 40.4469, longitude: -80.0057, isIndoor: false },
  { name: "St. Louis Cardinals", abbreviation: "STL", conferenceAbbreviation: "NL", divisionAbbreviation: "NL_CENTRAL", locationName: "St. Louis", locationRegion: "Missouri", countryName: "United States", stadiumName: "Busch Stadium", latitude: 38.6226, longitude: -90.1928, isIndoor: false },
  { name: "Arizona Diamondbacks", abbreviation: "ARI", conferenceAbbreviation: "NL", divisionAbbreviation: "NL_WEST", locationName: "Phoenix", locationRegion: "Arizona", countryName: "United States", stadiumName: "Chase Field", latitude: 33.4453, longitude: -112.0667, isIndoor: true },
  { name: "Colorado Rockies", abbreviation: "COL", conferenceAbbreviation: "NL", divisionAbbreviation: "NL_WEST", locationName: "Denver", locationRegion: "Colorado", countryName: "United States", stadiumName: "Coors Field", latitude: 39.7559, longitude: -104.9942, isIndoor: false },
  { name: "Los Angeles Dodgers", abbreviation: "LAD", conferenceAbbreviation: "NL", divisionAbbreviation: "NL_WEST", locationName: "Los Angeles", locationRegion: "California", countryName: "United States", stadiumName: "Dodger Stadium", latitude: 34.0739, longitude: -118.24, isIndoor: false },
  { name: "San Diego Padres", abbreviation: "SD", conferenceAbbreviation: "NL", divisionAbbreviation: "NL_WEST", locationName: "San Diego", locationRegion: "California", countryName: "United States", stadiumName: "Petco Park", latitude: 32.7073, longitude: -117.1566, isIndoor: false },
  { name: "San Francisco Giants", abbreviation: "SF", conferenceAbbreviation: "NL", divisionAbbreviation: "NL_WEST", locationName: "San Francisco", locationRegion: "California", countryName: "United States", stadiumName: "Oracle Park", latitude: 37.7786, longitude: -122.3893, isIndoor: false },
] as const;
