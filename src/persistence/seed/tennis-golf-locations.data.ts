import type { LocationSeedEntry } from "./types";

/**
 * Host cities for major professional tennis and golf events worldwide.
 * Includes Grand Slams, ATP/WTA Masters 1000 and 500 staples, golf majors,
 * flagship PGA/DP World Tour stops, and recurring Ryder Cup / Open Championship venues.
 */
export const TENNIS_GOLF_LOCATION_SEED_DATA: readonly LocationSeedEntry[] = [
  // Tennis — Masters 1000, 500, and premier tour stops
  { name: "Indian Wells", region: "California", countryName: "United States", latitude: 33.7206, longitude: -116.3408, timezone: "America/Los_Angeles", population: 5_000 },
  { name: "Monte Carlo", countryName: "Monaco", latitude: 43.7401, longitude: 7.4266, timezone: "Europe/Monaco", population: 15_000 },
  { name: "Rotterdam", countryName: "Netherlands", latitude: 51.9225, longitude: 4.4792, timezone: "Europe/Amsterdam", population: 651_000 },
  { name: "Acapulco", countryName: "Mexico", latitude: 16.8531, longitude: -99.8237, timezone: "America/Mexico_City", population: 779_000 },
  { name: "Hamburg", countryName: "Germany", latitude: 53.5511, longitude: 9.9937, timezone: "Europe/Berlin", population: 1_900_000 },
  { name: "Basel", countryName: "Switzerland", latitude: 47.5596, longitude: 7.5886, timezone: "Europe/Zurich", population: 177_000 },
  { name: "Eastbourne", region: "England", countryName: "United Kingdom", latitude: 50.768, longitude: 0.2905, timezone: "Europe/London", population: 101_000 },
  { name: "Halle", countryName: "Germany", latitude: 52.0611, longitude: 8.3604, timezone: "Europe/Berlin", population: 237_000 },
  { name: "Stuttgart", countryName: "Germany", latitude: 48.7758, longitude: 9.1829, timezone: "Europe/Berlin", population: 635_000 },
  { name: "Geneva", countryName: "Switzerland", latitude: 46.2044, longitude: 6.1432, timezone: "Europe/Zurich", population: 203_000 },
  { name: "Bad Homburg", countryName: "Germany", latitude: 50.2269, longitude: 8.6182, timezone: "Europe/Berlin", population: 54_000 },
  { name: "Adelaide", countryName: "Australia", latitude: -34.9285, longitude: 138.6007, timezone: "Australia/Adelaide", population: 1_387_000 },
  { name: "Delray Beach", region: "Florida", countryName: "United States", latitude: 26.4615, longitude: -80.0728, timezone: "America/New_York", population: 66_000 },
  { name: "Los Cabos", countryName: "Mexico", latitude: 22.8905, longitude: -109.9167, timezone: "America/Mazatlan", population: 202_000 },
  { name: "Wuhan", countryName: "China", latitude: 30.5928, longitude: 114.3055, timezone: "Asia/Shanghai", population: 11_081_000 },
  { name: "Zhuhai", countryName: "China", latitude: 22.271, longitude: 113.5767, timezone: "Asia/Shanghai", population: 2_436_000 },
  { name: "Estoril", countryName: "Portugal", latitude: 38.7056, longitude: -9.3977, timezone: "Europe/Lisbon", population: 26_000 },
  { name: "Bastad", countryName: "Sweden", latitude: 56.4297, longitude: 12.8498, timezone: "Europe/Stockholm", population: 15_000 },
  { name: "Kitzbuhel", countryName: "Austria", latitude: 47.4464, longitude: 12.3922, timezone: "Europe/Vienna", population: 8_200 },
  { name: "Newport", region: "Rhode Island", countryName: "United States", latitude: 41.4901, longitude: -71.3128, timezone: "America/New_York", population: 25_000 },
  { name: "Antalya", countryName: "Turkey", latitude: 36.8969, longitude: 30.7133, timezone: "Europe/Istanbul", population: 1_344_000 },

  // Golf — majors, flagship PGA Tour & DP World Tour venues
  { name: "Augusta", region: "Georgia", countryName: "United States", latitude: 33.4735, longitude: -82.0105, timezone: "America/New_York", population: 202_000 },
  { name: "Pinehurst", region: "North Carolina", countryName: "United States", latitude: 35.1954, longitude: -79.4695, timezone: "America/New_York", population: 17_000 },
  { name: "Pebble Beach", region: "California", countryName: "United States", latitude: 36.5674, longitude: -121.9487, timezone: "America/Los_Angeles", population: 4_500 },
  { name: "Ponte Vedra Beach", region: "Florida", countryName: "United States", latitude: 30.2397, longitude: -81.3856, timezone: "America/New_York", population: 34_000 },
  { name: "Palm Beach Gardens", region: "Florida", countryName: "United States", latitude: 26.8234, longitude: -80.1386, timezone: "America/New_York", population: 59_000 },
  { name: "La Quinta", region: "California", countryName: "United States", latitude: 33.6634, longitude: -116.278, timezone: "America/Los_Angeles", population: 41_000 },
  { name: "Lahaina", region: "Hawaii", countryName: "United States", latitude: 20.8783, longitude: -156.6825, timezone: "Pacific/Honolulu", population: 12_000 },
  { name: "Scottsdale", region: "Arizona", countryName: "United States", latitude: 33.4942, longitude: -111.9261, timezone: "America/Phoenix", population: 241_000 },
  { name: "Brookline", region: "Massachusetts", countryName: "United States", latitude: 42.3318, longitude: -71.1212, timezone: "America/New_York", population: 63_000 },
  { name: "Southampton", region: "New York", countryName: "United States", latitude: 40.8843, longitude: -72.3895, timezone: "America/New_York", population: 3_600 },
  { name: "Oakmont", region: "Pennsylvania", countryName: "United States", latitude: 40.5217, longitude: -79.8417, timezone: "America/New_York", population: 6_400 },
  { name: "Kiawah Island", region: "South Carolina", countryName: "United States", latitude: 32.6082, longitude: -80.0848, timezone: "America/New_York", population: 1_800 },
  { name: "Rochester", region: "New York", countryName: "United States", latitude: 43.1566, longitude: -77.6088, timezone: "America/New_York", population: 211_000 },
  { name: "Farmingdale", region: "New York", countryName: "United States", latitude: 40.7326, longitude: -73.4454, timezone: "America/New_York", population: 8_500 },
  { name: "Sheboygan", region: "Wisconsin", countryName: "United States", latitude: 43.7508, longitude: -87.7145, timezone: "America/Chicago", population: 49_000 },

  // Golf — Open Championship & Ryder Cup rotation (United Kingdom)
  { name: "St Andrews", region: "Scotland", countryName: "United Kingdom", latitude: 56.3398, longitude: -2.7967, timezone: "Europe/London", population: 16_000 },
  { name: "Troon", region: "Scotland", countryName: "United Kingdom", latitude: 55.5415, longitude: -4.6599, timezone: "Europe/London", population: 15_000 },
  { name: "Carnoustie", region: "Scotland", countryName: "United Kingdom", latitude: 56.5026, longitude: -2.7059, timezone: "Europe/London", population: 11_000 },
  { name: "Gullane", region: "Scotland", countryName: "United Kingdom", latitude: 56.035, longitude: -2.8284, timezone: "Europe/London", population: 4_000 },
  { name: "Southport", region: "England", countryName: "United Kingdom", latitude: 53.6476, longitude: -3.0053, timezone: "Europe/London", population: 91_000 },
  { name: "Hoylake", region: "England", countryName: "United Kingdom", latitude: 53.3908, longitude: -3.1806, timezone: "Europe/London", population: 6_000 },
  { name: "Sandwich", region: "England", countryName: "United Kingdom", latitude: 51.272, longitude: 1.3378, timezone: "Europe/London", population: 5_000 },
  { name: "Wentworth", region: "England", countryName: "United Kingdom", latitude: 51.383, longitude: -0.663, timezone: "Europe/London", population: 3_000 },
  { name: "Portrush", region: "Northern Ireland", countryName: "United Kingdom", latitude: 55.1958, longitude: -6.6533, timezone: "Europe/London", population: 7_000 },

  // Golf — international flagship venues
  { name: "Crans-Montana", countryName: "Switzerland", latitude: 46.3088, longitude: 7.4756, timezone: "Europe/Zurich", population: 23_000 },
  { name: "Adare", countryName: "Ireland", latitude: 52.5642, longitude: -8.7909, timezone: "Europe/Dublin", population: 1_200 },
] as const;
