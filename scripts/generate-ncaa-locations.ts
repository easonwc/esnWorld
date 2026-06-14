/**
 * Generates NCAA Division I football campus cities (FBS + FCS).
 * Each listed school fields both football and men's basketball.
 *
 * Run: npx tsx scripts/generate-ncaa-locations.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { LocationSeedEntry } from "../src/persistence/seed/types";

type Campus = readonly [
  city: string,
  state: string,
  latitude: number,
  longitude: number,
  timezone: string,
  population: number,
];

/** [city, state, lat, lon, IANA timezone, population] */
const NCAA_CAMPUSES: readonly Campus[] = [
  // FBS — ACC
  ["Chestnut Hill", "Massachusetts", 42.334, -71.1685, "America/New_York", 22_000],
  ["Berkeley", "California", 37.8716, -122.2727, "America/Los_Angeles", 124_000],
  ["Clemson", "South Carolina", 34.6834, -82.8374, "America/New_York", 17_000],
  ["Durham", "North Carolina", 35.994, -78.8986, "America/New_York", 278_000],
  ["Tallahassee", "Florida", 30.4383, -84.2807, "America/New_York", 196_000],
  ["Louisville", "Kentucky", 38.2527, -85.7585, "America/Kentucky/Louisville", 633_000],
  ["Chapel Hill", "North Carolina", 35.9132, -79.0558, "America/New_York", 61_000],
  ["Stanford", "California", 37.4275, -122.1697, "America/Los_Angeles", 17_000],
  ["Syracuse", "New York", 43.0481, -76.1474, "America/New_York", 146_000],
  ["Charlottesville", "Virginia", 38.0293, -78.4767, "America/New_York", 46_000],
  ["Blacksburg", "Virginia", 37.2296, -80.4139, "America/New_York", 44_000],
  ["Winston-Salem", "North Carolina", 36.0999, -80.2442, "America/New_York", 250_000],
  // FBS — American
  ["West Point", "New York", 41.3915, -73.956, "America/New_York", 6_800],
  ["Greenville", "North Carolina", 35.6127, -77.3664, "America/New_York", 93_000],
  ["Boca Raton", "Florida", 26.3683, -80.1289, "America/New_York", 99_000],
  ["Annapolis", "Maryland", 38.9784, -76.4922, "America/New_York", 39_000],
  ["Denton", "Texas", 33.2148, -97.1331, "America/Chicago", 148_000],
  ["Tulsa", "Oklahoma", 36.154, -95.9928, "America/Chicago", 411_000],
  ["Birmingham", "Alabama", 33.5186, -86.8104, "America/Chicago", 200_000],
  // FBS — Big 12
  ["Tucson", "Arizona", 32.2226, -110.9747, "America/Phoenix", 543_000],
  ["Tempe", "Arizona", 33.4255, -111.94, "America/Phoenix", 180_000],
  ["Waco", "Texas", 31.5493, -97.1467, "America/Chicago", 139_000],
  ["Provo", "Utah", 40.2338, -111.6585, "America/Denver", 115_000],
  ["Boulder", "Colorado", 40.015, -105.2705, "America/Denver", 105_000],
  ["Ames", "Iowa", 42.0308, -93.6319, "America/Chicago", 66_000],
  ["Lawrence", "Kansas", 38.9717, -95.2353, "America/Chicago", 95_000],
  ["Manhattan", "Kansas", 39.1836, -96.5717, "America/Chicago", 54_000],
  ["Stillwater", "Oklahoma", 36.1156, -97.0584, "America/Chicago", 48_000],
  ["Fort Worth", "Texas", 32.7555, -97.3308, "America/Chicago", 918_000],
  ["Lubbock", "Texas", 33.5779, -101.8552, "America/Chicago", 264_000],
  ["Morgantown", "West Virginia", 39.6295, -79.9559, "America/New_York", 30_000],
  // FBS — Big Ten
  ["Champaign", "Illinois", 40.1164, -88.2434, "America/Chicago", 88_000],
  ["Bloomington", "Indiana", 39.1653, -86.5264, "America/Indiana/Indianapolis", 79_000],
  ["Iowa City", "Iowa", 41.6611, -91.5302, "America/Chicago", 74_000],
  ["College Park", "Maryland", 38.9807, -76.9369, "America/New_York", 34_000],
  ["Ann Arbor", "Michigan", 42.2808, -83.743, "America/Detroit", 123_000],
  ["East Lansing", "Michigan", 42.7369, -84.4839, "America/Detroit", 48_000],
  ["Lincoln", "Nebraska", 40.8136, -96.7026, "America/Chicago", 291_000],
  ["Evanston", "Illinois", 42.0451, -87.6877, "America/Chicago", 78_000],
  ["Eugene", "Oregon", 44.0521, -123.0868, "America/Los_Angeles", 176_000],
  ["State College", "Pennsylvania", 40.7934, -77.86, "America/New_York", 40_000],
  ["West Lafayette", "Indiana", 40.4259, -86.9081, "America/Indiana/Indianapolis", 46_000],
  ["Piscataway", "New Jersey", 40.4993, -74.399, "America/New_York", 60_000],
  ["Madison", "Wisconsin", 43.0731, -89.4012, "America/Chicago", 269_000],
  // FBS — Conference USA
  ["Newark", "Delaware", 39.6837, -75.7497, "America/New_York", 31_000],
  ["Jacksonville", "Alabama", 33.8137, -85.7614, "America/Chicago", 12_800],
  ["Kennesaw", "Georgia", 34.0234, -84.6155, "America/New_York", 35_000],
  ["Lynchburg", "Virginia", 37.4138, -79.1422, "America/New_York", 79_000],
  ["Ruston", "Louisiana", 32.5232, -92.6379, "America/Chicago", 22_000],
  ["Murfreesboro", "Tennessee", 35.8456, -86.3922, "America/Chicago", 152_000],
  ["Springfield", "Missouri", 37.209, -93.2923, "America/Chicago", 169_000],
  ["Las Cruces", "New Mexico", 32.3199, -106.7637, "America/Denver", 111_000],
  ["Huntsville", "Texas", 30.7235, -95.5508, "America/Chicago", 45_000],
  ["El Paso", "Texas", 31.7619, -106.485, "America/Denver", 678_000],
  ["Bowling Green", "Kentucky", 36.9685, -86.4808, "America/Chicago", 72_000],
  // FBS — Independent
  ["Storrs", "Connecticut", 41.8084, -72.2495, "America/New_York", 10_000],
  ["South Bend", "Indiana", 41.6764, -86.252, "America/Indiana/Indianapolis", 103_000],
  // FBS — MAC
  ["Akron", "Ohio", 41.0814, -81.519, "America/New_York", 190_000],
  ["Muncie", "Indiana", 40.1934, -85.3864, "America/Indiana/Indianapolis", 65_000],
  ["Bowling Green", "Ohio", 41.3748, -83.6513, "America/New_York", 31_000],
  ["Mount Pleasant", "Michigan", 43.5978, -84.7675, "America/Detroit", 21_000],
  ["Ypsilanti", "Michigan", 42.2411, -83.613, "America/Detroit", 20_000],
  ["Kent", "Ohio", 41.1537, -81.3579, "America/New_York", 28_000],
  ["Oxford", "Ohio", 39.507, -84.7452, "America/New_York", 23_000],
  ["DeKalb", "Illinois", 41.9295, -88.7504, "America/Chicago", 40_000],
  ["Athens", "Ohio", 39.3292, -82.1013, "America/New_York", 24_000],
  ["Toledo", "Ohio", 41.6528, -83.5379, "America/New_York", 270_000],
  ["Amherst", "Massachusetts", 42.3732, -72.5199, "America/New_York", 39_000],
  ["Kalamazoo", "Michigan", 42.2917, -85.5872, "America/Detroit", 73_000],
  // FBS — Mountain West
  ["Colorado Springs", "Colorado", 38.8339, -104.8214, "America/Denver", 478_000],
  ["Boise", "Idaho", 43.615, -116.2023, "America/Boise", 235_000],
  ["Fort Collins", "Colorado", 40.5853, -105.0844, "America/Denver", 169_000],
  ["Fresno", "California", 36.7378, -119.7871, "America/Los_Angeles", 542_000],
  ["Honolulu", "Hawaii", 21.3069, -157.8583, "Pacific/Honolulu", 350_000],
  ["Reno", "Nevada", 39.5296, -119.8138, "America/Los_Angeles", 264_000],
  ["Albuquerque", "New Mexico", 35.0844, -106.6504, "America/Denver", 564_000],
  ["Logan", "Utah", 41.737, -111.8338, "America/Denver", 52_000],
  ["Laramie", "Wyoming", 41.3114, -105.5911, "America/Denver", 32_000],
  // FBS — Pac-12
  ["Corvallis", "Oregon", 44.5646, -123.262, "America/Los_Angeles", 58_000],
  ["Pullman", "Washington", 46.7298, -117.1817, "America/Los_Angeles", 32_000],
  // FBS — SEC
  ["Tuscaloosa", "Alabama", 33.2098, -87.5692, "America/Chicago", 100_000],
  ["Fayetteville", "Arkansas", 36.0626, -94.1574, "America/Chicago", 95_000],
  ["Auburn", "Alabama", 32.6099, -85.4808, "America/Chicago", 76_000],
  ["Gainesville", "Florida", 29.6516, -82.3248, "America/New_York", 141_000],
  ["Lexington", "Kentucky", 38.0406, -84.5037, "America/New_York", 322_000],
  ["Baton Rouge", "Louisiana", 30.4515, -91.1871, "America/Chicago", 227_000],
  ["Starkville", "Mississippi", 33.4504, -88.8184, "America/Chicago", 24_000],
  ["Oxford", "Mississippi", 34.3665, -89.5192, "America/Chicago", 25_000],
  ["Columbia", "Missouri", 38.9517, -92.3341, "America/Chicago", 126_000],
  ["Norman", "Oklahoma", 35.2226, -97.4395, "America/Chicago", 128_000],
  ["Columbia", "South Carolina", 34.0007, -81.0348, "America/New_York", 137_000],
  ["Knoxville", "Tennessee", 35.9606, -83.9207, "America/New_York", 190_000],
  ["Austin", "Texas", 30.2672, -97.7431, "America/Chicago", 978_000],
  ["College Station", "Texas", 30.628, -96.3344, "America/Chicago", 120_000],
  ["Athens", "Georgia", 33.9519, -83.3576, "America/New_York", 127_000],
  // FBS — Sun Belt
  ["Boone", "North Carolina", 36.2168, -81.6746, "America/New_York", 19_000],
  ["Jonesboro", "Arkansas", 35.8423, -90.7043, "America/Chicago", 78_000],
  ["Conway", "South Carolina", 33.836, -79.0478, "America/New_York", 24_000],
  ["Statesboro", "Georgia", 32.4488, -81.7832, "America/New_York", 32_000],
  ["Harrisonburg", "Virginia", 38.4496, -78.8689, "America/New_York", 51_000],
  ["Lafayette", "Louisiana", 30.2241, -92.0198, "America/Chicago", 121_000],
  ["Huntington", "West Virginia", 38.4192, -82.4452, "America/New_York", 46_000],
  ["Norfolk", "Virginia", 36.8508, -76.2859, "America/New_York", 238_000],
  ["Mobile", "Alabama", 30.6954, -88.0399, "America/Chicago", 187_000],
  ["Hattiesburg", "Mississippi", 31.3271, -89.2903, "America/Chicago", 48_000],
  ["San Marcos", "Texas", 29.8833, -97.9414, "America/Chicago", 67_000],
  ["Troy", "Alabama", 31.8088, -85.97, "America/Chicago", 20_000],
  ["Monroe", "Louisiana", 32.5093, -92.1193, "America/Chicago", 47_000],

  // FCS — Big Sky
  ["Davis", "California", 38.5449, -121.7405, "America/Los_Angeles", 68_000],
  ["San Luis Obispo", "California", 35.2828, -120.6596, "America/Los_Angeles", 47_000],
  ["Cheney", "Washington", 47.4874, -117.576, "America/Los_Angeles", 11_000],
  ["Moscow", "Idaho", 46.7323, -117.0002, "America/Los_Angeles", 25_000],
  ["Pocatello", "Idaho", 42.8713, -112.4455, "America/Boise", 56_000],
  ["Missoula", "Montana", 46.8721, -113.994, "America/Denver", 75_000],
  ["Bozeman", "Montana", 45.677, -111.0429, "America/Denver", 53_000],
  ["Flagstaff", "Arizona", 35.1983, -111.6513, "America/Phoenix", 76_000],
  ["Greeley", "Colorado", 40.4233, -104.7091, "America/Denver", 108_000],
  ["Ogden", "Utah", 41.223, -111.9738, "America/Denver", 87_000],

  // FCS — CAA / Patriot / Ivy / MEAC / NEC
  ["Providence", "Rhode Island", 41.824, -71.4128, "America/New_York", 190_000],
  ["Ithaca", "New York", 42.444, -76.5019, "America/New_York", 32_000],
  ["Hanover", "New Hampshire", 43.7022, -72.2896, "America/New_York", 11_000],
  ["Cambridge", "Massachusetts", 42.3736, -71.1097, "America/New_York", 118_000],
  ["Princeton", "New Jersey", 40.3573, -74.6672, "America/New_York", 30_000],
  ["New Haven", "Connecticut", 41.3083, -72.9279, "America/New_York", 134_000],
  ["Daytona Beach", "Florida", 29.2108, -81.0228, "America/New_York", 72_000],
  ["Dover", "Delaware", 39.1582, -75.5244, "America/New_York", 39_000],
  ["Orangeburg", "South Carolina", 33.4918, -80.8556, "America/New_York", 13_000],
  ["Richmond", "Virginia", 37.5407, -77.436, "America/New_York", 226_000],
  ["Williamsburg", "Virginia", 37.2707, -76.7075, "America/New_York", 15_000],
  ["Towson", "Maryland", 39.3935, -76.6019, "America/New_York", 58_000],
  ["Kingston", "Rhode Island", 41.4801, -71.5228, "America/New_York", 7_000],
  ["Durham", "New Hampshire", 43.134, -70.9264, "America/New_York", 15_000],
  ["Lewisburg", "Pennsylvania", 40.9645, -76.8844, "America/New_York", 5_200],
  ["Hamilton", "New York", 42.819, -75.544, "America/New_York", 3_900],
  ["Worcester", "Massachusetts", 42.2626, -71.8023, "America/New_York", 206_000],
  ["Easton", "Pennsylvania", 40.6884, -75.2207, "America/New_York", 28_000],
  ["Bethlehem", "Pennsylvania", 40.6259, -75.3705, "America/New_York", 75_000],
  ["Poughkeepsie", "New York", 41.7004, -73.921, "America/New_York", 31_000],
  ["Buies Creek", "North Carolina", 35.4132, -78.7356, "America/New_York", 2_900],
  ["Elon", "North Carolina", 36.1029, -79.5067, "America/New_York", 10_000],
  ["West Long Branch", "New Jersey", 40.2904, -74.0176, "America/New_York", 8_100],
  ["Hampton", "Virginia", 37.0299, -76.3452, "America/New_York", 137_000],
  ["Orono", "Maine", 44.8829, -68.671, "America/New_York", 10_000],
  ["Greensboro", "North Carolina", 36.0726, -79.792, "America/New_York", 299_000],
  ["Stony Brook", "New York", 40.9256, -73.1409, "America/New_York", 13_000],
  ["Fairfield", "Connecticut", 41.1412, -73.2637, "America/New_York", 61_000],
  ["New Britain", "Connecticut", 41.6612, -72.7795, "America/New_York", 74_000],
  ["Smithfield", "Rhode Island", 41.922, -71.5495, "America/New_York", 13_000],
  ["Easton", "Massachusetts", 42.0245, -71.1287, "America/New_York", 25_000],
  ["Loretto", "Pennsylvania", 40.5031, -78.6303, "America/New_York", 1_200],
  ["Brookville", "New York", 40.8132, -73.5673, "America/New_York", 3_600],
  ["Albany", "New York", 42.6526, -73.7562, "America/New_York", 99_000],
  ["Merrimack", "Massachusetts", 42.5828, -71.3545, "America/New_York", 6_500],

  // FCS — Missouri Valley / Big South-OVC
  ["Normal", "Illinois", 40.5142, -88.9906, "America/Chicago", 52_000],
  ["Terre Haute", "Indiana", 39.4667, -87.4139, "America/Indiana/Indianapolis", 58_000],
  ["Grand Forks", "North Dakota", 47.9253, -97.0329, "America/Chicago", 59_000],
  ["Fargo", "North Dakota", 46.8772, -96.7898, "America/Chicago", 125_000],
  ["Brookings", "South Dakota", 44.3114, -96.7984, "America/Chicago", 23_000],
  ["Vermillion", "South Dakota", 42.7794, -96.9292, "America/Chicago", 11_000],
  ["Cedar Falls", "Iowa", 42.5349, -92.4455, "America/Chicago", 40_000],
  ["Carbondale", "Illinois", 37.7273, -89.2168, "America/Chicago", 22_000],
  ["Macomb", "Illinois", 40.4592, -90.6718, "America/Chicago", 18_000],
  ["Youngstown", "Ohio", 41.0998, -80.6495, "America/New_York", 60_000],
  ["Murray", "Kentucky", 36.6106, -88.315, "America/Chicago", 17_000],
  ["Morehead", "Kentucky", 38.4837, -83.4416, "America/New_York", 7_900],
  ["Charleston", "Illinois", 39.4961, -88.1762, "America/Chicago", 19_000],
  ["Cape Girardeau", "Missouri", 37.3059, -89.5181, "America/Chicago", 39_000],
  ["Cookeville", "Tennessee", 36.1628, -85.5016, "America/Chicago", 35_000],
  ["Martin", "Tennessee", 36.3434, -88.8503, "America/Chicago", 10_000],
  ["Richmond", "Kentucky", 37.7479, -84.2947, "America/New_York", 34_000],
  ["Boiling Springs", "North Carolina", 35.2543, -81.667, "America/New_York", 5_600],
  ["St. Charles", "Missouri", 38.7881, -90.4974, "America/Chicago", 70_000],
  ["Romeoville", "Illinois", 41.6475, -88.0895, "America/Chicago", 40_000],

  // FCS — SoCon / Southern / Southland / UAC / SWAC / Pioneer
  ["Chattanooga", "Tennessee", 35.0456, -85.3097, "America/New_York", 181_000],
  ["Johnson City", "Tennessee", 36.3134, -82.3535, "America/New_York", 71_000],
  ["Greenville", "South Carolina", 34.8526, -82.394, "America/New_York", 72_000],
  ["Macon", "Georgia", 32.8407, -83.6324, "America/New_York", 157_000],
  ["Spartanburg", "South Carolina", 34.9496, -81.932, "America/New_York", 38_000],
  ["Charleston", "South Carolina", 32.7765, -79.9311, "America/New_York", 150_000],
  ["Cullowhee", "North Carolina", 35.3137, -83.1765, "America/New_York", 9_400],
  ["Lexington", "Virginia", 37.784, -79.4428, "America/New_York", 7_300],
  ["Des Moines", "Iowa", 41.5868, -93.625, "America/Chicago", 214_000],
  ["Davidson", "North Carolina", 35.4993, -80.8484, "America/New_York", 13_000],
  ["Dayton", "Ohio", 39.7589, -84.1916, "America/New_York", 137_000],
  ["DeLand", "Florida", 29.0283, -81.3031, "America/New_York", 34_000],
  ["Valparaiso", "Indiana", 41.4731, -87.0611, "America/Chicago", 33_000],
  ["Lake Charles", "Louisiana", 30.2266, -93.2174, "America/Chicago", 84_000],
  ["Thibodaux", "Louisiana", 29.7958, -90.8229, "America/Chicago", 15_000],
  ["Natchitoches", "Louisiana", 31.7607, -93.0863, "America/Chicago", 18_000],
  ["Hammond", "Louisiana", 30.5044, -90.4612, "America/Chicago", 19_000],
  ["Beaumont", "Texas", 30.0802, -94.1266, "America/Chicago", 115_000],
  ["Montgomery", "Alabama", 32.3792, -86.3077, "America/Chicago", 200_000],
  ["Huntsville", "Alabama", 34.7304, -86.5861, "America/Chicago", 215_000],
  ["Jackson", "Mississippi", 32.2988, -90.1848, "America/Chicago", 154_000],
  ["Prairie View", "Texas", 30.0933, -95.9878, "America/Chicago", 6_400],
  ["Florence", "Alabama", 34.7998, -87.6773, "America/Chicago", 40_000],
  ["Stephenville", "Texas", 32.2207, -98.2023, "America/Chicago", 21_000],
  ["St. George", "Utah", 37.0965, -113.5684, "America/Denver", 95_000],
  ["Carrollton", "Georgia", 33.5801, -85.0766, "America/New_York", 26_000],
  ["Abilene", "Texas", 32.4487, -99.7331, "America/Chicago", 125_000],
  ["Nacogdoches", "Texas", 31.6035, -94.6555, "America/Chicago", 33_000],
  ["Commerce", "Texas", 33.2473, -95.8994, "America/Chicago", 9_000],
  ["Albany", "Georgia", 31.5785, -84.1557, "America/New_York", 69_000],
  ["Lorman", "Mississippi", 31.7374, -91.2326, "America/Chicago", 600],
  ["Pine Bluff", "Arkansas", 34.2284, -92.0032, "America/Chicago", 41_000],
  ["Grambling", "Louisiana", 32.5276, -92.714, "America/Chicago", 5_200],
  ["Conway", "Arkansas", 35.0887, -92.4421, "America/Chicago", 65_000],
  ["St. Paul", "Minnesota", 44.9537, -93.09, "America/Chicago", 311_000],
];

function locationMergeKey(
  name: string,
  countryName: string,
  region?: string | null,
): string {
  const normalizedRegion = region?.trim().toLowerCase() ?? "";
  return `${name.trim().toLowerCase()}|${normalizedRegion}|${countryName.trim().toLowerCase()}`;
}

function loadExistingLocationKeys(): Set<string> {
  const dataPath = join(process.cwd(), "src/persistence/seed/locations.data.ts");
  const source = readFileSync(dataPath, "utf8");
  const keys = new Set<string>();
  const pattern =
    /\{\s*name:\s*"([^"]+)"(?:\s*,\s*region:\s*(?:"([^"]*)"|null))?\s*,\s*countryName:\s*"United States"/g;

  for (const match of source.matchAll(pattern)) {
    keys.add(locationMergeKey(match[1], "United States", match[2] ?? null));
  }

  return keys;
}

function dedupeCampuses(campuses: readonly Campus[]): Campus[] {
  const seen = new Set<string>();
  const unique: Campus[] = [];

  for (const campus of campuses) {
    const key = `${campus[0].toLowerCase()}|${campus[1].toLowerCase()}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push([...campus] as Campus);
  }

  return unique;
}

function buildNcaaLocations(
  campuses: readonly Campus[],
  existingKeys: Set<string>,
): LocationSeedEntry[] {
  const unique = dedupeCampuses(campuses);
  const entries: LocationSeedEntry[] = [];

  for (const [city, state, latitude, longitude, timezone, population] of unique) {
    const mergeKey = locationMergeKey(city, "United States", state);

    if (existingKeys.has(mergeKey)) {
      continue;
    }

    existingKeys.add(mergeKey);
    entries.push({
      name: city,
      countryName: "United States",
      region: state,
      latitude,
      longitude,
      timezone,
      population,
    });
  }

  return entries.sort((a, b) => {
    const byName = a.name.localeCompare(b.name);
    if (byName !== 0) {
      return byName;
    }
    return (a.region ?? "").localeCompare(b.region ?? "");
  });
}

function formatPopulation(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "_");
}

function formatEntry(entry: LocationSeedEntry): string {
  const region = entry.region ? `region: ${JSON.stringify(entry.region)}, ` : "";
  return `  { name: ${JSON.stringify(entry.name)}, ${region}countryName: "United States", latitude: ${entry.latitude}, longitude: ${entry.longitude}, timezone: ${JSON.stringify(entry.timezone)}, population: ${formatPopulation(entry.population)} },`;
}

function main(): void {
  const existingKeys = loadExistingLocationKeys();
  const entries = buildNcaaLocations(NCAA_CAMPUSES, existingKeys);
  const lines = entries.map(formatEntry).join("\n");

  const output = `import type { LocationSeedEntry } from "./types";

/**
 * Campus cities for NCAA Division I schools that field football and men's basketball.
 * Covers FBS and FCS programs. Generated by scripts/generate-ncaa-locations.ts.
 */
export const NCAA_LOCATION_SEED_DATA: readonly LocationSeedEntry[] = [
${lines}
] as const;
`;

  const outPath = join(process.cwd(), "src/persistence/seed/ncaa-locations.data.ts");
  writeFileSync(outPath, output, "utf8");
  console.log(`Wrote ${entries.length} NCAA campus cities to ${outPath}`);
}

main();
