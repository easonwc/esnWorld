import type { LocationSeedEntry } from "./types";

/** Supplemental host cities for professional tennis tour events. */
export const TENNIS_LOCATION_SEED_DATA: readonly LocationSeedEntry[] = [
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
  { name: "Montreal", countryName: "Canada", latitude: 45.5017, longitude: -73.5673, timezone: "America/Toronto", population: 1_780_000 },
  { name: "Toronto", countryName: "Canada", latitude: 43.6532, longitude: -79.3832, timezone: "America/Toronto", population: 2_930_000 },
] as const;
