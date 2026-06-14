export type LocationAction = "create" | "get" | "delete" | "localTime";

export interface LocationCreateInput {
  action: "create";
  /** City name, e.g. "New York" */
  name: string;
  /** Country name, e.g. "United States" */
  country: string;
  latitude: number;
  longitude: number;
  /** IANA timezone for the city/region, e.g. "America/New_York" */
  timezone: string;
  population: number;
}

export interface LocationGetInput {
  action: "get";
  id: string;
}

export interface LocationDeleteInput {
  action: "delete";
  id: string;
}

export interface LocationLocalTimeInput {
  action: "localTime";
  id: string;
  /** Optional UTC ISO datetime; defaults to current world clock time */
  isoUtc?: string;
}

export type LocationInput =
  | LocationCreateInput
  | LocationGetInput
  | LocationDeleteInput
  | LocationLocalTimeInput;

export interface Location {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  population: number;
}

export interface LocalTimeParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  weekday: number;
  weekdayName: string;
}

/** Civil datetime without weekday — used for local scheduling input */
export interface LocalDateTimeInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second?: number;
}

export interface LocationLocalTimeOutput {
  locationId: string;
  locationName: string;
  country: string;
  timezone: string;
  isoUtc: string;
  local: LocalTimeParts;
}

export type LocationOutput =
  | Location
  | Location[]
  | LocationLocalTimeOutput
  | { deleted: true; id: string };
