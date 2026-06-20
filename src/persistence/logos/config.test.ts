import { describe, expect, it } from "vitest";
import {
  getGolfTourLogoExtension,
  getGolfTourLogoPublicPath,
  getNhlLogoCdnAbbreviation,
} from "./config";

describe("NHL logo CDN aliases", () => {
  it("maps team abbreviations to ESPN filenames", () => {
    expect(getNhlLogoCdnAbbreviation("LAK")).toBe("LA");
    expect(getNhlLogoCdnAbbreviation("SJS")).toBe("SJ");
    expect(getNhlLogoCdnAbbreviation("TBL")).toBe("TB");
    expect(getNhlLogoCdnAbbreviation("BOS")).toBe("BOS");
  });
});

describe("golf tour logo paths", () => {
  it("maps PGA to the wikimedia SVG public path", () => {
    expect(getGolfTourLogoExtension("PGA")).toBe("svg");
    expect(getGolfTourLogoPublicPath("PGA")).toBe("/logos/golf-tours/pga.svg");
  });
});
