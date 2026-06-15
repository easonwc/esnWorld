import { resetLocationStore, LocationStore } from "@/modules/locations";
import { resetCollegeStore, CollegeStore } from "@/modules/colleges";
import { resetCountryStore } from "@/modules/countries";
import { describe, expect, it, beforeEach } from "vitest";
import {
  CollegeErrorCodes,
  buildCollege,
  validateAttendance,
} from "@/modules/colleges";
import { seedUnitedStatesCountry } from "@/test/world-fixtures";

describe("colleges validation", () => {
  it("accepts valid attendance", () => {
    expect(validateAttendance(15000)).toBe(15000);
  });

  it("rejects invalid attendance", () => {
    expect(() => validateAttendance(-1)).toThrowError(
      expect.objectContaining({ code: CollegeErrorCodes.INVALID_ATTENDANCE }),
    );
  });
});

describe("CollegeStore", () => {
  let collegeStore: CollegeStore;
  let locationStore: LocationStore;
  let countryId: string;

  beforeEach(async () => {
    resetCountryStore();
    resetLocationStore();
    resetCollegeStore();
    collegeStore = resetCollegeStore();
    locationStore = resetLocationStore();
    countryId = (await seedUnitedStatesCountry()).id;
  });

  it("creates and retrieves a college", async () => {
    const location = await locationStore.create({
      name: "Ann Arbor",
      countryId,
      region: "Michigan",
      latitude: 42.2808,
      longitude: -83.743,
      timezone: "America/Detroit",
      population: 123_000,
    });

    const created = await collegeStore.create({
      name: "University of Michigan",
      locationId: location.id,
      attendance: 52000,
    });

    expect(created.name).toBe("University of Michigan");
    expect(created.locationId).toBe(location.id);
    expect(created.locationName).toBe("Ann Arbor");
    expect(created.locationRegion).toBe("Michigan");
    expect(created.attendance).toBe(52000);

    const fetched = await collegeStore.get(created.id);
    expect(fetched).toEqual(created);
  });

  it("lists colleges by location", async () => {
    const location = await locationStore.create({
      name: "Los Angeles",
      countryId,
      region: "California",
      latitude: 34.0522,
      longitude: -118.2437,
      timezone: "America/Los_Angeles",
      population: 4_000_000,
    });

    await collegeStore.create({
      name: "University of Southern California",
      locationId: location.id,
      attendance: 48000,
    });
    await collegeStore.create({
      name: "University of California, Los Angeles",
      locationId: location.id,
      attendance: 46000,
    });

    const list = await collegeStore.listByLocation(location.id);
    expect(list).toHaveLength(2);
  });
});

describe("buildCollege", () => {
  it("trims name and preserves location metadata", () => {
    const college = buildCollege(
      {
        name: "  Duke University  ",
        locationId: "location-id",
        attendance: 17000,
      },
      "test-id",
      " Durham ",
      "North Carolina",
    );

    expect(college.name).toBe("Duke University");
    expect(college.locationName).toBe("Durham");
    expect(college.locationRegion).toBe("North Carolina");
    expect(college.logo).toBe("");
  });

  it("accepts an optional logo path", () => {
    const college = buildCollege(
      {
        name: "Duke University",
        locationId: "location-id",
        attendance: 17000,
      },
      "test-id",
      "Durham",
      "North Carolina",
      "/logos/ncaa/150.png",
    );

    expect(college.logo).toBe("/logos/ncaa/150.png");
  });
});
