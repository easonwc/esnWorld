import type { LocationSeedEntry } from "./types";

/** Arena cities not covered by the world location catalog. */
export const NHL_LOCATION_SEED_DATA = [
  { name: "Newark", region: "New Jersey", countryName: "United States", latitude: 40.7357, longitude: -74.1724, timezone: "America/New_York", population: 311_000 },
  { name: "Elmont", region: "New York", countryName: "United States", latitude: 40.7009, longitude: -73.7129, timezone: "America/New_York", population: 38_000 },
  { name: "Sunrise", region: "Florida", countryName: "United States", latitude: 26.1669, longitude: -80.2566, timezone: "America/New_York", population: 97_000 },
  { name: "Saint Paul", region: "Minnesota", countryName: "United States", latitude: 44.9537, longitude: -93.09, timezone: "America/Chicago", population: 311_000 },
] as const satisfies readonly LocationSeedEntry[];

export const NHL_LEAGUE_SEED = {
  name: "National Hockey League",
  abbreviation: "NHL",
} as const;

export const NHL_CONFERENCE_SEED_DATA = [
  { abbreviation: "EAST", name: "Eastern Conference" },
  { abbreviation: "WEST", name: "Western Conference" },
] as const;

export const NHL_DIVISION_SEED_DATA = [
  { conferenceAbbreviation: "EAST", abbreviation: "EAST_ATL", name: "Atlantic Division" },
  { conferenceAbbreviation: "EAST", abbreviation: "EAST_MET", name: "Metropolitan Division" },
  { conferenceAbbreviation: "WEST", abbreviation: "WEST_CEN", name: "Central Division" },
  { conferenceAbbreviation: "WEST", abbreviation: "WEST_PAC", name: "Pacific Division" },
] as const;

export const NHL_TEAM_SEED_DATA = [
  { name: "Boston Bruins", abbreviation: "BOS", conferenceAbbreviation: "EAST", divisionAbbreviation: "EAST_ATL", locationName: "Boston", locationRegion: "Massachusetts", countryName: "United States", stadiumName: "TD Garden", latitude: 42.3662, longitude: -71.0621, isIndoor: true },
  { name: "Buffalo Sabres", abbreviation: "BUF", conferenceAbbreviation: "EAST", divisionAbbreviation: "EAST_ATL", locationName: "Buffalo", locationRegion: "New York", countryName: "United States", stadiumName: "KeyBank Center", latitude: 42.875, longitude: -78.8764, isIndoor: true },
  { name: "Detroit Red Wings", abbreviation: "DET", conferenceAbbreviation: "EAST", divisionAbbreviation: "EAST_ATL", locationName: "Detroit", locationRegion: "Michigan", countryName: "United States", stadiumName: "Little Caesars Arena", latitude: 42.341, longitude: -83.055, isIndoor: true },
  { name: "Florida Panthers", abbreviation: "FLA", conferenceAbbreviation: "EAST", divisionAbbreviation: "EAST_ATL", locationName: "Sunrise", locationRegion: "Florida", countryName: "United States", stadiumName: "Amerant Bank Arena", latitude: 26.1584, longitude: -80.3256, isIndoor: true },
  { name: "Montreal Canadiens", abbreviation: "MTL", conferenceAbbreviation: "EAST", divisionAbbreviation: "EAST_ATL", locationName: "Montreal", locationRegion: "Quebec", countryName: "Canada", stadiumName: "Bell Centre", latitude: 45.4961, longitude: -73.5693, isIndoor: true },
  { name: "Ottawa Senators", abbreviation: "OTT", conferenceAbbreviation: "EAST", divisionAbbreviation: "EAST_ATL", locationName: "Ottawa", locationRegion: "Ontario", countryName: "Canada", stadiumName: "Canadian Tire Centre", latitude: 45.2969, longitude: -75.9272, isIndoor: true },
  { name: "Tampa Bay Lightning", abbreviation: "TBL", conferenceAbbreviation: "EAST", divisionAbbreviation: "EAST_ATL", locationName: "Tampa", locationRegion: "Florida", countryName: "United States", stadiumName: "Amalie Arena", latitude: 27.9427, longitude: -82.4519, isIndoor: true },
  { name: "Toronto Maple Leafs", abbreviation: "TOR", conferenceAbbreviation: "EAST", divisionAbbreviation: "EAST_ATL", locationName: "Toronto", locationRegion: "Ontario", countryName: "Canada", stadiumName: "Scotiabank Arena", latitude: 43.6435, longitude: -79.3791, isIndoor: true },
  { name: "Carolina Hurricanes", abbreviation: "CAR", conferenceAbbreviation: "EAST", divisionAbbreviation: "EAST_MET", locationName: "Raleigh", locationRegion: "North Carolina", countryName: "United States", stadiumName: "Lenovo Center", latitude: 35.8033, longitude: -78.7219, isIndoor: true },
  { name: "Columbus Blue Jackets", abbreviation: "CBJ", conferenceAbbreviation: "EAST", divisionAbbreviation: "EAST_MET", locationName: "Columbus", locationRegion: "Ohio", countryName: "United States", stadiumName: "Nationwide Arena", latitude: 39.9692, longitude: -83.0061, isIndoor: true },
  { name: "New Jersey Devils", abbreviation: "NJD", conferenceAbbreviation: "EAST", divisionAbbreviation: "EAST_MET", locationName: "Newark", locationRegion: "New Jersey", countryName: "United States", stadiumName: "Prudential Center", latitude: 40.7336, longitude: -74.1711, isIndoor: true },
  { name: "New York Islanders", abbreviation: "NYI", conferenceAbbreviation: "EAST", divisionAbbreviation: "EAST_MET", locationName: "Elmont", locationRegion: "New York", countryName: "United States", stadiumName: "UBS Arena", latitude: 40.7115, longitude: -73.726, isIndoor: true },
  { name: "New York Rangers", abbreviation: "NYR", conferenceAbbreviation: "EAST", divisionAbbreviation: "EAST_MET", locationName: "New York", locationRegion: "New York", countryName: "United States", stadiumName: "Madison Square Garden", latitude: 40.7505, longitude: -73.9934, isIndoor: true },
  { name: "Philadelphia Flyers", abbreviation: "PHI", conferenceAbbreviation: "EAST", divisionAbbreviation: "EAST_MET", locationName: "Philadelphia", locationRegion: "Pennsylvania", countryName: "United States", stadiumName: "Wells Fargo Center", latitude: 39.9012, longitude: -75.172, isIndoor: true },
  { name: "Pittsburgh Penguins", abbreviation: "PIT", conferenceAbbreviation: "EAST", divisionAbbreviation: "EAST_MET", locationName: "Pittsburgh", locationRegion: "Pennsylvania", countryName: "United States", stadiumName: "PPG Paints Arena", latitude: 40.4396, longitude: -79.9892, isIndoor: true },
  { name: "Washington Capitals", abbreviation: "WSH", conferenceAbbreviation: "EAST", divisionAbbreviation: "EAST_MET", locationName: "Washington, D.C.", locationRegion: "", countryName: "United States", stadiumName: "Capital One Arena", latitude: 38.8981, longitude: -77.0209, isIndoor: true },
  { name: "Chicago Blackhawks", abbreviation: "CHI", conferenceAbbreviation: "WEST", divisionAbbreviation: "WEST_CEN", locationName: "Chicago", locationRegion: "Illinois", countryName: "United States", stadiumName: "United Center", latitude: 41.8807, longitude: -87.6742, isIndoor: true },
  { name: "Colorado Avalanche", abbreviation: "COL", conferenceAbbreviation: "WEST", divisionAbbreviation: "WEST_CEN", locationName: "Denver", locationRegion: "Colorado", countryName: "United States", stadiumName: "Ball Arena", latitude: 39.7487, longitude: -105.0077, isIndoor: true },
  { name: "Dallas Stars", abbreviation: "DAL", conferenceAbbreviation: "WEST", divisionAbbreviation: "WEST_CEN", locationName: "Dallas", locationRegion: "Texas", countryName: "United States", stadiumName: "American Airlines Center", latitude: 32.7905, longitude: -96.8103, isIndoor: true },
  { name: "Minnesota Wild", abbreviation: "MIN", conferenceAbbreviation: "WEST", divisionAbbreviation: "WEST_CEN", locationName: "Saint Paul", locationRegion: "Minnesota", countryName: "United States", stadiumName: "Grand Casino Arena", latitude: 44.9448, longitude: -93.1011, isIndoor: true },
  { name: "Nashville Predators", abbreviation: "NSH", conferenceAbbreviation: "WEST", divisionAbbreviation: "WEST_CEN", locationName: "Nashville", locationRegion: "Tennessee", countryName: "United States", stadiumName: "Bridgestone Arena", latitude: 36.1592, longitude: -86.7785, isIndoor: true },
  { name: "St. Louis Blues", abbreviation: "STL", conferenceAbbreviation: "WEST", divisionAbbreviation: "WEST_CEN", locationName: "St. Louis", locationRegion: "Missouri", countryName: "United States", stadiumName: "Enterprise Center", latitude: 38.6268, longitude: -90.2027, isIndoor: true },
  { name: "Utah Hockey Club", abbreviation: "UTA", conferenceAbbreviation: "WEST", divisionAbbreviation: "WEST_CEN", locationName: "Salt Lake City", locationRegion: "Utah", countryName: "United States", stadiumName: "Delta Center", latitude: 40.7683, longitude: -111.9011, isIndoor: true },
  { name: "Winnipeg Jets", abbreviation: "WPG", conferenceAbbreviation: "WEST", divisionAbbreviation: "WEST_CEN", locationName: "Winnipeg", locationRegion: "Manitoba", countryName: "Canada", stadiumName: "Canada Life Centre", latitude: 49.8928, longitude: -97.1435, isIndoor: true },
  { name: "Anaheim Ducks", abbreviation: "ANA", conferenceAbbreviation: "WEST", divisionAbbreviation: "WEST_PAC", locationName: "Anaheim", locationRegion: "California", countryName: "United States", stadiumName: "Honda Center", latitude: 33.8078, longitude: -117.8765, isIndoor: true },
  { name: "Calgary Flames", abbreviation: "CGY", conferenceAbbreviation: "WEST", divisionAbbreviation: "WEST_PAC", locationName: "Calgary", locationRegion: "Alberta", countryName: "Canada", stadiumName: "Scotiabank Saddledome", latitude: 51.0374, longitude: -114.0519, isIndoor: true },
  { name: "Edmonton Oilers", abbreviation: "EDM", conferenceAbbreviation: "WEST", divisionAbbreviation: "WEST_PAC", locationName: "Edmonton", locationRegion: "Alberta", countryName: "Canada", stadiumName: "Rogers Place", latitude: 53.5469, longitude: -113.4979, isIndoor: true },
  { name: "Los Angeles Kings", abbreviation: "LAK", conferenceAbbreviation: "WEST", divisionAbbreviation: "WEST_PAC", locationName: "Los Angeles", locationRegion: "California", countryName: "United States", stadiumName: "Crypto.com Arena", latitude: 34.043, longitude: -118.2673, isIndoor: true },
  { name: "San Jose Sharks", abbreviation: "SJS", conferenceAbbreviation: "WEST", divisionAbbreviation: "WEST_PAC", locationName: "San Jose", locationRegion: "California", countryName: "United States", stadiumName: "SAP Center", latitude: 37.3327, longitude: -121.901, isIndoor: true },
  { name: "Seattle Kraken", abbreviation: "SEA", conferenceAbbreviation: "WEST", divisionAbbreviation: "WEST_PAC", locationName: "Seattle", locationRegion: "Washington", countryName: "United States", stadiumName: "Climate Pledge Arena", latitude: 47.6221, longitude: -122.354, isIndoor: true },
  { name: "Vancouver Canucks", abbreviation: "VAN", conferenceAbbreviation: "WEST", divisionAbbreviation: "WEST_PAC", locationName: "Vancouver", locationRegion: "British Columbia", countryName: "Canada", stadiumName: "Rogers Arena", latitude: 49.2778, longitude: -123.1089, isIndoor: true },
  { name: "Vegas Golden Knights", abbreviation: "VGK", conferenceAbbreviation: "WEST", divisionAbbreviation: "WEST_PAC", locationName: "Las Vegas", locationRegion: "Nevada", countryName: "United States", stadiumName: "T-Mobile Arena", latitude: 36.1029, longitude: -115.1784, isIndoor: true },
] as const;
