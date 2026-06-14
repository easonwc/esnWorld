/**
 * Venue indoor/outdoor rule for the simulation:
 * - Outdoor-only → isIndoor: false (weather can affect events)
 * - Indoor-only → isIndoor: true
 * - Retractable-roof / hybrid → isIndoor: true (treated as indoor)
 */

export type VenueAction = "create" | "get" | "delete" | "listByLocation" | "localTime";

export interface VenueCreateInput {
  action: "create";
  locationId: string;
  name: string;
  latitude: number;
  longitude: number;
  /** Whether the venue is indoors. Retractable-roof venues count as indoor for this simulation. */
  isIndoor: boolean;
}

export interface VenueGetInput {
  action: "get";
  id: string;
}

export interface VenueDeleteInput {
  action: "delete";
  id: string;
}

export interface VenueListByLocationInput {
  action: "listByLocation";
  locationId: string;
}

export interface VenueLocalTimeInput {
  action: "localTime";
  id: string;
  isoUtc?: string;
}

export type VenueInput =
  | VenueCreateInput
  | VenueGetInput
  | VenueDeleteInput
  | VenueListByLocationInput
  | VenueLocalTimeInput;

export interface Venue {
  id: string;
  locationId: string;
  name: string;
  latitude: number;
  longitude: number;
  isIndoor: boolean;
}

import type { LocalTimeParts } from "@/modules/locations";

export interface VenueLocalTimeOutput {
  venueId: string;
  venueName: string;
  locationId: string;
  locationName: string;
  country: string;
  timezone: string;
  isoUtc: string;
  local: LocalTimeParts;
}

export type VenueOutput =
  | Venue
  | Venue[]
  | VenueLocalTimeOutput
  | { deleted: true; id: string };
