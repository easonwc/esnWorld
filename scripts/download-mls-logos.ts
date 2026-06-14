import { downloadSeedMlsLogos } from "../src/persistence/logos/download";
import { MLS_TEAM_SEED_DATA } from "../src/persistence/seed/mls-teams.data";

async function main() {
  console.info("Downloading MLS team logos to public/logos/mls/ ...");
  const result = await downloadSeedMlsLogos(
    MLS_TEAM_SEED_DATA.map((team) => team.abbreviation),
  );
  console.info(
    `Done: ${result.downloaded} downloaded, ${result.skipped} skipped, ${result.failed} failed`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
