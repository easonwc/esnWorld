import { downloadSeedMlbLogos } from "../src/persistence/logos/download";
import { MLB_TEAM_SEED_DATA } from "../src/persistence/seed/mlb-teams.data";

async function main() {
  console.info("Downloading MLB team logos to public/logos/mlb/ ...");
  const result = await downloadSeedMlbLogos(
    MLB_TEAM_SEED_DATA.map((team) => team.abbreviation),
  );
  console.info(
    `Done: ${result.downloaded} downloaded, ${result.skipped} skipped, ${result.failed} failed`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
