import { downloadSeedFlagImages } from "../src/persistence/flags/download";

async function main() {
  console.info("Downloading country flag images to public/flags/ ...");
  const result = await downloadSeedFlagImages();

  console.info(
    `Done: ${result.downloaded} downloaded, ${result.skipped} already present, ${result.failed} failed`,
  );

  if (result.failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
