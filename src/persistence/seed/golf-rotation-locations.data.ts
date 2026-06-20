import type { LocationSeedEntry } from "./types";

/** Host cities for rotation-only golf venues (merged with tour catalog seeds). */
export const GOLF_ROTATION_LOCATION_SEED_DATA: readonly LocationSeedEntry[] = [
  { name: "Tulsa", region: "Oklahoma", countryName: "United States", latitude: 36.154, longitude: -95.9928, timezone: "America/Chicago", population: 413_000 },
  { name: "Bethesda", region: "Maryland", countryName: "United States", latitude: 38.9847, longitude: -77.0947, timezone: "America/New_York", population: 68_000 },
  { name: "San Francisco", region: "California", countryName: "United States", latitude: 37.7749, longitude: -122.4194, timezone: "America/Los_Angeles", population: 873_000 },
  { name: "Mamaroneck", region: "New York", countryName: "United States", latitude: 40.9487, longitude: -73.7326, timezone: "America/New_York", population: 29_000 },
  { name: "Erin", region: "Wisconsin", countryName: "United States", latitude: 43.2464, longitude: -88.3443, timezone: "America/Chicago", population: 3_800 },
  { name: "University Place", region: "Washington", countryName: "United States", latitude: 47.2359, longitude: -122.5376, timezone: "America/Los_Angeles", population: 34_000 },
  { name: "Lytham St Annes", region: "England", countryName: "United Kingdom", latitude: 53.747, longitude: -3.028, timezone: "Europe/London", population: 42_000 },
  { name: "Turnberry", region: "Scotland", countryName: "United Kingdom", latitude: 55.319, longitude: -4.839, timezone: "Europe/London", population: 200 },
  { name: "Leven", region: "Scotland", countryName: "United Kingdom", latitude: 56.195, longitude: -2.993, timezone: "Europe/London", population: 8_800 },
  { name: "Aberdeen", region: "Scotland", countryName: "United Kingdom", latitude: 57.1497, longitude: -2.0943, timezone: "Europe/London", population: 198_000 },
  { name: "Sydney", countryName: "Australia", latitude: -33.8688, longitude: 151.2093, timezone: "Australia/Sydney", population: 5_312_000 },
  { name: "Melbourne", countryName: "Australia", latitude: -37.8136, longitude: 144.9631, timezone: "Australia/Melbourne", population: 5_078_000 },
] as const;
