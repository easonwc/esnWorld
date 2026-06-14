import { downloadLeagueLogo } from "../src/persistence/logos/download";

const LEAGUE_ABBREVIATIONS = ["NFL", "MLB", "NBA", "NHL", "MLS", "WNBA"] as const;

async function main() {
  console.info("Downloading league logos to public/logos/leagues/ ...");

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const abbreviation of LEAGUE_ABBREVIATIONS) {
    try {
      await downloadLeagueLogo(abbreviation, { force: true });
      downloaded += 1;
    } catch {
      failed += 1;
    }
  }

  console.info(
    `Done: ${downloaded} downloaded, ${skipped} skipped, ${failed} failed`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
