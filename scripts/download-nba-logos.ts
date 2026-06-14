import { downloadSeedNbaLogos } from "../src/persistence/logos/download";
import { NBA_TEAM_SEED_DATA } from "../src/persistence/seed/nba-teams.data";

async function main() {
  console.info("Downloading NBA team logos to public/logos/nba/ ...");
  const result = await downloadSeedNbaLogos(
    NBA_TEAM_SEED_DATA.map((team) => team.abbreviation),
  );
  console.info(
    `Done: ${result.downloaded} downloaded, ${result.skipped} skipped, ${result.failed} failed`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
