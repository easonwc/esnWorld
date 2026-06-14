import { describe, expect, it, beforeEach } from "vitest";
import {
  LeagueErrorCodes,
  LeagueStore,
  buildLeague,
  resetLeagueStore,
  validateAbbreviation,
} from "@/modules/leagues";

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
