import { describe, expect, it } from "vitest";
import { getNhlLogoCdnAbbreviation } from "./config";

describe("NHL logo CDN aliases", () => {
  it("maps team abbreviations to ESPN filenames", () => {
    expect(getNhlLogoCdnAbbreviation("LAK")).toBe("LA");
    expect(getNhlLogoCdnAbbreviation("SJS")).toBe("SJ");
    expect(getNhlLogoCdnAbbreviation("TBL")).toBe("TB");
    expect(getNhlLogoCdnAbbreviation("BOS")).toBe("BOS");
  });
});
