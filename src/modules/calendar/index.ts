import { getWorldClockService } from "@/modules/world-clock";
import { transformCalendar, transformCalendarFromUtc } from "./transform";
import type { CalendarInput, CalendarOutput } from "./types";

export function getCalendarFromClock(): CalendarOutput {
  const clock = getWorldClockService().getCurrentOutput();
  return transformCalendarFromUtc(clock.utc);
}

export function executeCalendar(input: CalendarInput): CalendarOutput {
  return transformCalendar(input);
}

export * from "./types";
export * from "./errors";
export {
  getDayOfYear,
  getDaysInMonth,
  isLeapYear,
  transformCalendar,
  transformCalendarFromUtc,
} from "./transform";
