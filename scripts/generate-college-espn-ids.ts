/**
 * Builds college ESPN logo IDs keyed by NCAA seed school name.
 * Run: npx tsx scripts/generate-college-espn-ids.ts
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { NCAA_SCHOOLS } from "./ncaa-schools-source";

const LOCATION_ALIASES: Record<string, string> = {
  "Appalachian State University": "App State",
  "Bowling Green State University": "Bowling Green",
  "Brigham Young University": "BYU",
  "California Polytechnic State University, San Luis Obispo": "Cal Poly",
  "California State University, Fresno": "Fresno State",
  "Central Connecticut State University": "Central Connecticut",
  "College of William & Mary": "William & Mary",
  "College of the Holy Cross": "Holy Cross",
  "Georgia Institute of Technology": "Georgia Tech",
  "Grambling State University": "Grambling",
  "Indiana University Bloomington": "Indiana",
  "Louisiana State University": "LSU",
  "McNeese State University": "McNeese",
  "Middle Tennessee State University": "Middle Tennessee",
  "Mississippi State University": "Mississippi State",
  "Nicholls State University": "Nicholls",
  "North Carolina Agricultural and Technical State University": "NC A&T",
  "Northwestern State University of Louisiana": "Northwestern State",
  "Pennsylvania State University": "Penn State",
  "Rutgers University-New Brunswick": "Rutgers",
  "Sam Houston State University": "Sam Houston",
  "Southern Illinois University Carbondale": "Southern Illinois",
  "Southern Methodist University": "SMU",
  "Stephen F. Austin State University": "Stephen F. Austin",
  "Texas Christian University": "TCU",
  "Texas A&M University-Commerce": "East Texas A&M",
  "The Ohio State University": "Ohio State",
  "United States Air Force Academy": "Air Force",
  "University of Alabama at Birmingham": "UAB",
  "University of Arkansas at Pine Bluff": "Arkansas-Pine Bluff",
  "University of California, Berkeley": "California",
  "University of California, Davis": "UC Davis",
  "University of California, Los Angeles": "UCLA",
  "University of Central Florida": "UCF",
  "University of Colorado Boulder": "Colorado",
  "University of Connecticut": "UConn",
  "University of Hawaii at Manoa": "Hawai'i",
  "University of Illinois Urbana-Champaign": "Illinois",
  "University of Louisiana at Lafayette": "Louisiana",
  "University of Louisiana at Monroe": "UL Monroe",
  "University of Massachusetts Amherst": "UMass",
  "University of Minnesota Twin Cities": "Minnesota",
  "University of Mississippi": "Ole Miss",
  "University of Nebraska-Lincoln": "Nebraska",
  "University of Nevada, Reno": "Nevada",
  "University of North Carolina at Chapel Hill": "North Carolina",
  "University of Pittsburgh": "Pitt",
  "University of Southern California": "USC",
  "University of Southern Mississippi": "Southern Miss",
  "University of St. Thomas": "St. Thomas-Minnesota",
  "University of Tennessee at Chattanooga": "Chattanooga",
  "University of Tennessee at Martin": "UT Martin",
  "University of Tennessee, Knoxville": "Tennessee",
  "University of Texas at Austin": "Texas",
  "University of Texas at El Paso": "UTEP",
  "University of Wisconsin-Madison": "Wisconsin",
  "University at Albany, SUNY": "UAlbany",
  "United States Military Academy": "Army",
  "United States Naval Academy": "Navy",
  "Washington and Lee University": "Washington & Lee",
  "University of St. Francis": "St. Francis (IL)",
  "Southeastern Louisiana University": "SE Louisiana",
  "Tennessee Technological University": "Tennessee Tech",
};

function buildLocationLookupKeys(name: string): string[] {
  if (LOCATION_ALIASES[name]) {
    return [LOCATION_ALIASES[name]];
  }

  const keys = new Set<string>();

  const universityOf = name.match(/^University of (.+)$/i)?.[1];
  if (universityOf) {
    keys.add(universityOf);
    keys.add(universityOf.split(",")[0]!.trim());
    keys.add(universityOf.split(" at ")[0]!.trim());
  }

  const stateUniversity = name.match(/^(.+?) State University$/i)?.[1];
  if (stateUniversity) {
    keys.add(`${stateUniversity} State`);
    keys.add(`${stateUniversity} St`);
  }

  const instituteOf = name.match(/^(.+?) Institute of Technology$/i)?.[1];
  if (instituteOf) {
    keys.add(`${instituteOf} Tech`);
  }

  keys.add(name.replace(/ University$/i, ""));
  keys.add(name.replace(/ College$/i, ""));

  return [...keys]
    .map((key) => key.trim())
    .filter((key) => key.length > 0);
}

async function loadEspnLocationIndex(): Promise<Map<string, number>> {
  const response = await fetch(
    "https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams?limit=1000",
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch ESPN teams: HTTP ${response.status}`);
  }

  const payload = (await response.json()) as {
    sports?: {
      leagues?: {
        teams?: { team: Record<string, string> }[];
      }[];
    }[];
  };

  const index = new Map<string, number>();

  for (const entry of payload.sports?.[0]?.leagues?.[0]?.teams ?? []) {
    const team = entry.team;
    if (!team?.id) {
      continue;
    }

    const id = Number(team.id);
    for (const field of [
      team.location,
      team.nickname,
      team.shortDisplayName,
    ]) {
      if (field) {
        index.set(field.trim(), id);
      }
    }
  }

  return index;
}

function resolveEspnId(name: string, index: Map<string, number>): number | undefined {
  for (const key of buildLocationLookupKeys(name)) {
    const id = index.get(key);
    if (id !== undefined) {
      return id;
    }
  }

  return undefined;
}

async function main(): Promise<void> {
  const index = await loadEspnLocationIndex();
  const entries: { name: string; espnId: number }[] = [];
  const missing: string[] = [];

  for (const [name] of NCAA_SCHOOLS) {
    const espnId = resolveEspnId(name, index);
    if (espnId === undefined) {
      missing.push(name);
      continue;
    }
    entries.push({ name, espnId });
  }

  entries.sort((a, b) => a.name.localeCompare(b.name));

  const lines = entries
    .map((entry) => `  ${JSON.stringify(entry.name)}: ${entry.espnId},`)
    .join("\n");

  const output = `/**
 * ESPN NCAA logo IDs keyed by college seed name.
 * Generated by scripts/generate-college-espn-ids.ts
 */
export const COLLEGE_ESPN_LOGO_IDS: Readonly<Record<string, number>> = {
${lines}
} as const;
`;

  const outPath = join(
    process.cwd(),
    "src/persistence/logos/college-espn-ids.ts",
  );
  writeFileSync(outPath, output, "utf8");

  console.info(`Wrote ${entries.length} ESPN logo IDs to ${outPath}`);
  if (missing.length > 0) {
    console.warn(`Missing ESPN IDs for ${missing.length} schools:`);
    for (const name of missing) {
      console.warn(`  - ${name}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
