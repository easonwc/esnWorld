import { describe, expect, it, beforeEach } from "vitest";
import { localTimeToIsoUtc } from "@/modules/locations";

describe("localTimeToIsoUtc", () => {
  it("converts New York local time to UTC", () => {
    expect(
      localTimeToIsoUtc(
        { year: 2020, month: 6, day: 14, hour: 12, minute: 0 },
        "America/New_York",
      ),
    ).toBe("2020-06-14T16:00:00.000Z");
  });

  it("converts Tokyo local time to UTC", () => {
    expect(
      localTimeToIsoUtc(
        { year: 2020, month: 1, day: 1, hour: 9, minute: 0 },
        "Asia/Tokyo",
      ),
    ).toBe("2020-01-01T00:00:00.000Z");
  });
});
