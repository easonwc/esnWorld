export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { seedWorldOnStartup } = await import("@/persistence/seed/locations");
    const { syncCountryFlagImages } = await import(
      "@/persistence/flags/download"
    );
    const { getDefaultCountryRepository } = await import(
      "@/persistence/repositories"
    );

    await seedWorldOnStartup();

    if (process.env.VITEST !== "true") {
      const sync = await syncCountryFlagImages(getDefaultCountryRepository());
      if (sync.downloaded > 0 || sync.updated > 0) {
        console.info(
          `[flags] synced ${sync.downloaded} new images, updated ${sync.updated} country record(s)`,
        );
      }
    }
  }
}
