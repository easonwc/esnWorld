export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { seedWorldOnStartup } = await import("@/persistence/seed/locations");
    const { seedNflOnStartup } = await import("@/persistence/seed/nfl");
    const { seedMlbOnStartup } = await import("@/persistence/seed/mlb");
    const { seedNbaOnStartup } = await import("@/persistence/seed/nba");
    const { seedNhlOnStartup } = await import("@/persistence/seed/nhl");
    const { seedMlsOnStartup } = await import("@/persistence/seed/mls");
    const { seedWnbaOnStartup } = await import("@/persistence/seed/wnba");
    const { seedTennisGolfVenuesOnStartup } = await import(
      "@/persistence/seed/tennis-golf-venues"
    );
    const { syncCountryFlagImages } = await import(
      "@/persistence/flags/download"
    );
    const {
      syncCollegeLogos,
      syncLeagueEntityLogo,
      syncMlbTeamLogos,
      syncMlsTeamLogos,
      syncNbaTeamLogos,
      syncNflTeamLogos,
      syncNhlTeamLogos,
      syncWnbaTeamLogos,
    } = await import("@/persistence/logos/download");
    const {
      getDefaultCollegeRepository,
      getDefaultCountryRepository,
      getDefaultLeagueRepository,
      getDefaultTeamRepository,
    } = await import("@/persistence/repositories");

    await seedWorldOnStartup();
    const [nflSeed, mlbSeed, nbaSeed, nhlSeed, mlsSeed, wnbaSeed, tennisGolfVenueSeed] =
      await Promise.all([
        seedNflOnStartup(),
        seedMlbOnStartup(),
        seedNbaOnStartup(),
        seedNhlOnStartup(),
        seedMlsOnStartup(),
        seedWnbaOnStartup(),
        seedTennisGolfVenuesOnStartup(),
      ]);

    if (process.env.VITEST !== "true") {
      const sync = await syncCountryFlagImages(getDefaultCountryRepository());
      if (sync.downloaded > 0 || sync.updated > 0) {
        console.info(
          `[flags] synced ${sync.downloaded} new images, updated ${sync.updated} country record(s)`,
        );
      }

      const collegeLogoSync = await syncCollegeLogos(
        getDefaultCollegeRepository(),
      );
      if (collegeLogoSync.downloaded > 0 || collegeLogoSync.updated > 0) {
        console.info(
          `[college logos] synced ${collegeLogoSync.downloaded} new images, updated ${collegeLogoSync.updated} college record(s)`,
        );
      }

      const leagueRepository = getDefaultLeagueRepository();
      const teamRepository = getDefaultTeamRepository();

      const logoSyncTasks: Promise<void>[] = [];

      if (nflSeed?.enabled) {
        logoSyncTasks.push(
          (async () => {
            const logoSync = await syncNflTeamLogos(teamRepository, leagueRepository);
            if (logoSync.downloaded > 0 || logoSync.updated > 0) {
              console.info(
                `[nfl logos] synced ${logoSync.downloaded} new images, updated ${logoSync.updated} team record(s)`,
              );
            }

            const leagueLogoSync = await syncLeagueEntityLogo(leagueRepository, "NFL");
            if (leagueLogoSync.downloaded > 0 || leagueLogoSync.updated > 0) {
              console.info(
                `[nfl league logo] synced ${leagueLogoSync.downloaded} new image(s), updated ${leagueLogoSync.updated} league record(s)`,
              );
            }
          })(),
        );
      }

      if (mlbSeed?.enabled) {
        logoSyncTasks.push(
          (async () => {
            const logoSync = await syncMlbTeamLogos(teamRepository, leagueRepository);
            if (logoSync.downloaded > 0 || logoSync.updated > 0) {
              console.info(
                `[mlb logos] synced ${logoSync.downloaded} new images, updated ${logoSync.updated} team record(s)`,
              );
            }

            const leagueLogoSync = await syncLeagueEntityLogo(leagueRepository, "MLB");
            if (leagueLogoSync.downloaded > 0 || leagueLogoSync.updated > 0) {
              console.info(
                `[mlb league logo] synced ${leagueLogoSync.downloaded} new image(s), updated ${leagueLogoSync.updated} league record(s)`,
              );
            }
          })(),
        );
      }

      if (nbaSeed?.enabled) {
        logoSyncTasks.push(
          (async () => {
            const logoSync = await syncNbaTeamLogos(teamRepository, leagueRepository);
            if (logoSync.downloaded > 0 || logoSync.updated > 0) {
              console.info(
                `[nba logos] synced ${logoSync.downloaded} new images, updated ${logoSync.updated} team record(s)`,
              );
            }

            const leagueLogoSync = await syncLeagueEntityLogo(leagueRepository, "NBA");
            if (leagueLogoSync.downloaded > 0 || leagueLogoSync.updated > 0) {
              console.info(
                `[nba league logo] synced ${leagueLogoSync.downloaded} new image(s), updated ${leagueLogoSync.updated} league record(s)`,
              );
            }
          })(),
        );
      }

      if (nhlSeed?.enabled) {
        logoSyncTasks.push(
          (async () => {
            const logoSync = await syncNhlTeamLogos(teamRepository, leagueRepository);
            if (logoSync.downloaded > 0 || logoSync.updated > 0 || logoSync.failed > 0) {
              console.info(
                `[nhl logos] synced ${logoSync.downloaded} new images, updated ${logoSync.updated} team record(s)${logoSync.failed > 0 ? `, ${logoSync.failed} failed` : ""}`,
              );
            }

            const leagueLogoSync = await syncLeagueEntityLogo(leagueRepository, "NHL");
            if (leagueLogoSync.downloaded > 0 || leagueLogoSync.updated > 0) {
              console.info(
                `[nhl league logo] synced ${leagueLogoSync.downloaded} new image(s), updated ${leagueLogoSync.updated} league record(s)`,
              );
            }
          })(),
        );
      }

      if (mlsSeed?.enabled) {
        logoSyncTasks.push(
          (async () => {
            const logoSync = await syncMlsTeamLogos(teamRepository, leagueRepository);
            if (logoSync.downloaded > 0 || logoSync.updated > 0) {
              console.info(
                `[mls logos] synced ${logoSync.downloaded} new images, updated ${logoSync.updated} team record(s)`,
              );
            }

            const leagueLogoSync = await syncLeagueEntityLogo(leagueRepository, "MLS");
            if (leagueLogoSync.downloaded > 0 || leagueLogoSync.updated > 0) {
              console.info(
                `[mls league logo] synced ${leagueLogoSync.downloaded} new image(s), updated ${leagueLogoSync.updated} league record(s)`,
              );
            }
          })(),
        );
      }

      if (wnbaSeed?.enabled) {
        logoSyncTasks.push(
          (async () => {
            const logoSync = await syncWnbaTeamLogos(teamRepository, leagueRepository);
            if (logoSync.downloaded > 0 || logoSync.updated > 0) {
              console.info(
                `[wnba logos] synced ${logoSync.downloaded} new images, updated ${logoSync.updated} team record(s)`,
              );
            }

            const leagueLogoSync = await syncLeagueEntityLogo(leagueRepository, "WNBA");
            if (leagueLogoSync.downloaded > 0 || leagueLogoSync.updated > 0) {
              console.info(
                `[wnba league logo] synced ${leagueLogoSync.downloaded} new image(s), updated ${leagueLogoSync.updated} league record(s)`,
              );
            }
          })(),
        );
      }

      await Promise.all(logoSyncTasks);
    }

    if (nflSeed?.enabled) {
      console.info(
        `[nfl seed] league ${nflSeed.leagueAdded ? "created" : "exists"}, ${nflSeed.conferencesAdded} conferences, ${nflSeed.divisionsAdded} divisions, ${nflSeed.venuesAdded} venues, ${nflSeed.teamsAdded} teams added (${nflSeed.teamsSkipped} skipped)`,
      );
    }

    if (mlbSeed?.enabled) {
      console.info(
        `[mlb seed] league ${mlbSeed.leagueAdded ? "created" : "exists"}, ${mlbSeed.conferencesAdded} conferences, ${mlbSeed.divisionsAdded} divisions, ${mlbSeed.venuesAdded} venues, ${mlbSeed.teamsAdded} teams added (${mlbSeed.teamsSkipped} skipped)`,
      );
    }

    if (nbaSeed?.enabled) {
      console.info(
        `[nba seed] league ${nbaSeed.leagueAdded ? "created" : "exists"}, ${nbaSeed.conferencesAdded} conferences, ${nbaSeed.divisionsAdded} divisions, ${nbaSeed.venuesAdded} venues, ${nbaSeed.teamsAdded} teams added (${nbaSeed.teamsSkipped} skipped)`,
      );
    }

    if (nhlSeed?.enabled) {
      console.info(
        `[nhl seed] league ${nhlSeed.leagueAdded ? "created" : "exists"}, ${nhlSeed.conferencesAdded} conferences, ${nhlSeed.divisionsAdded} divisions, ${nhlSeed.venuesAdded} venues, ${nhlSeed.teamsAdded} teams added (${nhlSeed.teamsSkipped} skipped)`,
      );
    }

    if (mlsSeed?.enabled) {
      console.info(
        `[mls seed] league ${mlsSeed.leagueAdded ? "created" : "exists"}, ${mlsSeed.conferencesAdded} conferences, ${mlsSeed.divisionsAdded} divisions, ${mlsSeed.venuesAdded} venues, ${mlsSeed.teamsAdded} teams added (${mlsSeed.teamsSkipped} skipped)`,
      );
    }

    if (wnbaSeed?.enabled) {
      console.info(
        `[wnba seed] league ${wnbaSeed.leagueAdded ? "created" : "exists"}, ${wnbaSeed.conferencesAdded} conferences, ${wnbaSeed.divisionsAdded} divisions, ${wnbaSeed.venuesAdded} venues, ${wnbaSeed.teamsAdded} teams added (${wnbaSeed.teamsSkipped} skipped)`,
      );
    }

    if (tennisGolfVenueSeed?.enabled) {
      console.info(
        `[tennis/golf venues seed] ${tennisGolfVenueSeed.venuesAdded} venues added, ${tennisGolfVenueSeed.venuesSkipped} venues skipped, ${tennisGolfVenueSeed.resourcesAdded} resources added, ${tennisGolfVenueSeed.resourcesSkipped} resources skipped${tennisGolfVenueSeed.venuesMissingLocation > 0 ? `, ${tennisGolfVenueSeed.venuesMissingLocation} venues missing host cities (enable LOCATIONS_SEED_ON_STARTUP)` : ""}`,
      );
    }
  }
}
