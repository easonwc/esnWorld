import { downloadSeedWnbaLogos } from "../src/persistence/logos/download";
import { WNBA_TEAM_SEED_DATA } from "../src/persistence/seed/wnba-teams.data";

async function main() {
  console.info("Downloading WNBA team logos to public/logos/wnba/ ...");
  const result = await downloadSeedWnbaLogos(
    WNBA_TEAM_SEED_DATA.map((team) => team.abbreviation),
  );
  console.info(
    `Done: ${result.downloaded} downloaded, ${result.skipped} skipped, ${result.failed} failed`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
