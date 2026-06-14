import { describe, expect, it, beforeEach } from "vitest";
import { resetConferenceStore } from "@/modules/conferences";
import { resetDivisionStore } from "@/modules/divisions";
import {
  LeagueErrorCodes,
  LeagueStore,
  buildLeague,
  executeLeague,
  resetLeagueStore,
  validateAbbreviation,
} from "@/modules/leagues";
import { resetTeamStore } from "@/modules/teams";
import {
  MemoryConferenceRepository,
  MemoryDivisionRepository,
  MemoryLeagueRepository,
  MemoryTeamRepository,
} from "@/persistence/repositories";

describe("leagues validation", () => {
  it("accepts valid abbreviations", () => {
    expect(validateAbbreviation("nfl")).toBe("NFL");
    expect(validateAbbreviation("MLS")).toBe("MLS");
  });

  it("rejects invalid abbreviations", () => {
    expect(() => validateAbbreviation("A")).toThrowError(
      expect.objectContaining({ code: LeagueErrorCodes.INVALID_ABBREVIATION }),
    );
    expect(() => validateAbbreviation("way-too-long-code")).toThrowError(
      expect.objectContaining({ code: LeagueErrorCodes.INVALID_ABBREVIATION }),
    );
  });
});

describe("LeagueStore", () => {
  let store: LeagueStore;

  beforeEach(() => {
    store = resetLeagueStore();
  });

  it("creates and retrieves a league", async () => {
    const created = await store.create({
      name: "National Football League",
      abbreviation: "nfl",
    });

    expect(created.name).toBe("National Football League");
    expect(created.abbreviation).toBe("NFL");

    const fetched = await store.get(created.id);
    expect(fetched).toEqual(created);
  });

  it("looks up leagues by name and abbreviation", async () => {
    await store.create({
      name: "National Basketball Association",
      abbreviation: "NBA",
    });

    expect(await store.getByName("National Basketball Association")).toMatchObject({
      abbreviation: "NBA",
    });
    expect(await store.getByAbbreviation("nba")).toMatchObject({
      name: "National Basketball Association",
    });
  });
});

describe("buildLeague", () => {
  it("trims name and normalizes abbreviation", () => {
    const league = buildLeague(
      {
        name: "  Major League Baseball  ",
        abbreviation: " mlb ",
      },
      "test-id",
    );

    expect(league.name).toBe("Major League Baseball");
    expect(league.abbreviation).toBe("MLB");
    expect(league.logo).toBe("");
  });
});

describe("executeLeague hierarchy actions", () => {
  const leagueRepository = new MemoryLeagueRepository();
  const conferenceRepository = new MemoryConferenceRepository();
  const divisionRepository = new MemoryDivisionRepository();
  const teamRepository = new MemoryTeamRepository();

  beforeEach(async () => {
    await leagueRepository.clear();
    await conferenceRepository.clear();
    await divisionRepository.clear();
    await teamRepository.clear();
    resetLeagueStore(leagueRepository);
    resetConferenceStore(conferenceRepository);
    resetDivisionStore(divisionRepository);
    resetTeamStore(teamRepository);
  });

  it("lists conferences, divisions, and teams within a league", async () => {
    const league = await leagueRepository.create(
      buildLeague({ name: "National Football League", abbreviation: "NFL" }, "league-1"),
    );

    await conferenceRepository.create({
      id: "conf-afc",
      leagueId: league.id,
      leagueName: league.name,
      name: "AFC",
      abbreviation: "AFC",
    });
    await conferenceRepository.create({
      id: "conf-nfc",
      leagueId: league.id,
      leagueName: league.name,
      name: "NFC",
      abbreviation: "NFC",
    });

    await divisionRepository.create({
      id: "div-afce",
      conferenceId: "conf-afc",
      conferenceName: "AFC",
      conferenceAbbreviation: "AFC",
      leagueId: league.id,
      leagueName: league.name,
      name: "AFC East",
      abbreviation: "AFCE",
    });

    await teamRepository.create({
      id: "team-buf",
      divisionId: "div-afce",
      divisionName: "AFC East",
      divisionAbbreviation: "AFCE",
      conferenceId: "conf-afc",
      conferenceName: "AFC",
      conferenceAbbreviation: "AFC",
      leagueId: league.id,
      leagueName: league.name,
      venueId: "venue-1",
      venueName: "Highmark Stadium",
      locationId: "loc-1",
      locationName: "Orchard Park",
      locationRegion: "NY",
      name: "Buffalo Bills",
      abbreviation: "BUF",
      logo: "/logos/nfl/buf.png",
    });

    const conferences = await executeLeague({
      action: "listConferences",
      leagueId: league.id,
    });
    const divisions = await executeLeague({
      action: "listDivisions",
      leagueId: league.id,
    });
    const teams = await executeLeague({
      action: "listTeams",
      leagueId: league.id,
    });

    expect(conferences).toHaveLength(2);
    expect(divisions).toHaveLength(1);
    expect(teams).toHaveLength(1);
    expect(teams[0]?.abbreviation).toBe("BUF");
  });

  it("rejects hierarchy listing for an unknown league", async () => {
    await expect(
      executeLeague({ action: "listTeams", leagueId: "missing-league" }),
    ).rejects.toMatchObject({ code: LeagueErrorCodes.LEAGUE_NOT_FOUND });
  });
});
