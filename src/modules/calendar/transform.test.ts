import { describe, expect, it } from "vitest";
import {
  CalendarError,
  CalendarErrorCodes,
  getDayOfYear,
  getDaysInMonth,
  isLeapYear,
  transformCalendar,
} from "@/modules/calendar";

describe("calendar helpers", () => {
  it("detects leap years", () => {
    expect(isLeapYear(2020)).toBe(true);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(2021)).toBe(false);
  });

  it("returns days in month including February leap day", () => {
    expect(getDaysInMonth(2020, 2)).toBe(29);
    expect(getDaysInMonth(2021, 2)).toBe(28);
    expect(getDaysInMonth(2020, 4)).toBe(30);
  });

  it("computes day of year", () => {
    expect(getDayOfYear(2020, 1, 1)).toBe(1);
    expect(getDayOfYear(2020, 12, 31)).toBe(366);
    expect(getDayOfYear(2021, 3, 1)).toBe(60);
  });
});

describe("calendar transform", () => {
  describe("fromIso", () => {
    it("maps UTC datetime to US calendar fields", () => {
      const result = transformCalendar({
        action: "fromIso",
        isoUtc: "2020-06-14T15:30:45.500Z",
      });

      expect(result).toEqual({
        year: 2020,
        month: 6,
        day: 14,
        monthName: "June",
        weekday: 0,
        weekdayName: "Sunday",
        dayOfYear: 166,
        isLeapYear: true,
        daysInMonth: 30,
        daysInYear: 366,
        hour: 15,
        minute: 30,
        second: 45,
        millisecond: 500,
        isoUtc: "2020-06-14T15:30:45.500Z",
      });
    });

    it("rejects invalid isoUtc", () => {
      expect(() =>
        transformCalendar({ action: "fromIso", isoUtc: "2020-06-14" }),
      ).toThrowError(
        expect.objectContaining({ code: CalendarErrorCodes.INVALID_ISO_UTC }),
      );
    });
  });

  describe("fromDate", () => {
    it("maps civil date with default time at midnight", () => {
      const result = transformCalendar({
        action: "fromDate",
        year: 2020,
        month: 1,
        day: 1,
      });

      expect(result.year).toBe(2020);
      expect(result.monthName).toBe("January");
      expect(result.weekdayName).toBe("Wednesday");
      expect(result.dayOfYear).toBe(1);
      expect(result.hour).toBe(0);
      expect(result.isoUtc).toBe("2020-01-01T00:00:00.000Z");
    });

    it("accepts explicit time components", () => {
      const result = transformCalendar({
        action: "fromDate",
        year: 2020,
        month: 1,
        day: 1,
        hour: 9,
        minute: 15,
        second: 30,
        millisecond: 250,
      });

      expect(result.isoUtc).toBe("2020-01-01T09:15:30.250Z");
    });

    it("rejects invalid civil dates", () => {
      expect(() =>
        transformCalendar({
          action: "fromDate",
          year: 2020,
          month: 2,
          day: 30,
        }),
      ).toThrowError(
        expect.objectContaining({ code: CalendarErrorCodes.INVALID_DAY }),
      );

      expect(() =>
        transformCalendar({
          action: "fromDate",
          year: 2020,
          month: 13,
          day: 1,
        }),
      ).toThrowError(
        expect.objectContaining({ code: CalendarErrorCodes.INVALID_MONTH }),
      );
    });

    it("rejects invalid time components", () => {
      expect(() =>
        transformCalendar({
          action: "fromDate",
          year: 2020,
          month: 1,
          day: 1,
          hour: 24,
        }),
      ).toThrowError(
        expect.objectContaining({ code: CalendarErrorCodes.INVALID_TIME }),
      );
    });
  });
});

describe("calendar errors", () => {
  it("throws CalendarError for unknown actions", () => {
    expect(() =>
      transformCalendar({ action: "invalid" } as never),
    ).toThrow(CalendarError);
  });
});
