import type { LocationSeedEntry } from "./types";

/** Arena cities not covered by the world location catalog. */
export const NBA_LOCATION_SEED_DATA = [
  { name: "Brooklyn", region: "New York", countryName: "United States", latitude: 40.6782, longitude: -73.9442, timezone: "America/New_York", population: 2_736_000 },
  { name: "Inglewood", region: "California", countryName: "United States", latitude: 33.9617, longitude: -118.3531, timezone: "America/Los_Angeles", population: 107_000 },
] as const satisfies readonly LocationSeedEntry[];

export const NBA_LEAGUE_SEED = {
  name: "National Basketball Association",
  abbreviation: "NBA",
} as const;

export const NBA_CONFERENCE_SEED_DATA = [
  { abbreviation: "EAST", name: "Eastern Conference" },
  { abbreviation: "WEST", name: "Western Conference" },
] as const;

export const NBA_DIVISION_SEED_DATA = [
  { conferenceAbbreviation: "EAST", abbreviation: "EAST_ATL", name: "Atlantic Division" },
  { conferenceAbbreviation: "EAST", abbreviation: "EAST_CEN", name: "Central Division" },
  { conferenceAbbreviation: "EAST", abbreviation: "EAST_SE", name: "Southeast Division" },
  { conferenceAbbreviation: "WEST", abbreviation: "WEST_NW", name: "Northwest Division" },
  { conferenceAbbreviation: "WEST", abbreviation: "WEST_PAC", name: "Pacific Division" },
  { conferenceAbbreviation: "WEST", abbreviation: "WEST_SW", name: "Southwest Division" },
] as const;

export const NBA_TEAM_SEED_DATA = [
  { name: "Boston Celtics", abbreviation: "BOS", conferenceAbbreviation: "EAST", divisionAbbreviation: "EAST_ATL", locationName: "Boston", locationRegion: "Massachusetts", countryName: "United States", stadiumName: "TD Garden", latitude: 42.3662, longitude: -71.0621, isIndoor: true },
  { name: "Brooklyn Nets", abbreviation: "BKN", conferenceAbbreviation: "EAST", divisionAbbreviation: "EAST_ATL", locationName: "Brooklyn", locationRegion: "New York", countryName: "United States", stadiumName: "Barclays Center", latitude: 40.6826, longitude: -73.9754, isIndoor: true },
  { name: "New York Knicks", abbreviation: "NYK", conferenceAbbreviation: "EAST", divisionAbbreviation: "EAST_ATL", locationName: "New York", locationRegion: "New York", countryName: "United States", stadiumName: "Madison Square Garden", latitude: 40.7505, longitude: -73.9934, isIndoor: true },
  { name: "Philadelphia 76ers", abbreviation: "PHI", conferenceAbbreviation: "EAST", divisionAbbreviation: "EAST_ATL", locationName: "Philadelphia", locationRegion: "Pennsylvania", countryName: "United States", stadiumName: "Wells Fargo Center", latitude: 39.9012, longitude: -75.172, isIndoor: true },
  { name: "Toronto Raptors", abbreviation: "TOR", conferenceAbbreviation: "EAST", divisionAbbreviation: "EAST_ATL", locationName: "Toronto", locationRegion: "Ontario", countryName: "Canada", stadiumName: "Scotiabank Arena", latitude: 43.6435, longitude: -79.3791, isIndoor: true },
  { name: "Chicago Bulls", abbreviation: "CHI", conferenceAbbreviation: "EAST", divisionAbbreviation: "EAST_CEN", locationName: "Chicago", locationRegion: "Illinois", countryName: "United States", stadiumName: "United Center", latitude: 41.8807, longitude: -87.6742, isIndoor: true },
  { name: "Cleveland Cavaliers", abbreviation: "CLE", conferenceAbbreviation: "EAST", divisionAbbreviation: "EAST_CEN", locationName: "Cleveland", locationRegion: "Ohio", countryName: "United States", stadiumName: "Rocket Mortgage FieldHouse", latitude: 41.4965, longitude: -81.6882, isIndoor: true },
  { name: "Detroit Pistons", abbreviation: "DET", conferenceAbbreviation: "EAST", divisionAbbreviation: "EAST_CEN", locationName: "Detroit", locationRegion: "Michigan", countryName: "United States", stadiumName: "Little Caesars Arena", latitude: 42.341, longitude: -83.055, isIndoor: true },
  { name: "Indiana Pacers", abbreviation: "IND", conferenceAbbreviation: "EAST", divisionAbbreviation: "EAST_CEN", locationName: "Indianapolis", locationRegion: "Indiana", countryName: "United States", stadiumName: "Gainbridge Fieldhouse", latitude: 39.764, longitude: -86.1555, isIndoor: true },
  { name: "Milwaukee Bucks", abbreviation: "MIL", conferenceAbbreviation: "EAST", divisionAbbreviation: "EAST_CEN", locationName: "Milwaukee", locationRegion: "Wisconsin", countryName: "United States", stadiumName: "Fiserv Forum", latitude: 43.0451, longitude: -87.9172, isIndoor: true },
  { name: "Atlanta Hawks", abbreviation: "ATL", conferenceAbbreviation: "EAST", divisionAbbreviation: "EAST_SE", locationName: "Atlanta", locationRegion: "Georgia", countryName: "United States", stadiumName: "State Farm Arena", latitude: 33.7573, longitude: -84.3963, isIndoor: true },
  { name: "Charlotte Hornets", abbreviation: "CHA", conferenceAbbreviation: "EAST", divisionAbbreviation: "EAST_SE", locationName: "Charlotte", locationRegion: "North Carolina", countryName: "United States", stadiumName: "Spectrum Center", latitude: 35.2251, longitude: -80.8392, isIndoor: true },
  { name: "Miami Heat", abbreviation: "MIA", conferenceAbbreviation: "EAST", divisionAbbreviation: "EAST_SE", locationName: "Miami", locationRegion: "Florida", countryName: "United States", stadiumName: "Kaseya Center", latitude: 25.7814, longitude: -80.187, isIndoor: true },
  { name: "Orlando Magic", abbreviation: "ORL", conferenceAbbreviation: "EAST", divisionAbbreviation: "EAST_SE", locationName: "Orlando", locationRegion: "Florida", countryName: "United States", stadiumName: "Kia Center", latitude: 28.5392, longitude: -81.3839, isIndoor: true },
  { name: "Washington Wizards", abbreviation: "WAS", conferenceAbbreviation: "EAST", divisionAbbreviation: "EAST_SE", locationName: "Washington, D.C.", locationRegion: "", countryName: "United States", stadiumName: "Capital One Arena", latitude: 38.8981, longitude: -77.0209, isIndoor: true },
  { name: "Denver Nuggets", abbreviation: "DEN", conferenceAbbreviation: "WEST", divisionAbbreviation: "WEST_NW", locationName: "Denver", locationRegion: "Colorado", countryName: "United States", stadiumName: "Ball Arena", latitude: 39.7487, longitude: -105.0077, isIndoor: true },
  { name: "Minnesota Timberwolves", abbreviation: "MIN", conferenceAbbreviation: "WEST", divisionAbbreviation: "WEST_NW", locationName: "Minneapolis", locationRegion: "Minnesota", countryName: "United States", stadiumName: "Target Center", latitude: 44.9795, longitude: -93.2761, isIndoor: true },
  { name: "Oklahoma City Thunder", abbreviation: "OKC", conferenceAbbreviation: "WEST", divisionAbbreviation: "WEST_NW", locationName: "Oklahoma City", locationRegion: "Oklahoma", countryName: "United States", stadiumName: "Paycom Center", latitude: 35.4634, longitude: -97.5151, isIndoor: true },
  { name: "Portland Trail Blazers", abbreviation: "POR", conferenceAbbreviation: "WEST", divisionAbbreviation: "WEST_NW", locationName: "Portland", locationRegion: "Oregon", countryName: "United States", stadiumName: "Moda Center", latitude: 45.5316, longitude: -122.6668, isIndoor: true },
  { name: "Utah Jazz", abbreviation: "UTA", conferenceAbbreviation: "WEST", divisionAbbreviation: "WEST_NW", locationName: "Salt Lake City", locationRegion: "Utah", countryName: "United States", stadiumName: "Delta Center", latitude: 40.7683, longitude: -111.9011, isIndoor: true },
  { name: "Golden State Warriors", abbreviation: "GSW", conferenceAbbreviation: "WEST", divisionAbbreviation: "WEST_PAC", locationName: "San Francisco", locationRegion: "California", countryName: "United States", stadiumName: "Chase Center", latitude: 37.768, longitude: -122.3877, isIndoor: true },
  { name: "Los Angeles Clippers", abbreviation: "LAC", conferenceAbbreviation: "WEST", divisionAbbreviation: "WEST_PAC", locationName: "Inglewood", locationRegion: "California", countryName: "United States", stadiumName: "Intuit Dome", latitude: 33.9587, longitude: -118.3418, isIndoor: true },
  { name: "Los Angeles Lakers", abbreviation: "LAL", conferenceAbbreviation: "WEST", divisionAbbreviation: "WEST_PAC", locationName: "Los Angeles", locationRegion: "California", countryName: "United States", stadiumName: "Crypto.com Arena", latitude: 34.043, longitude: -118.2673, isIndoor: true },
  { name: "Phoenix Suns", abbreviation: "PHX", conferenceAbbreviation: "WEST", divisionAbbreviation: "WEST_PAC", locationName: "Phoenix", locationRegion: "Arizona", countryName: "United States", stadiumName: "Footprint Center", latitude: 33.4457, longitude: -112.0712, isIndoor: true },
  { name: "Sacramento Kings", abbreviation: "SAC", conferenceAbbreviation: "WEST", divisionAbbreviation: "WEST_PAC", locationName: "Sacramento", locationRegion: "California", countryName: "United States", stadiumName: "Golden 1 Center", latitude: 38.5802, longitude: -121.4997, isIndoor: true },
  { name: "Dallas Mavericks", abbreviation: "DAL", conferenceAbbreviation: "WEST", divisionAbbreviation: "WEST_SW", locationName: "Dallas", locationRegion: "Texas", countryName: "United States", stadiumName: "American Airlines Center", latitude: 32.7905, longitude: -96.8103, isIndoor: true },
  { name: "Houston Rockets", abbreviation: "HOU", conferenceAbbreviation: "WEST", divisionAbbreviation: "WEST_SW", locationName: "Houston", locationRegion: "Texas", countryName: "United States", stadiumName: "Toyota Center", latitude: 29.7508, longitude: -95.3621, isIndoor: true },
  { name: "Memphis Grizzlies", abbreviation: "MEM", conferenceAbbreviation: "WEST", divisionAbbreviation: "WEST_SW", locationName: "Memphis", locationRegion: "Tennessee", countryName: "United States", stadiumName: "FedExForum", latitude: 35.1382, longitude: -90.0506, isIndoor: true },
  { name: "New Orleans Pelicans", abbreviation: "NOP", conferenceAbbreviation: "WEST", divisionAbbreviation: "WEST_SW", locationName: "New Orleans", locationRegion: "Louisiana", countryName: "United States", stadiumName: "Smoothie King Center", latitude: 29.949, longitude: -90.0821, isIndoor: true },
  { name: "San Antonio Spurs", abbreviation: "SAS", conferenceAbbreviation: "WEST", divisionAbbreviation: "WEST_SW", locationName: "San Antonio", locationRegion: "Texas", countryName: "United States", stadiumName: "Frost Bank Center", latitude: 29.427, longitude: -98.4375, isIndoor: true },
] as const;
