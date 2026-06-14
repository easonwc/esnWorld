import type { LocationSeedEntry } from "./types";

/** Stadium cities not covered by the world location catalog. */
export const MLS_LOCATION_SEED_DATA = [
  { name: "Foxborough", region: "Massachusetts", countryName: "United States", latitude: 42.0653, longitude: -71.248, timezone: "America/New_York", population: 19_000 },
  { name: "Harrison", region: "New Jersey", countryName: "United States", latitude: 40.7357, longitude: -74.1557, timezone: "America/New_York", population: 19_000 },
  { name: "Chester", region: "Pennsylvania", countryName: "United States", latitude: 39.8496, longitude: -75.3557, timezone: "America/New_York", population: 34_000 },
  { name: "Frisco", region: "Texas", countryName: "United States", latitude: 33.1507, longitude: -96.8236, timezone: "America/Chicago", population: 210_000 },
  { name: "Carson", region: "California", countryName: "United States", latitude: 33.8317, longitude: -118.2817, timezone: "America/Los_Angeles", population: 95_000 },
  { name: "Fort Lauderdale", region: "Florida", countryName: "United States", latitude: 26.1224, longitude: -80.1373, timezone: "America/New_York", population: 182_000 },
  { name: "Commerce City", region: "Colorado", countryName: "United States", latitude: 39.8083, longitude: -104.9339, timezone: "America/Denver", population: 62_000 },
  { name: "Sandy", region: "Utah", countryName: "United States", latitude: 40.5649, longitude: -111.8389, timezone: "America/Denver", population: 96_000 },
  { name: "Saint Paul", region: "Minnesota", countryName: "United States", latitude: 44.9537, longitude: -93.09, timezone: "America/Chicago", population: 311_000 },
  { name: "Austin", region: "Texas", countryName: "United States", latitude: 30.2672, longitude: -97.7431, timezone: "America/Chicago", population: 978_000 },
  { name: "Kansas City", region: "Kansas", countryName: "United States", latitude: 39.1142, longitude: -94.6275, timezone: "America/Chicago", population: 508_000 },
] as const satisfies readonly LocationSeedEntry[];

export const MLS_LEAGUE_SEED = {
  name: "Major League Soccer",
  abbreviation: "MLS",
} as const;

export const MLS_CONFERENCE_SEED_DATA = [
  { abbreviation: "EAST", name: "Eastern Conference" },
  { abbreviation: "WEST", name: "Western Conference" },
] as const;

/** MLS has no formal divisions; one division per conference holds all teams. */
export const MLS_DIVISION_SEED_DATA = [
  { conferenceAbbreviation: "EAST", abbreviation: "MLS_EAST", name: "Eastern Conference" },
  { conferenceAbbreviation: "WEST", abbreviation: "MLS_WEST", name: "Western Conference" },
] as const;

export const MLS_TEAM_SEED_DATA = [
  { name: "Atlanta United FC", abbreviation: "ATL", conferenceAbbreviation: "EAST", divisionAbbreviation: "MLS_EAST", locationName: "Atlanta", locationRegion: "", countryName: "United States", stadiumName: "Mercedes-Benz Stadium", latitude: 33.7553, longitude: -84.4006, isIndoor: false },
  { name: "Charlotte FC", abbreviation: "CLT", conferenceAbbreviation: "EAST", divisionAbbreviation: "MLS_EAST", locationName: "Charlotte", locationRegion: "", countryName: "United States", stadiumName: "Bank of America Stadium", latitude: 35.2258, longitude: -80.8528, isIndoor: false },
  { name: "Chicago Fire FC", abbreviation: "CHI", conferenceAbbreviation: "EAST", divisionAbbreviation: "MLS_EAST", locationName: "Chicago", locationRegion: "", countryName: "United States", stadiumName: "Soldier Field", latitude: 41.8623, longitude: -87.6167, isIndoor: false },
  { name: "FC Cincinnati", abbreviation: "CIN", conferenceAbbreviation: "EAST", divisionAbbreviation: "MLS_EAST", locationName: "Cincinnati", locationRegion: "", countryName: "United States", stadiumName: "TQL Stadium", latitude: 39.1113, longitude: -84.5224, isIndoor: false },
  { name: "Columbus Crew", abbreviation: "CLB", conferenceAbbreviation: "EAST", divisionAbbreviation: "MLS_EAST", locationName: "Columbus", locationRegion: "", countryName: "United States", stadiumName: "Lower.com Field", latitude: 39.9698, longitude: -83.0112, isIndoor: false },
  { name: "D.C. United", abbreviation: "DC", conferenceAbbreviation: "EAST", divisionAbbreviation: "MLS_EAST", locationName: "Washington, D.C.", locationRegion: "", countryName: "United States", stadiumName: "Audi Field", latitude: 38.8683, longitude: -77.0129, isIndoor: false },
  { name: "Inter Miami CF", abbreviation: "MIA", conferenceAbbreviation: "EAST", divisionAbbreviation: "MLS_EAST", locationName: "Fort Lauderdale", locationRegion: "Florida", countryName: "United States", stadiumName: "Chase Stadium", latitude: 26.1932, longitude: -80.1607, isIndoor: false },
  { name: "CF Montréal", abbreviation: "MTL", conferenceAbbreviation: "EAST", divisionAbbreviation: "MLS_EAST", locationName: "Montreal", locationRegion: "", countryName: "Canada", stadiumName: "Stade Saputo", latitude: 45.5629, longitude: -73.5532, isIndoor: false },
  { name: "Nashville SC", abbreviation: "NSH", conferenceAbbreviation: "EAST", divisionAbbreviation: "MLS_EAST", locationName: "Nashville", locationRegion: "", countryName: "United States", stadiumName: "GEODIS Park", latitude: 36.1302, longitude: -86.7659, isIndoor: false },
  { name: "New England Revolution", abbreviation: "NE", conferenceAbbreviation: "EAST", divisionAbbreviation: "MLS_EAST", locationName: "Foxborough", locationRegion: "Massachusetts", countryName: "United States", stadiumName: "Gillette Stadium", latitude: 42.0909, longitude: -71.2643, isIndoor: false },
  { name: "New York City FC", abbreviation: "NYC", conferenceAbbreviation: "EAST", divisionAbbreviation: "MLS_EAST", locationName: "New York", locationRegion: "", countryName: "United States", stadiumName: "Yankee Stadium", latitude: 40.8296, longitude: -73.9262, isIndoor: false },
  { name: "New York Red Bulls", abbreviation: "RBNY", conferenceAbbreviation: "EAST", divisionAbbreviation: "MLS_EAST", locationName: "Harrison", locationRegion: "New Jersey", countryName: "United States", stadiumName: "Sports Illustrated Stadium", latitude: 40.7368, longitude: -74.1503, isIndoor: false },
  { name: "Orlando City SC", abbreviation: "ORL", conferenceAbbreviation: "EAST", divisionAbbreviation: "MLS_EAST", locationName: "Orlando", locationRegion: "", countryName: "United States", stadiumName: "Exploria Stadium", latitude: 28.5389, longitude: -81.3832, isIndoor: false },
  { name: "Philadelphia Union", abbreviation: "PHI", conferenceAbbreviation: "EAST", divisionAbbreviation: "MLS_EAST", locationName: "Chester", locationRegion: "Pennsylvania", countryName: "United States", stadiumName: "Subaru Park", latitude: 39.8328, longitude: -75.3785, isIndoor: false },
  { name: "Toronto FC", abbreviation: "TOR", conferenceAbbreviation: "EAST", divisionAbbreviation: "MLS_EAST", locationName: "Toronto", locationRegion: "", countryName: "Canada", stadiumName: "BMO Field", latitude: 43.6332, longitude: -79.4186, isIndoor: false },
  { name: "Austin FC", abbreviation: "ATX", conferenceAbbreviation: "WEST", divisionAbbreviation: "MLS_WEST", locationName: "Austin", locationRegion: "Texas", countryName: "United States", stadiumName: "Q2 Stadium", latitude: 30.3878, longitude: -97.7194, isIndoor: false },
  { name: "Colorado Rapids", abbreviation: "COL", conferenceAbbreviation: "WEST", divisionAbbreviation: "MLS_WEST", locationName: "Commerce City", locationRegion: "Colorado", countryName: "United States", stadiumName: "Dick's Sporting Goods Park", latitude: 39.8057, longitude: -104.8918, isIndoor: false },
  { name: "FC Dallas", abbreviation: "DAL", conferenceAbbreviation: "WEST", divisionAbbreviation: "MLS_WEST", locationName: "Frisco", locationRegion: "Texas", countryName: "United States", stadiumName: "Toyota Stadium", latitude: 33.1544, longitude: -96.8353, isIndoor: false },
  { name: "Houston Dynamo FC", abbreviation: "HOU", conferenceAbbreviation: "WEST", divisionAbbreviation: "MLS_WEST", locationName: "Houston", locationRegion: "", countryName: "United States", stadiumName: "Shell Energy Stadium", latitude: 29.7522, longitude: -95.352, isIndoor: false },
  { name: "LA Galaxy", abbreviation: "LA", conferenceAbbreviation: "WEST", divisionAbbreviation: "MLS_WEST", locationName: "Carson", locationRegion: "California", countryName: "United States", stadiumName: "Dignity Health Sports Park", latitude: 33.8644, longitude: -118.2611, isIndoor: false },
  { name: "Los Angeles FC", abbreviation: "LAFC", conferenceAbbreviation: "WEST", divisionAbbreviation: "MLS_WEST", locationName: "Los Angeles", locationRegion: "", countryName: "United States", stadiumName: "BMO Stadium", latitude: 34.0128, longitude: -118.2846, isIndoor: false },
  { name: "Minnesota United FC", abbreviation: "MIN", conferenceAbbreviation: "WEST", divisionAbbreviation: "MLS_WEST", locationName: "Saint Paul", locationRegion: "Minnesota", countryName: "United States", stadiumName: "Allianz Field", latitude: 44.9529, longitude: -93.165, isIndoor: false },
  { name: "Portland Timbers", abbreviation: "POR", conferenceAbbreviation: "WEST", divisionAbbreviation: "MLS_WEST", locationName: "Portland", locationRegion: "", countryName: "United States", stadiumName: "Providence Park", latitude: 45.5215, longitude: -122.6919, isIndoor: false },
  { name: "Real Salt Lake", abbreviation: "RSL", conferenceAbbreviation: "WEST", divisionAbbreviation: "MLS_WEST", locationName: "Sandy", locationRegion: "Utah", countryName: "United States", stadiumName: "America First Field", latitude: 40.5283, longitude: -111.8841, isIndoor: false },
  { name: "San Diego FC", abbreviation: "SD", conferenceAbbreviation: "WEST", divisionAbbreviation: "MLS_WEST", locationName: "San Diego", locationRegion: "", countryName: "United States", stadiumName: "Snapdragon Stadium", latitude: 32.7841, longitude: -117.1225, isIndoor: false },
  { name: "San Jose Earthquakes", abbreviation: "SJ", conferenceAbbreviation: "WEST", divisionAbbreviation: "MLS_WEST", locationName: "San Jose", locationRegion: "", countryName: "United States", stadiumName: "PayPal Park", latitude: 37.3514, longitude: -121.925, isIndoor: false },
  { name: "Seattle Sounders FC", abbreviation: "SEA", conferenceAbbreviation: "WEST", divisionAbbreviation: "MLS_WEST", locationName: "Seattle", locationRegion: "", countryName: "United States", stadiumName: "Lumen Field", latitude: 47.5952, longitude: -122.3316, isIndoor: false },
  { name: "Sporting Kansas City", abbreviation: "SKC", conferenceAbbreviation: "WEST", divisionAbbreviation: "MLS_WEST", locationName: "Kansas City", locationRegion: "Kansas", countryName: "United States", stadiumName: "Children's Mercy Park", latitude: 39.1214, longitude: -94.823, isIndoor: false },
  { name: "St. Louis City SC", abbreviation: "STL", conferenceAbbreviation: "WEST", divisionAbbreviation: "MLS_WEST", locationName: "St. Louis", locationRegion: "", countryName: "United States", stadiumName: "CityPark", latitude: 38.6318, longitude: -90.2108, isIndoor: false },
  { name: "Vancouver Whitecaps FC", abbreviation: "VAN", conferenceAbbreviation: "WEST", divisionAbbreviation: "MLS_WEST", locationName: "Vancouver", locationRegion: "", countryName: "Canada", stadiumName: "BC Place", latitude: 49.2768, longitude: -123.112, isIndoor: false },
] as const;
