import { downloadSeedNhlLogos } from "../src/persistence/logos/download";
import { NHL_TEAM_SEED_DATA } from "../src/persistence/seed/nhl-teams.data";

async function main() {
  console.info("Downloading NHL team logos to public/logos/nhl/ ...");
  const result = await downloadSeedNhlLogos(
    NHL_TEAM_SEED_DATA.map((team) => team.abbreviation),
  );
  console.info(
    `Done: ${result.downloaded} downloaded, ${result.skipped} skipped, ${result.failed} failed`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
