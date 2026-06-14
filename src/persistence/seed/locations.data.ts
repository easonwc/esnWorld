import type { LocationSeedEntry } from "./types";

/**
 * Major world cities across continents and countries, including national capitals.
 * Populations are approximate metropolitan-area figures for megacities and
 * city-proper figures for smaller capitals (circa 2020–2024 estimates).
 */
export const LOCATION_SEED_DATA: readonly LocationSeedEntry[] = [
  // Asia
  { name: "Tokyo", countryName: "Japan", latitude: 35.6762, longitude: 139.6503, timezone: "Asia/Tokyo", population: 37_274_000 },
  { name: "Delhi", countryName: "India", latitude: 28.7041, longitude: 77.1025, timezone: "Asia/Kolkata", population: 32_941_000 },
  { name: "Shanghai", countryName: "China", latitude: 31.2304, longitude: 121.4737, timezone: "Asia/Shanghai", population: 29_210_000 },
  { name: "Dhaka", countryName: "Bangladesh", latitude: 23.8103, longitude: 90.4125, timezone: "Asia/Dhaka", population: 23_210_000 },
  { name: "Beijing", countryName: "China", latitude: 39.9042, longitude: 116.4074, timezone: "Asia/Shanghai", population: 21_766_000 },
  { name: "Mumbai", countryName: "India", latitude: 19.076, longitude: 72.8777, timezone: "Asia/Kolkata", population: 21_357_000 },
  { name: "Osaka", countryName: "Japan", latitude: 34.6937, longitude: 135.5023, timezone: "Asia/Tokyo", population: 19_059_000 },
  { name: "Karachi", countryName: "Pakistan", latitude: 24.8607, longitude: 67.0011, timezone: "Asia/Karachi", population: 16_839_000 },
  { name: "Chongqing", countryName: "China", latitude: 29.563, longitude: 106.5516, timezone: "Asia/Shanghai", population: 16_382_000 },
  { name: "Kolkata", countryName: "India", latitude: 22.5726, longitude: 88.3639, timezone: "Asia/Kolkata", population: 15_570_000 },
  { name: "Manila", countryName: "Philippines", latitude: 14.5995, longitude: 120.9842, timezone: "Asia/Manila", population: 14_826_000 },
  { name: "Guangzhou", countryName: "China", latitude: 23.1291, longitude: 113.2644, timezone: "Asia/Shanghai", population: 13_635_000 },
  { name: "Lahore", countryName: "Pakistan", latitude: 31.5204, longitude: 74.3587, timezone: "Asia/Karachi", population: 13_044_000 },
  { name: "Bangalore", countryName: "India", latitude: 12.9716, longitude: 77.5946, timezone: "Asia/Kolkata", population: 12_764_000 },
  { name: "Jakarta", countryName: "Indonesia", latitude: -6.2088, longitude: 106.8456, timezone: "Asia/Jakarta", population: 11_074_000 },
  { name: "Bangkok", countryName: "Thailand", latitude: 13.7563, longitude: 100.5018, timezone: "Asia/Bangkok", population: 10_723_000 },
  { name: "Seoul", countryName: "South Korea", latitude: 37.5665, longitude: 126.978, timezone: "Asia/Seoul", population: 9_975_000 },
  { name: "Ho Chi Minh City", countryName: "Vietnam", latitude: 10.8231, longitude: 106.6297, timezone: "Asia/Ho_Chi_Minh", population: 9_077_000 },
  { name: "Tehran", countryName: "Iran", latitude: 35.6892, longitude: 51.389, timezone: "Asia/Tehran", population: 9_500_000 },
  { name: "Hong Kong", countryName: "Hong Kong", latitude: 22.3193, longitude: 114.1694, timezone: "Asia/Hong_Kong", population: 7_496_000 },
  { name: "Singapore", countryName: "Singapore", latitude: 1.3521, longitude: 103.8198, timezone: "Asia/Singapore", population: 5_920_000 },
  { name: "Riyadh", countryName: "Saudi Arabia", latitude: 24.7136, longitude: 46.6753, timezone: "Asia/Riyadh", population: 7_677_000 },
  { name: "Dubai", countryName: "United Arab Emirates", latitude: 25.2048, longitude: 55.2708, timezone: "Asia/Dubai", population: 3_478_000 },
  { name: "New Delhi", countryName: "India", latitude: 28.6139, longitude: 77.209, timezone: "Asia/Kolkata", population: 333_000 },
  { name: "Islamabad", countryName: "Pakistan", latitude: 33.6844, longitude: 73.0479, timezone: "Asia/Karachi", population: 1_014_000 },

  // Africa
  { name: "Cairo", countryName: "Egypt", latitude: 30.0444, longitude: 31.2357, timezone: "Africa/Cairo", population: 22_183_000 },
  { name: "Lagos", countryName: "Nigeria", latitude: 6.5244, longitude: 3.3792, timezone: "Africa/Lagos", population: 15_387_000 },
  { name: "Kinshasa", countryName: "Democratic Republic of the Congo", latitude: -4.4419, longitude: 15.2663, timezone: "Africa/Kinshasa", population: 15_031_000 },
  { name: "Johannesburg", countryName: "South Africa", latitude: -26.2041, longitude: 28.0473, timezone: "Africa/Johannesburg", population: 6_065_000 },
  { name: "Nairobi", countryName: "Kenya", latitude: -1.2921, longitude: 36.8219, timezone: "Africa/Nairobi", population: 5_118_000 },
  { name: "Addis Ababa", countryName: "Ethiopia", latitude: 9.032, longitude: 38.7469, timezone: "Africa/Addis_Ababa", population: 5_228_000 },
  { name: "Cape Town", countryName: "South Africa", latitude: -33.9249, longitude: 18.4241, timezone: "Africa/Johannesburg", population: 4_809_000 },
  { name: "Casablanca", countryName: "Morocco", latitude: 33.5731, longitude: -7.5898, timezone: "Africa/Casablanca", population: 3_752_000 },
  { name: "Algiers", countryName: "Algeria", latitude: 36.7538, longitude: 3.0588, timezone: "Africa/Algiers", population: 3_916_000 },
  { name: "Accra", countryName: "Ghana", latitude: 5.6037, longitude: -0.187, timezone: "Africa/Accra", population: 2_514_000 },

  // Europe
  { name: "Istanbul", countryName: "Turkey", latitude: 41.0082, longitude: 28.9784, timezone: "Europe/Istanbul", population: 15_636_000 },
  { name: "Moscow", countryName: "Russia", latitude: 55.7558, longitude: 37.6173, timezone: "Europe/Moscow", population: 12_655_000 },
  { name: "Paris", countryName: "France", latitude: 48.8566, longitude: 2.3522, timezone: "Europe/Paris", population: 11_142_000 },
  { name: "London", countryName: "United Kingdom", latitude: 51.5074, longitude: -0.1278, timezone: "Europe/London", population: 9_648_000 },
  { name: "Berlin", countryName: "Germany", latitude: 52.52, longitude: 13.405, timezone: "Europe/Berlin", population: 3_677_000 },
  { name: "Madrid", countryName: "Spain", latitude: 40.4168, longitude: -3.7038, timezone: "Europe/Madrid", population: 6_751_000 },
  { name: "Rome", countryName: "Italy", latitude: 41.9028, longitude: 12.4964, timezone: "Europe/Rome", population: 4_342_000 },
  { name: "Amsterdam", countryName: "Netherlands", latitude: 52.3676, longitude: 4.9041, timezone: "Europe/Amsterdam", population: 2_480_000 },
  { name: "Ankara", countryName: "Turkey", latitude: 39.9334, longitude: 32.8597, timezone: "Europe/Istanbul", population: 5_664_000 },
  { name: "Warsaw", countryName: "Poland", latitude: 52.2297, longitude: 21.0122, timezone: "Europe/Warsaw", population: 3_100_000 },
  { name: "Vienna", countryName: "Austria", latitude: 48.2082, longitude: 16.3738, timezone: "Europe/Vienna", population: 2_019_000 },
  { name: "Athens", countryName: "Greece", latitude: 37.9838, longitude: 23.7275, timezone: "Europe/Athens", population: 3_155_000 },
  { name: "Stockholm", countryName: "Sweden", latitude: 59.3293, longitude: 18.0686, timezone: "Europe/Stockholm", population: 1_632_000 },
  { name: "Brussels", countryName: "Belgium", latitude: 50.8503, longitude: 4.3517, timezone: "Europe/Brussels", population: 1_208_000 },
  { name: "Dublin", countryName: "Ireland", latitude: 53.3498, longitude: -6.2603, timezone: "Europe/Dublin", population: 1_263_000 },
  { name: "Prague", countryName: "Czech Republic", latitude: 50.0755, longitude: 14.4378, timezone: "Europe/Prague", population: 1_357_000 },

  // North America
  { name: "Mexico City", countryName: "Mexico", latitude: 19.4326, longitude: -99.1332, timezone: "America/Mexico_City", population: 22_281_000 },
  { name: "New York", countryName: "United States", latitude: 40.7128, longitude: -74.006, timezone: "America/New_York", population: 8_336_817 },
  { name: "Los Angeles", countryName: "United States", latitude: 34.0522, longitude: -118.2437, timezone: "America/Los_Angeles", population: 12_534_000 },
  { name: "Chicago", countryName: "United States", latitude: 41.8781, longitude: -87.6298, timezone: "America/Chicago", population: 8_901_000 },
  { name: "Toronto", countryName: "Canada", latitude: 43.6532, longitude: -79.3832, timezone: "America/Toronto", population: 6_202_000 },
  { name: "Washington, D.C.", countryName: "United States", latitude: 38.9072, longitude: -77.0369, timezone: "America/New_York", population: 712_000 },
  { name: "Montreal", countryName: "Canada", latitude: 45.5017, longitude: -73.5673, timezone: "America/Toronto", population: 4_292_000 },
  { name: "Vancouver", countryName: "Canada", latitude: 49.2827, longitude: -123.1207, timezone: "America/Vancouver", population: 2_642_000 },
  { name: "Ottawa", countryName: "Canada", latitude: 45.4215, longitude: -75.6972, timezone: "America/Toronto", population: 1_017_000 },

  // South America
  { name: "São Paulo", countryName: "Brazil", latitude: -23.5505, longitude: -46.6333, timezone: "America/Sao_Paulo", population: 22_620_000 },
  { name: "Buenos Aires", countryName: "Argentina", latitude: -34.6037, longitude: -58.3816, timezone: "America/Argentina/Buenos_Aires", population: 15_624_000 },
  { name: "Rio de Janeiro", countryName: "Brazil", latitude: -22.9068, longitude: -43.1729, timezone: "America/Sao_Paulo", population: 13_634_000 },
  { name: "Bogotá", countryName: "Colombia", latitude: 4.711, longitude: -74.0721, timezone: "America/Bogota", population: 11_167_000 },
  { name: "Lima", countryName: "Peru", latitude: -12.0464, longitude: -77.0428, timezone: "America/Lima", population: 11_044_000 },
  { name: "Santiago", countryName: "Chile", latitude: -33.4489, longitude: -70.6693, timezone: "America/Santiago", population: 6_903_000 },
  { name: "Brasília", countryName: "Brazil", latitude: -15.7975, longitude: -47.8919, timezone: "America/Sao_Paulo", population: 4_815_000 },
  { name: "Caracas", countryName: "Venezuela", latitude: 10.4806, longitude: -66.9036, timezone: "America/Caracas", population: 2_946_000 },

  // Oceania
  { name: "Sydney", countryName: "Australia", latitude: -33.8688, longitude: 151.2093, timezone: "Australia/Sydney", population: 5_312_000 },
  { name: "Melbourne", countryName: "Australia", latitude: -37.8136, longitude: 144.9631, timezone: "Australia/Melbourne", population: 5_078_000 },
  { name: "Auckland", countryName: "New Zealand", latitude: -36.8485, longitude: 174.7633, timezone: "Pacific/Auckland", population: 1_657_000 },
  { name: "Wellington", countryName: "New Zealand", latitude: -41.2865, longitude: 174.7762, timezone: "Pacific/Auckland", population: 212_000 },
  { name: "Canberra", countryName: "Australia", latitude: -35.2809, longitude: 149.13, timezone: "Australia/Sydney", population: 460_000 },
] as const;
