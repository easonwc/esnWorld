export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { seedWorldOnStartup } = await import("@/persistence/seed/locations");
    const { seedNflOnStartup } = await import("@/persistence/seed/nfl");
    const { seedMlbOnStartup } = await import("@/persistence/seed/mlb");
    const { seedNbaOnStartup } = await import("@/persistence/seed/nba");
    const { seedNhlOnStartup } = await import("@/persistence/seed/nhl");
    const { seedMlsOnStartup } = await import("@/persistence/seed/mls");
    const { seedWnbaOnStartup } = await import("@/persistence/seed/wnba");
    const { seedTennisVenuesOnStartup } = await import(
      "@/persistence/seed/tennis-venues"
    );
    const { seedGolfVenuesOnStartup } = await import("@/persistence/seed/golf-venues");
    const { seedPgaTourOnStartup } = await import("@/persistence/seed/pga-tour");
    const { seedLpgaTourOnStartup } = await import("@/persistence/seed/lpga-tour");
    const { seedDpWorldTourOnStartup } = await import(
      "@/persistence/seed/dp-world-tour"
    );
    const { seedAtpTourOnStartup } = await import("@/persistence/seed/atp-tour");
    const { seedWtaTourOnStartup } = await import("@/persistence/seed/wta-tour");
    const { seedGolfersOnStartup } = await import("@/persistence/seed/golfers");
    const { seedPgaTourMembershipsOnStartup } = await import(
      "@/persistence/seed/pga-tour-memberships"
    );
    const { seedOwgrOnStartup } = await import("@/persistence/seed/owgr-seed");
    const { seedTennisPlayersOnStartup } = await import(
      "@/persistence/seed/tennis-players"
    );
    const { registerGolfClockHandlers } = await import("@/modules/golf");
    const { registerTennisClockHandlers } = await import("@/modules/tennis");
    const { syncCountryFlagImages } = await import(
      "@/persistence/flags/download"
    );
    const {
      syncCollegeLogos,
      syncGolfTourLogo,
      syncLeagueEntityLogo,
      syncMlbTeamLogos,
      syncMlsTeamLogos,
      syncNbaTeamLogos,
      syncNflTeamLogos,
      syncNhlTeamLogos,
      syncTennisTourLogo,
      syncWnbaTeamLogos,
    } = await import("@/persistence/logos/download");
    const {
      getDefaultCollegeRepository,
      getDefaultCountryRepository,
      getDefaultGolfTourRepository,
      getDefaultLeagueRepository,
      getDefaultTeamRepository,
      getDefaultTennisTourRepository,
    } = await import("@/persistence/repositories");

    registerGolfClockHandlers();
    registerTennisClockHandlers();

    await seedWorldOnStartup();
    const [nflSeed, mlbSeed, nbaSeed, nhlSeed, mlsSeed, wnbaSeed] =
      await Promise.all([
        seedNflOnStartup(),
        seedMlbOnStartup(),
        seedNbaOnStartup(),
        seedNhlOnStartup(),
        seedMlsOnStartup(),
        seedWnbaOnStartup(),
      ]);
    const tennisVenueSeed = await seedTennisVenuesOnStartup();
    const golfVenueSeed = await seedGolfVenuesOnStartup();
    const pgaTourSeed = await seedPgaTourOnStartup();
    const lpgaTourSeed = await seedLpgaTourOnStartup();
    const dpWorldTourSeed = await seedDpWorldTourOnStartup();
    const atpTourSeed = await seedAtpTourOnStartup();
    const wtaTourSeed = await seedWtaTourOnStartup();
    const golfersSeed = await seedGolfersOnStartup();
    const pgaMembershipSeed = await seedPgaTourMembershipsOnStartup();
    const owgrSeed = await seedOwgrOnStartup();
    const tennisPlayersSeed = await seedTennisPlayersOnStartup();
    const golfTourRepository = getDefaultGolfTourRepository();
    const tennisTourRepository = getDefaultTennisTourRepository();

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

    if (tennisVenueSeed?.enabled) {
      console.info(
        `[tennis venues seed] ${tennisVenueSeed.venuesAdded} venues added, ${tennisVenueSeed.venuesSkipped} venues skipped, ${tennisVenueSeed.resourcesAdded} resources added, ${tennisVenueSeed.resourcesSkipped} resources skipped${tennisVenueSeed.venuesMissingLocation > 0 ? `, ${tennisVenueSeed.venuesMissingLocation} venues missing host cities (enable LOCATIONS_SEED_ON_STARTUP)` : ""}`,
      );
    }

    if (golfVenueSeed?.enabled) {
      console.info(
        `[golf venues seed] ${golfVenueSeed.venuesAdded} venues added, ${golfVenueSeed.venuesSkipped} venues skipped, ${golfVenueSeed.resourcesAdded} resources added, ${golfVenueSeed.resourcesSkipped} resources skipped${golfVenueSeed.venuesMissingLocation > 0 ? `, ${golfVenueSeed.venuesMissingLocation} venues missing host cities (enable LOCATIONS_SEED_ON_STARTUP)` : ""}`,
      );
    }

    if (pgaTourSeed?.enabled) {
      console.info(
        `[pga tour seed] tour ${pgaTourSeed.tourAdded ? "created" : "exists"}, ${pgaTourSeed.tournamentsAdded} tournaments added, ${pgaTourSeed.tournamentsSkipped} skipped, ${pgaTourSeed.venueLinksAdded} venue links${pgaTourSeed.tournamentsMissingVenue > 0 ? `, ${pgaTourSeed.tournamentsMissingVenue} tournaments missing venues` : ""}`,
      );
    }

    if (lpgaTourSeed?.enabled) {
      console.info(
        `[lpga tour seed] tour ${lpgaTourSeed.tourAdded ? "created" : "exists"}, ${lpgaTourSeed.tournamentsAdded} tournaments added, ${lpgaTourSeed.tournamentsSkipped} skipped, ${lpgaTourSeed.venueLinksAdded} venue links${lpgaTourSeed.tournamentsMissingVenue > 0 ? `, ${lpgaTourSeed.tournamentsMissingVenue} tournaments missing venues` : ""}`,
      );
    }

    if (dpWorldTourSeed?.enabled) {
      console.info(
        `[dp world tour seed] tour ${dpWorldTourSeed.tourAdded ? "created" : "exists"}, ${dpWorldTourSeed.tournamentsAdded} tournaments added, ${dpWorldTourSeed.tournamentsSkipped} skipped, ${dpWorldTourSeed.venueLinksAdded} venue links${dpWorldTourSeed.tournamentsMissingVenue > 0 ? `, ${dpWorldTourSeed.tournamentsMissingVenue} tournaments missing venues` : ""}`,
      );
    }

    if (atpTourSeed?.enabled) {
      console.info(
        `[atp tour seed] tour ${atpTourSeed.tourAdded ? "created" : "exists"}, ${atpTourSeed.tournamentsAdded} tournaments added, ${atpTourSeed.tournamentsSkipped} skipped, ${atpTourSeed.venueLinksAdded} venue links${atpTourSeed.tournamentsMissingVenue > 0 ? `, ${atpTourSeed.tournamentsMissingVenue} tournaments missing venues` : ""}`,
      );
    }

    if (wtaTourSeed?.enabled) {
      console.info(
        `[wta tour seed] tour ${wtaTourSeed.tourAdded ? "created" : "exists"}, ${wtaTourSeed.tournamentsAdded} tournaments added, ${wtaTourSeed.tournamentsSkipped} skipped, ${wtaTourSeed.venueLinksAdded} venue links${wtaTourSeed.tournamentsMissingVenue > 0 ? `, ${wtaTourSeed.tournamentsMissingVenue} tournaments missing venues` : ""}`,
      );
    }

    if (golfersSeed?.enabled) {
      console.info(
        `[golfers seed] target ${golfersSeed.targetMaleCount} male / ${golfersSeed.targetFemaleCount} female — added ${golfersSeed.golfersAdded} golfer profiles (${golfersSeed.humansAdded} humans)${golfersSeed.missingLocations ? " — skipped, no locations in database (enable LOCATIONS_SEED_ON_STARTUP)" : ""}`,
      );
    }

    if (pgaMembershipSeed?.enabled) {
      console.info(
        `[pga membership seed] season ${pgaMembershipSeed.seasonYear} target ${pgaMembershipSeed.targetMemberCount} — added ${pgaMembershipSeed.membershipsAdded} memberships${pgaMembershipSeed.missingTour ? " — skipped, PGA tour not seeded (enable PGA_TOUR_SEED_ON_STARTUP)" : ""}${pgaMembershipSeed.missingMaleGolfers ? " — skipped, no male golfers (enable GOLFERS_SEED_ON_STARTUP)" : ""}`,
      );
    }

    if (owgrSeed?.enabled) {
      console.info(
        `[owgr seed] as of ${owgrSeed.asOfDate} — ranked ${owgrSeed.maleGolferCount} male golfers (${owgrSeed.rankingsAdded} added)${owgrSeed.missingMaleGolfers ? " — skipped, no male golfers (enable GOLFERS_SEED_ON_STARTUP)" : ""}`,
      );
    }

    if (tennisPlayersSeed?.enabled) {
      console.info(
        `[tennis players seed] target ${tennisPlayersSeed.targetMaleCount} male / ${tennisPlayersSeed.targetFemaleCount} female — added ${tennisPlayersSeed.tennisPlayersAdded} profiles (${tennisPlayersSeed.humansAdded} humans)${tennisPlayersSeed.missingLocations ? " — skipped, no locations in database (enable LOCATIONS_SEED_ON_STARTUP)" : ""}`,
      );
    }

    if (process.env.VITEST !== "true") {
      const pgaLogoSync = await syncGolfTourLogo(golfTourRepository, "PGA");
      if (
        pgaLogoSync.downloaded > 0 ||
        pgaLogoSync.failed > 0 ||
        pgaLogoSync.updated > 0
      ) {
        console.info(
          `[golf tour logos] PGA ${pgaLogoSync.downloaded} downloaded, ${pgaLogoSync.skipped} skipped, ${pgaLogoSync.failed} failed, ${pgaLogoSync.updated} updated`,
        );
      }

      const lpgaLogoSync = await syncGolfTourLogo(golfTourRepository, "LPGA");
      if (
        lpgaLogoSync.downloaded > 0 ||
        lpgaLogoSync.failed > 0 ||
        lpgaLogoSync.updated > 0
      ) {
        console.info(
          `[golf tour logos] LPGA ${lpgaLogoSync.downloaded} downloaded, ${lpgaLogoSync.skipped} skipped, ${lpgaLogoSync.failed} failed, ${lpgaLogoSync.updated} updated`,
        );
      }

      const dpwtLogoSync = await syncGolfTourLogo(golfTourRepository, "DPWT");
      if (
        dpwtLogoSync.downloaded > 0 ||
        dpwtLogoSync.failed > 0 ||
        dpwtLogoSync.updated > 0
      ) {
        console.info(
          `[golf tour logos] DPWT ${dpwtLogoSync.downloaded} downloaded, ${dpwtLogoSync.skipped} skipped, ${dpwtLogoSync.failed} failed, ${dpwtLogoSync.updated} updated`,
        );
      }

      const atpLogoSync = await syncTennisTourLogo(tennisTourRepository, "ATP");
      if (
        atpLogoSync.downloaded > 0 ||
        atpLogoSync.failed > 0 ||
        atpLogoSync.updated > 0
      ) {
        console.info(
          `[tennis tour logos] ATP ${atpLogoSync.downloaded} downloaded, ${atpLogoSync.skipped} skipped, ${atpLogoSync.failed} failed, ${atpLogoSync.updated} updated`,
        );
      }

      const wtaLogoSync = await syncTennisTourLogo(tennisTourRepository, "WTA");
      if (
        wtaLogoSync.downloaded > 0 ||
        wtaLogoSync.failed > 0 ||
        wtaLogoSync.updated > 0
      ) {
        console.info(
          `[tennis tour logos] WTA ${wtaLogoSync.downloaded} downloaded, ${wtaLogoSync.skipped} skipped, ${wtaLogoSync.failed} failed, ${wtaLogoSync.updated} updated`,
        );
      }
    }
  }
}
