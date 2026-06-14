import { downloadSeedNflLogos } from "../src/persistence/logos/download";
import { NFL_TEAM_SEED_DATA } from "../src/persistence/seed/nfl-teams.data";

async function main() {
  console.info("Downloading NFL team logos to public/logos/nfl/ ...");
  const result = await downloadSeedNflLogos(
    NFL_TEAM_SEED_DATA.map((team) => team.abbreviation),
  );
  console.info(
    `Done: ${result.downloaded} downloaded, ${result.skipped} skipped, ${result.failed} failed`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
