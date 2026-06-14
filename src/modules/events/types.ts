export type EventAction =
  | "create"
  | "get"
  | "delete"
  | "listByVenue"
  | "listActive"
  | "listAtTime";

export type EventStatus = "upcoming" | "active" | "ended";

export interface EventLocalStartInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second?: number;
}

export interface EventCreateInput {
  action: "create";
  name: string;
  venueId: string;
  /** Start time in the venue's local timezone */
  localStart: EventLocalStartInput;
  durationMinutes: number;
}

export interface EventGetInput {
  action: "get";
  id: string;
}

export interface EventDeleteInput {
  action: "delete";
  id: string;
}

export interface EventListByVenueInput {
  action: "listByVenue";
  venueId: string;
}

export interface EventListActiveInput {
  action: "listActive";
}

export interface EventListAtTimeInput {
  action: "listAtTime";
  /** Optional UTC ISO datetime; defaults to current world clock time */
  isoUtc?: string;
}

export type EventInput =
  | EventCreateInput
  | EventGetInput
  | EventDeleteInput
  | EventListByVenueInput
  | EventListActiveInput
  | EventListAtTimeInput;

export interface EventRecord {
  id: string;
  name: string;
  venueId: string;
  isoUtcStart: string;
  durationMinutes: number;
  isoUtcEnd: string;
  localStart: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
  };
}

export interface EventOutput {
  id: string;
  name: string;
  venueId: string;
  venueName: string;
  isIndoor: boolean;
  weatherApplies: boolean;
  locationId: string;
  locationName: string;
  country: string;
  timezone: string;
  localStart: EventRecord["localStart"];
  isoUtcStart: string;
  durationMinutes: number;
  isoUtcEnd: string;
  status: EventStatus;
}

export type EventsOutput =
  | EventOutput
  | EventOutput[]
  | { deleted: true; id: string };
