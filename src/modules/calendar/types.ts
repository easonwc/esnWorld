export type CalendarAction = "fromIso" | "fromDate";

export interface CalendarFromIsoInput {
  action: "fromIso";
  /** ISO 8601 UTC datetime, e.g. "2020-06-14T12:00:00.000Z" */
  isoUtc: string;
}

export interface CalendarFromDateInput {
  action: "fromDate";
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  second?: number;
  millisecond?: number;
}

export type CalendarInput = CalendarFromIsoInput | CalendarFromDateInput;

export interface CalendarUtcParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}

export interface CalendarOutput {
  year: number;
  month: number;
  day: number;
  monthName: string;
  weekday: number;
  weekdayName: string;
  dayOfYear: number;
  isLeapYear: boolean;
  daysInMonth: number;
  daysInYear: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
  isoUtc: string;
}
