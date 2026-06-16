/**
 * Venue indoor/outdoor rule for the simulation:
 * - Outdoor-only → isIndoor: false (weather can affect events)
 * - Indoor-only → isIndoor: true
 * - Retractable-roof / hybrid → isIndoor: true (treated as indoor)
 */

export type VenueSchedulingMode = "exclusive" | "multi_resource";

export type VenueResourceType = "court" | "tee_group" | "lane" | "generic";

export type VenueAction =
  | "create"
  | "get"
  | "delete"
  | "listByLocation"
  | "localTime"
  | "createResource"
  | "listResources"
  | "getResource"
  | "deleteResource";

export interface VenueCreateInput {
  action: "create";
  locationId: string;
  name: string;
  latitude: number;
  longitude: number;
  /** Whether the venue is indoors. Retractable-roof venues count as indoor for this simulation. */
  isIndoor: boolean;
  /**
   * exclusive — one booking at a time for the whole venue (default).
   * multi_resource — parallel bookings via venue resources (courts, tee groups).
   */
  schedulingMode?: VenueSchedulingMode;
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

export interface VenueCreateResourceInput {
  action: "createResource";
  venueId: string;
  name: string;
  resourceType?: VenueResourceType;
}

export interface VenueListResourcesInput {
  action: "listResources";
  venueId: string;
}

export interface VenueGetResourceInput {
  action: "getResource";
  id: string;
}

export interface VenueDeleteResourceInput {
  action: "deleteResource";
  id: string;
}

export type VenueInput =
  | VenueCreateInput
  | VenueGetInput
  | VenueDeleteInput
  | VenueListByLocationInput
  | VenueLocalTimeInput
  | VenueCreateResourceInput
  | VenueListResourcesInput
  | VenueGetResourceInput
  | VenueDeleteResourceInput;

export interface Venue {
  id: string;
  locationId: string;
  name: string;
  latitude: number;
  longitude: number;
  isIndoor: boolean;
  schedulingMode: VenueSchedulingMode;
}

export interface VenueResource {
  id: string;
  venueId: string;
  name: string;
  resourceType: VenueResourceType;
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
  | VenueResource
  | VenueResource[]
  | VenueLocalTimeOutput
  | { deleted: true; id: string };
