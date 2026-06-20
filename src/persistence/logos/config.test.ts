import { describe, expect, it } from "vitest";
import {
  getGolfTourLogoExtension,
  getGolfTourLogoPublicPath,
  getNhlLogoCdnAbbreviation,
  getTennisTourLogoExtension,
  getTennisTourLogoPublicPath,
} from "./config";

describe("NHL logo CDN aliases", () => {
  it("maps team abbreviations to ESPN filenames", () => {
    expect(getNhlLogoCdnAbbreviation("LAK")).toBe("LA");
    expect(getNhlLogoCdnAbbreviation("SJS")).toBe("SJ");
    expect(getNhlLogoCdnAbbreviation("TBL")).toBe("TB");
    expect(getNhlLogoCdnAbbreviation("BOS")).toBe("BOS");
  });
});

describe("tennis tour logo paths", () => {
  it("maps ATP to the SVG public path", () => {
    expect(getTennisTourLogoExtension("ATP")).toBe("svg");
    expect(getTennisTourLogoPublicPath("ATP")).toBe("/logos/tennis-tours/atp.svg");
  });

  it("maps WTA to the PNG public path", () => {
    expect(getTennisTourLogoExtension("WTA")).toBe("png");
    expect(getTennisTourLogoPublicPath("WTA")).toBe("/logos/tennis-tours/wta.png");
  });
});

describe("golf tour logo paths", () => {
  it("maps PGA to the wikimedia SVG public path", () => {
    expect(getGolfTourLogoExtension("PGA")).toBe("svg");
    expect(getGolfTourLogoPublicPath("PGA")).toBe("/logos/golf-tours/pga.svg");
  });

  it("maps LPGA to the SVG public path", () => {
    expect(getGolfTourLogoExtension("LPGA")).toBe("svg");
    expect(getGolfTourLogoPublicPath("LPGA")).toBe("/logos/golf-tours/lpga.svg");
  });

  it("maps DPWT to the SVG public path", () => {
    expect(getGolfTourLogoExtension("DPWT")).toBe("svg");
    expect(getGolfTourLogoPublicPath("DPWT")).toBe("/logos/golf-tours/dpwt.svg");
  });
});
