export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiOperation {
  id: string;
  tag: string;
  method: HttpMethod;
  path: string;
  summary: string;
  description: string;
  requestBody?: string;
}

export const apiOperations: ApiOperation[] = [
  {
    id: "world-clock-get",
    tag: "World Clock",
    method: "GET",
    path: "/api/world-clock",
    summary: "Get current world time",
    description:
      "Returns the current UTC world clock time. Re-execute after starting the clock to see elapsed simulated time (1 simulated minute per real second by default).",
  },
  {
    id: "world-clock-set",
    tag: "World Clock",
    method: "POST",
    path: "/api/world-clock",
    summary: "Set world time",
    description: "Sets the world clock to a specific UTC datetime.",
    requestBody: JSON.stringify(
      { action: "set", isoUtc: "2020-01-01T12:00:00.000Z" },
      null,
      2,
    ),
  },
  {
    id: "world-clock-advance",
    tag: "World Clock",
    method: "POST",
    path: "/api/world-clock",
    summary: "Advance world time",
    description:
      "Advances the world clock forward by a positive number of simulated milliseconds.",
    requestBody: JSON.stringify({ action: "advance", milliseconds: 60000 }, null, 2),
  },
  {
    id: "world-clock-start",
    tag: "World Clock",
    method: "POST",
    path: "/api/world-clock/start",
    summary: "Start the world clock",
    description:
      "Starts automatic time advancement using WORLD_CLOCK_SIMULATED_MS_PER_REAL_MS from the environment.",
  },
  {
    id: "world-clock-stop",
    tag: "World Clock",
    method: "POST",
    path: "/api/world-clock/stop",
    summary: "Stop the world clock",
    description: "Stops automatic advancement and freezes time at the current value.",
  },
  {
    id: "calendar-get",
    tag: "Calendar",
    method: "GET",
    path: "/api/calendar",
    summary: "Get current calendar date",
    description:
      "Returns the US calendar date for the current world clock time, including weekday and day-of-year.",
  },
  {
    id: "calendar-from-iso",
    tag: "Calendar",
    method: "POST",
    path: "/api/calendar",
    summary: "Calendar from ISO UTC",
    description: "Converts a UTC ISO 8601 datetime into US calendar fields.",
    requestBody: JSON.stringify(
      { action: "fromIso", isoUtc: "2020-06-14T12:00:00.000Z" },
      null,
      2,
    ),
  },
  {
    id: "calendar-from-date",
    tag: "Calendar",
    method: "POST",
    path: "/api/calendar",
    summary: "Calendar from date",
    description:
      "Converts year, month, and day into US calendar fields. Optional time components default to midnight.",
    requestBody: JSON.stringify(
      { action: "fromDate", year: 2020, month: 6, day: 14 },
      null,
      2,
    ),
  },
  {
    id: "locations-list",
    tag: "Locations",
    method: "GET",
    path: "/api/locations",
    summary: "List all locations",
    description: "Returns all city locations sorted by name.",
  },
  {
    id: "locations-create",
    tag: "Locations",
    method: "POST",
    path: "/api/locations",
    summary: "Create a location",
    description:
      "Creates a city-level location with name, country, population, coordinates, and IANA timezone.",
    requestBody: JSON.stringify(
      {
        action: "create",
        name: "New York",
        country: "United States",
        latitude: 40.7128,
        longitude: -74.006,
        timezone: "America/New_York",
        population: 8336817,
      },
      null,
      2,
    ),
  },
  {
    id: "locations-get",
    tag: "Locations",
    method: "POST",
    path: "/api/locations",
    summary: "Get a location",
    description: "Retrieves a single city location by id.",
    requestBody: JSON.stringify(
      { action: "get", id: "paste-location-id-here" },
      null,
      2,
    ),
  },
  {
    id: "locations-local-time",
    tag: "Locations",
    method: "POST",
    path: "/api/locations",
    summary: "Get local time in city",
    description:
      "Returns the local datetime for a city. Uses the world clock by default, or an optional isoUtc.",
    requestBody: JSON.stringify(
      {
        action: "localTime",
        id: "paste-location-id-here",
        isoUtc: "2020-06-14T16:00:00.000Z",
      },
      null,
      2,
    ),
  },
  {
    id: "locations-delete",
    tag: "Locations",
    method: "POST",
    path: "/api/locations",
    summary: "Delete a location",
    description:
      "Removes a city location by id. Fails if venues still exist in that location.",
    requestBody: JSON.stringify(
      { action: "delete", id: "paste-location-id-here" },
      null,
      2,
    ),
  },
  {
    id: "venues-list",
    tag: "Venues",
    method: "GET",
    path: "/api/venues",
    summary: "List all venues",
    description: "Returns all venues sorted by name.",
  },
  {
    id: "venues-create",
    tag: "Venues",
    method: "POST",
    path: "/api/venues",
    summary: "Create a venue",
    description:
      "Creates a venue within a location (e.g. stadium, golf course). Requires a valid locationId.",
    requestBody: JSON.stringify(
      {
        action: "create",
        locationId: "paste-location-id-here",
        name: "Madison Square Garden",
        latitude: 40.7505,
        longitude: -73.9934,
      },
      null,
      2,
    ),
  },
  {
    id: "venues-list-by-location",
    tag: "Venues",
    method: "POST",
    path: "/api/venues",
    summary: "List venues in a location",
    description: "Returns all venues within a given city location.",
    requestBody: JSON.stringify(
      { action: "listByLocation", locationId: "paste-location-id-here" },
      null,
      2,
    ),
  },
  {
    id: "venues-get",
    tag: "Venues",
    method: "POST",
    path: "/api/venues",
    summary: "Get a venue",
    description: "Retrieves a single venue by id.",
    requestBody: JSON.stringify(
      { action: "get", id: "paste-venue-id-here" },
      null,
      2,
    ),
  },
  {
    id: "venues-local-time",
    tag: "Venues",
    method: "POST",
    path: "/api/venues",
    summary: "Get local time at venue",
    description:
      "Returns local datetime at a venue using its parent location timezone.",
    requestBody: JSON.stringify(
      {
        action: "localTime",
        id: "paste-venue-id-here",
        isoUtc: "2020-06-14T16:00:00.000Z",
      },
      null,
      2,
    ),
  },
  {
    id: "venues-delete",
    tag: "Venues",
    method: "POST",
    path: "/api/venues",
    summary: "Delete a venue",
    description: "Removes a venue by id.",
    requestBody: JSON.stringify(
      { action: "delete", id: "paste-venue-id-here" },
      null,
      2,
    ),
  },
  {
    id: "events-list",
    tag: "Events",
    method: "GET",
    path: "/api/events",
    summary: "List all events",
    description:
      "Returns all events with status computed from the current world clock time.",
  },
  {
    id: "events-create",
    tag: "Events",
    method: "POST",
    path: "/api/events",
    summary: "Create an event",
    description:
      "Schedules an event at a venue-local start time. Duration is in minutes. Multiple events can run in parallel.",
    requestBody: JSON.stringify(
      {
        action: "create",
        name: "Championship Final",
        venueId: "paste-venue-id-here",
        localStart: {
          year: 2020,
          month: 6,
          day: 14,
          hour: 12,
          minute: 0,
        },
        durationMinutes: 120,
      },
      null,
      2,
    ),
  },
  {
    id: "events-get",
    tag: "Events",
    method: "POST",
    path: "/api/events",
    summary: "Get an event",
    description: "Retrieves a single event by id with current status.",
    requestBody: JSON.stringify(
      { action: "get", id: "paste-event-id-here" },
      null,
      2,
    ),
  },
  {
    id: "events-list-by-venue",
    tag: "Events",
    method: "POST",
    path: "/api/events",
    summary: "List events by venue",
    description: "Returns all events scheduled at a specific venue.",
    requestBody: JSON.stringify(
      { action: "listByVenue", venueId: "paste-venue-id-here" },
      null,
      2,
    ),
  },
  {
    id: "events-list-active",
    tag: "Events",
    method: "POST",
    path: "/api/events",
    summary: "List active events",
    description:
      "Returns events currently in progress based on the world clock. Supports parallel active events.",
    requestBody: JSON.stringify({ action: "listActive" }, null, 2),
  },
  {
    id: "events-list-at-time",
    tag: "Events",
    method: "POST",
    path: "/api/events",
    summary: "List active events at a specific time",
    description:
      "Returns events in progress at a given UTC time. Uses world clock if isoUtc is omitted.",
    requestBody: JSON.stringify(
      {
        action: "listAtTime",
        isoUtc: "2020-06-14T17:00:00.000Z",
      },
      null,
      2,
    ),
  },
  {
    id: "events-delete",
    tag: "Events",
    method: "POST",
    path: "/api/events",
    summary: "Delete an event",
    description: "Removes an event by id.",
    requestBody: JSON.stringify(
      { action: "delete", id: "paste-event-id-here" },
      null,
      2,
    ),
  },
];

export function buildOpenApiSpec() {
  const paths: Record<string, Record<string, unknown>> = {};

  for (const op of apiOperations) {
    const pathKey = op.path;
    const methodKey = op.method.toLowerCase();

    if (!paths[pathKey]) {
      paths[pathKey] = {};
    }

    const operation: Record<string, unknown> = {
      tags: [op.tag],
      summary: op.summary,
      description: op.description,
      responses: {
        "200": {
          description: "Successful response",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { type: "object" },
                },
              },
            },
          },
        },
        "400": { description: "Invalid request" },
        "404": { description: "Resource not found" },
        "409": { description: "Clock state conflict (start/stop)" },
      },
    };

    if (op.requestBody) {
      operation.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: { type: "object" },
            example: JSON.parse(op.requestBody),
          },
        },
      };
    }

    paths[pathKey][methodKey] = operation;
  }

  return {
    openapi: "3.0.3",
    info: {
      title: "ESN World Engine API",
      version: "0.1.0",
      description:
        "API for the ESN World Engine. The world clock is the canonical UTC time source.",
    },
    tags: [
      {
        name: "World Clock",
        description: "UTC world clock with configurable simulated tick rate.",
      },
      {
        name: "Calendar",
        description: "US Gregorian calendar derived from UTC world time.",
      },
      {
        name: "Locations",
        description: "Cities with country, coordinates, and timezone.",
      },
      {
        name: "Venues",
        description: "Venues within a location, such as stadiums or golf courses.",
      },
      {
        name: "Events",
        description:
          "Scheduled events at venue-local times with parallel active event support.",
      },
    ],
    paths,
  };
}
