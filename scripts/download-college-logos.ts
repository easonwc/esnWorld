import { downloadSeedCollegeLogos } from "../src/persistence/logos/download";
import { COLLEGE_ESPN_LOGO_IDS } from "../src/persistence/logos/college-espn-ids";

async function main() {
  const espnIds = [...new Set(Object.values(COLLEGE_ESPN_LOGO_IDS))].sort(
    (left, right) => left - right,
  );

  console.info(
    `Downloading ${espnIds.length} NCAA college logos to public/logos/ncaa/ ...`,
  );
  const result = await downloadSeedCollegeLogos(espnIds);
  console.info(
    `Done: ${result.downloaded} downloaded, ${result.skipped} skipped, ${result.failed} failed`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
