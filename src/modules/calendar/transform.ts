import { CalendarError, CalendarErrorCodes } from "./errors";
import type {
  CalendarInput,
  CalendarOutput,
  CalendarUtcParts,
} from "./types";

const ISO_UTC_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getDaysInMonth(year: number, month: number): number {
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  return DAYS_IN_MONTH[month - 1];
}

export function getDayOfYear(year: number, month: number, day: number): number {
  let total = day;

  for (let m = 1; m < month; m++) {
    total += getDaysInMonth(year, m);
  }

  return total;
}

function validateYear(year: unknown): number {
  if (typeof year !== "number" || !Number.isInteger(year)) {
    throw new CalendarError(
      CalendarErrorCodes.INVALID_YEAR,
      "year must be an integer",
    );
  }

  if (year < 1 || year > 9999) {
    throw new CalendarError(
      CalendarErrorCodes.INVALID_YEAR,
      "year must be between 1 and 9999",
    );
  }

  return year;
}

function validateMonth(month: unknown): number {
  if (typeof month !== "number" || !Number.isInteger(month)) {
    throw new CalendarError(
      CalendarErrorCodes.INVALID_MONTH,
      "month must be an integer",
    );
  }

  if (month < 1 || month > 12) {
    throw new CalendarError(
      CalendarErrorCodes.INVALID_MONTH,
      "month must be between 1 and 12",
    );
  }

  return month;
}

function validateDay(year: number, month: number, day: unknown): number {
  if (typeof day !== "number" || !Number.isInteger(day)) {
    throw new CalendarError(
      CalendarErrorCodes.INVALID_DAY,
      "day must be an integer",
    );
  }

  const maxDay = getDaysInMonth(year, month);

  if (day < 1 || day > maxDay) {
    throw new CalendarError(
      CalendarErrorCodes.INVALID_DAY,
      `day must be between 1 and ${maxDay} for ${year}-${String(month).padStart(2, "0")}`,
    );
  }

  return day;
}

function validateTimePart(
  value: unknown,
  name: string,
  min: number,
  max: number,
): number {
  if (value === undefined) {
    return 0;
  }

  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new CalendarError(
      CalendarErrorCodes.INVALID_TIME,
      `${name} must be an integer`,
    );
  }

  if (value < min || value > max) {
    throw new CalendarError(
      CalendarErrorCodes.INVALID_TIME,
      `${name} must be between ${min} and ${max}`,
    );
  }

  return value;
}

function parseIsoUtc(isoUtc: string): CalendarUtcParts {
  if (!isoUtc) {
    throw new CalendarError(
      CalendarErrorCodes.MISSING_ISO_UTC,
      "isoUtc is required for fromIso action",
    );
  }

  if (!ISO_UTC_PATTERN.test(isoUtc)) {
    throw new CalendarError(
      CalendarErrorCodes.INVALID_ISO_UTC,
      `isoUtc must be a valid UTC ISO 8601 string ending with Z, received: ${isoUtc}`,
    );
  }

  const epochMs = Date.parse(isoUtc);

  if (Number.isNaN(epochMs)) {
    throw new CalendarError(
      CalendarErrorCodes.INVALID_ISO_UTC,
      `isoUtc could not be parsed as a valid datetime: ${isoUtc}`,
    );
  }

  const date = new Date(epochMs);

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
    second: date.getUTCSeconds(),
    millisecond: date.getUTCMilliseconds(),
  };
}

function toUtcParts(input: CalendarInput): CalendarUtcParts {
  switch (input.action) {
    case "fromIso":
      return parseIsoUtc(input.isoUtc);

    case "fromDate": {
      const year = validateYear(input.year);
      const month = validateMonth(input.month);
      const day = validateDay(year, month, input.day);

      return {
        year,
        month,
        day,
        hour: validateTimePart(input.hour, "hour", 0, 23),
        minute: validateTimePart(input.minute, "minute", 0, 59),
        second: validateTimePart(input.second, "second", 0, 59),
        millisecond: validateTimePart(input.millisecond, "millisecond", 0, 999),
      };
    }

    default: {
      const unknownAction = (input as { action: string }).action;
      throw new CalendarError(
        CalendarErrorCodes.INVALID_ACTION,
        `Unknown action: ${unknownAction}`,
      );
    }
  }
}

export function transformCalendar(input: CalendarInput): CalendarOutput {
  const utc = toUtcParts(input);
  const leapYear = isLeapYear(utc.year);
  const daysInMonth = getDaysInMonth(utc.year, utc.month);
  const daysInYear = leapYear ? 366 : 365;
  const dayOfYear = getDayOfYear(utc.year, utc.month, utc.day);
  const weekday = new Date(
    Date.UTC(utc.year, utc.month - 1, utc.day),
  ).getUTCDay();

  const epochMs = Date.UTC(
    utc.year,
    utc.month - 1,
    utc.day,
    utc.hour,
    utc.minute,
    utc.second,
    utc.millisecond,
  );

  return {
    year: utc.year,
    month: utc.month,
    day: utc.day,
    monthName: MONTH_NAMES[utc.month - 1],
    weekday,
    weekdayName: WEEKDAY_NAMES[weekday],
    dayOfYear,
    isLeapYear: leapYear,
    daysInMonth,
    daysInYear,
    hour: utc.hour,
    minute: utc.minute,
    second: utc.second,
    millisecond: utc.millisecond,
    isoUtc: new Date(epochMs).toISOString(),
  };
}

export function transformCalendarFromUtc(utc: CalendarUtcParts): CalendarOutput {
  return transformCalendar({ action: "fromDate", ...utc });
}
