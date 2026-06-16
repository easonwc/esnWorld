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
    id: "countries-list",
    tag: "Countries",
    method: "GET",
    path: "/api/countries",
    summary: "List all countries",
    description:
      "Returns all countries sorted by name. Population is the sum of all city populations in that country. Optional query params: limit (default 100, max 500) and offset (default 0). When provided, the response includes pagination metadata.",
  },
  {
    id: "countries-create",
    tag: "Countries",
    method: "POST",
    path: "/api/countries",
    summary: "Create a country",
    description:
      "Creates a country with name, ISO code, and official languages. A local flag SVG is downloaded automatically.",
    requestBody: JSON.stringify(
      {
        action: "create",
        name: "United States",
        isoCode: "US",
        languages: ["English"],
      },
      null,
      2,
    ),
  },
  {
    id: "countries-get",
    tag: "Countries",
    method: "POST",
    path: "/api/countries",
    summary: "Get a country",
    description: "Retrieves a single country by id, including aggregated population.",
    requestBody: JSON.stringify(
      { action: "get", id: "paste-country-id-here" },
      null,
      2,
    ),
  },
  {
    id: "countries-delete",
    tag: "Countries",
    method: "POST",
    path: "/api/countries",
    summary: "Delete a country",
    description:
      "Removes a country by id. Fails if cities still exist in that country.",
    requestBody: JSON.stringify(
      { action: "delete", id: "paste-country-id-here" },
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
    description:
      "Returns all city locations sorted by name. Optional query params: limit (default 100, max 500) and offset (default 0). When provided, the response includes pagination metadata.",
  },
  {
    id: "locations-create",
    tag: "Locations",
    method: "POST",
    path: "/api/locations",
    summary: "Create a location",
    description:
      "Creates a city-level location within a country. countryId is required and must reference an existing country.",
    requestBody: JSON.stringify(
      {
        action: "create",
        name: "New York",
        countryId: "paste-country-id-here",
        region: "New York",
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
    id: "colleges-list",
    tag: "Colleges",
    method: "GET",
    path: "/api/colleges",
    summary: "List all colleges",
    description:
      "Returns all colleges and universities sorted by name. Each college includes a logo path (e.g. /logos/ncaa/{espnId}.png) when mapped. Optional query params: limit (default 100, max 500) and offset (default 0). When provided, the response includes pagination metadata.",
  },
  {
    id: "colleges-create",
    tag: "Colleges",
    method: "POST",
    path: "/api/colleges",
    summary: "Create a college",
    description:
      "Creates a college or university within a location. locationId must reference an existing city.",
    requestBody: JSON.stringify(
      {
        action: "create",
        name: "Duke University",
        locationId: "paste-location-id-here",
        attendance: 17000,
      },
      null,
      2,
    ),
  },
  {
    id: "colleges-get",
    tag: "Colleges",
    method: "POST",
    path: "/api/colleges",
    summary: "Get a college",
    description: "Retrieves a single college by id.",
    requestBody: JSON.stringify(
      { action: "get", id: "paste-college-id-here" },
      null,
      2,
    ),
  },
  {
    id: "colleges-list-by-location",
    tag: "Colleges",
    method: "POST",
    path: "/api/colleges",
    summary: "List colleges in a location",
    description: "Returns all colleges within a given city location.",
    requestBody: JSON.stringify(
      { action: "listByLocation", locationId: "paste-location-id-here" },
      null,
      2,
    ),
  },
  {
    id: "colleges-delete",
    tag: "Colleges",
    method: "POST",
    path: "/api/colleges",
    summary: "Delete a college",
    description: "Removes a college by id.",
    requestBody: JSON.stringify(
      { action: "delete", id: "paste-college-id-here" },
      null,
      2,
    ),
  },
  {
    id: "leagues-list",
    tag: "Leagues",
    method: "GET",
    path: "/api/leagues",
    summary: "List all leagues",
    description:
      "Returns all professional sports leagues sorted by name. Leagues contain conferences, divisions, and teams. Optional query params: limit (default 100, max 500) and offset (default 0). When provided, the response includes pagination metadata.",
  },
  {
    id: "leagues-create",
    tag: "Leagues",
    method: "POST",
    path: "/api/leagues",
    summary: "Create a league",
    description:
      "Creates a professional sports league container. Add conferences, divisions, and teams under the league.",
    requestBody: JSON.stringify(
      {
        action: "create",
        name: "National Football League",
        abbreviation: "NFL",
      },
      null,
      2,
    ),
  },
  {
    id: "leagues-get",
    tag: "Leagues",
    method: "POST",
    path: "/api/leagues",
    summary: "Get a league",
    description: "Retrieves a single league by id.",
    requestBody: JSON.stringify(
      { action: "get", id: "paste-league-id-here" },
      null,
      2,
    ),
  },
  {
    id: "leagues-delete",
    tag: "Leagues",
    method: "POST",
    path: "/api/leagues",
    summary: "Delete a league",
    description: "Removes a league by id.",
    requestBody: JSON.stringify(
      { action: "delete", id: "paste-league-id-here" },
      null,
      2,
    ),
  },
  {
    id: "leagues-list-conferences",
    tag: "Leagues",
    method: "POST",
    path: "/api/leagues",
    summary: "List conferences in a league",
    description:
      "Returns all conferences within a league (e.g. AFC and NFC for the NFL).",
    requestBody: JSON.stringify(
      { action: "listConferences", leagueId: "paste-league-id-here" },
      null,
      2,
    ),
  },
  {
    id: "leagues-list-divisions",
    tag: "Leagues",
    method: "POST",
    path: "/api/leagues",
    summary: "List divisions in a league",
    description:
      "Returns all divisions across every conference in a league.",
    requestBody: JSON.stringify(
      { action: "listDivisions", leagueId: "paste-league-id-here" },
      null,
      2,
    ),
  },
  {
    id: "leagues-list-teams",
    tag: "Leagues",
    method: "POST",
    path: "/api/leagues",
    summary: "List teams in a league",
    description: "Returns all teams in a league, across all conferences and divisions.",
    requestBody: JSON.stringify(
      { action: "listTeams", leagueId: "paste-league-id-here" },
      null,
      2,
    ),
  },
  {
    id: "conferences-list",
    tag: "Conferences",
    method: "GET",
    path: "/api/conferences",
    summary: "List all conferences",
    description:
      "Returns all conferences sorted by name. Optional query params: limit (default 100, max 500) and offset (default 0). When provided, the response includes pagination metadata.",
  },
  {
    id: "conferences-create",
    tag: "Conferences",
    method: "POST",
    path: "/api/conferences",
    summary: "Create a conference",
    description: "Creates a conference within a league (e.g. AFC, Eastern Conference).",
    requestBody: JSON.stringify(
      {
        action: "create",
        leagueId: "paste-league-id-here",
        name: "American Football Conference",
        abbreviation: "AFC",
      },
      null,
      2,
    ),
  },
  {
    id: "conferences-get",
    tag: "Conferences",
    method: "POST",
    path: "/api/conferences",
    summary: "Get a conference",
    description: "Retrieves a single conference by id.",
    requestBody: JSON.stringify(
      { action: "get", id: "paste-conference-id-here" },
      null,
      2,
    ),
  },
  {
    id: "conferences-list-by-league",
    tag: "Conferences",
    method: "POST",
    path: "/api/conferences",
    summary: "List conferences in a league",
    description: "Returns all conferences within a given league.",
    requestBody: JSON.stringify(
      { action: "listByLeague", leagueId: "paste-league-id-here" },
      null,
      2,
    ),
  },
  {
    id: "conferences-delete",
    tag: "Conferences",
    method: "POST",
    path: "/api/conferences",
    summary: "Delete a conference",
    description:
      "Removes a conference by id. Fails if divisions still exist in that conference.",
    requestBody: JSON.stringify(
      { action: "delete", id: "paste-conference-id-here" },
      null,
      2,
    ),
  },
  {
    id: "divisions-list",
    tag: "Divisions",
    method: "GET",
    path: "/api/divisions",
    summary: "List all divisions",
    description:
      "Returns all divisions sorted by name. Optional query params: limit (default 100, max 500) and offset (default 0). When provided, the response includes pagination metadata.",
  },
  {
    id: "divisions-create",
    tag: "Divisions",
    method: "POST",
    path: "/api/divisions",
    summary: "Create a division",
    description:
      "Creates a division within a conference (e.g. AFC East, Atlantic Division).",
    requestBody: JSON.stringify(
      {
        action: "create",
        conferenceId: "paste-conference-id-here",
        name: "AFC East",
        abbreviation: "AFCE",
      },
      null,
      2,
    ),
  },
  {
    id: "divisions-get",
    tag: "Divisions",
    method: "POST",
    path: "/api/divisions",
    summary: "Get a division",
    description: "Retrieves a single division by id.",
    requestBody: JSON.stringify(
      { action: "get", id: "paste-division-id-here" },
      null,
      2,
    ),
  },
  {
    id: "divisions-list-by-conference",
    tag: "Divisions",
    method: "POST",
    path: "/api/divisions",
    summary: "List divisions in a conference",
    description: "Returns all divisions within a given conference.",
    requestBody: JSON.stringify(
      { action: "listByConference", conferenceId: "paste-conference-id-here" },
      null,
      2,
    ),
  },
  {
    id: "divisions-list-by-league",
    tag: "Divisions",
    method: "POST",
    path: "/api/divisions",
    summary: "List divisions in a league",
    description: "Returns all divisions across every conference in a league.",
    requestBody: JSON.stringify(
      { action: "listByLeague", leagueId: "paste-league-id-here" },
      null,
      2,
    ),
  },
  {
    id: "divisions-delete",
    tag: "Divisions",
    method: "POST",
    path: "/api/divisions",
    summary: "Delete a division",
    description:
      "Removes a division by id. Fails if teams still exist in that division.",
    requestBody: JSON.stringify(
      { action: "delete", id: "paste-division-id-here" },
      null,
      2,
    ),
  },
  {
    id: "teams-list",
    tag: "Teams",
    method: "GET",
    path: "/api/teams",
    summary: "List all teams",
    description:
      "Returns all professional sports teams sorted by name. Optional query params: limit (default 100, max 500) and offset (default 0). When provided, the response includes pagination metadata.",
  },
  {
    id: "teams-create",
    tag: "Teams",
    method: "POST",
    path: "/api/teams",
    summary: "Create a team",
    description:
      "Creates a team in a division with a home venue. Abbreviations are unique per league.",
    requestBody: JSON.stringify(
      {
        action: "create",
        divisionId: "paste-division-id-here",
        venueId: "paste-venue-id-here",
        name: "Buffalo Bills",
        abbreviation: "BUF",
        logo: "/logos/nfl/buf.png",
      },
      null,
      2,
    ),
  },
  {
    id: "teams-get",
    tag: "Teams",
    method: "POST",
    path: "/api/teams",
    summary: "Get a team",
    description: "Retrieves a single team by id.",
    requestBody: JSON.stringify(
      { action: "get", id: "paste-team-id-here" },
      null,
      2,
    ),
  },
  {
    id: "teams-list-by-division",
    tag: "Teams",
    method: "POST",
    path: "/api/teams",
    summary: "List teams in a division",
    description: "Returns all teams within a given division.",
    requestBody: JSON.stringify(
      { action: "listByDivision", divisionId: "paste-division-id-here" },
      null,
      2,
    ),
  },
  {
    id: "teams-list-by-league",
    tag: "Teams",
    method: "POST",
    path: "/api/teams",
    summary: "List teams in a league",
    description: "Returns all teams within a given league.",
    requestBody: JSON.stringify(
      { action: "listByLeague", leagueId: "paste-league-id-here" },
      null,
      2,
    ),
  },
  {
    id: "teams-delete",
    tag: "Teams",
    method: "POST",
    path: "/api/teams",
    summary: "Delete a team",
    description: "Removes a team by id.",
    requestBody: JSON.stringify(
      { action: "delete", id: "paste-team-id-here" },
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
    description:
      "Returns all venues sorted by name. Optional query params: limit (default 100, max 500) and offset (default 0). When provided, the response includes pagination metadata.",
  },
  {
    id: "venues-create",
    tag: "Venues",
    method: "POST",
    path: "/api/venues",
    summary: "Create a venue",
    description:
      "Creates a venue within a location (e.g. stadium, golf course). Requires isIndoor: true for indoor or retractable-roof venues, false for outdoor-only.",
    requestBody: JSON.stringify(
      {
        action: "create",
        locationId: "paste-location-id-here",
        name: "Madison Square Garden",
        latitude: 40.7505,
        longitude: -73.9934,
        isIndoor: true,
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
      "Returns all events with status computed from the current world clock time. Optional query params: limit (default 100, max 500) and offset (default 0). When provided, the response includes pagination metadata.",
  },
  {
    id: "events-create",
    tag: "Events",
    method: "POST",
    path: "/api/events",
    summary: "Create an event",
    description:
      "Schedules an event at a venue-local start time. Duration is in minutes. Optional parentId links a child event that must use the same venue and fit within the parent's time window. Overlapping events at the same venue are rejected unless one is an ancestor of the other.",
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
    description:
      "Retrieves a single event by id with current status, parentId, and direct childIds.",
    requestBody: JSON.stringify(
      { action: "get", id: "paste-event-id-here" },
      null,
      2,
    ),
  },
  {
    id: "events-update",
    tag: "Events",
    method: "POST",
    path: "/api/events",
    summary: "Update an event",
    description:
      "Updates an event by id. Supports patch semantics: provide any of name, localStart, and durationMinutes. Schedule changes re-run parent, child, and venue conflict validation.",
    requestBody: JSON.stringify(
      {
        action: "update",
        id: "paste-event-id-here",
        localStart: {
          year: 2020,
          month: 6,
          day: 11,
          hour: 7,
          minute: 0,
        },
        durationMinutes: 720,
      },
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
    id: "events-list-children",
    tag: "Events",
    method: "POST",
    path: "/api/events",
    summary: "List child events",
    description:
      "Returns direct child events for a parent event, sorted by start time.",
    requestBody: JSON.stringify(
      { action: "listChildren", parentId: "paste-parent-event-id-here" },
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
    description:
      "Removes an event by id and cascades deletion to all descendant child events.",
    requestBody: JSON.stringify(
      { action: "delete", id: "paste-event-id-here" },
      null,
      2,
    ),
  },
  {
    id: "weather-at-venue",
    tag: "Weather",
    method: "POST",
    path: "/api/weather",
    summary: "Weather at venue",
    description:
      "Returns simulated weather at a venue using seasonal baseline plus moving systems. Uses venue coordinates and world clock by default.",
    requestBody: JSON.stringify(
      {
        action: "getAtVenue",
        venueId: "paste-venue-id-here",
        isoUtc: "2020-06-14T16:00:00.000Z",
      },
      null,
      2,
    ),
  },
  {
    id: "weather-at-location",
    tag: "Weather",
    method: "POST",
    path: "/api/weather",
    summary: "Weather at city",
    description: "Returns simulated weather at a city location's coordinates.",
    requestBody: JSON.stringify(
      {
        action: "getAtLocation",
        locationId: "paste-location-id-here",
        isoUtc: "2020-06-14T16:00:00.000Z",
      },
      null,
      2,
    ),
  },
  {
    id: "weather-for-event",
    tag: "Weather",
    method: "POST",
    path: "/api/weather",
    summary: "Weather for event",
    description:
      "Returns probable weather at an event's venue for start or end time.",
    requestBody: JSON.stringify(
      {
        action: "getForEvent",
        eventId: "paste-event-id-here",
        phase: "start",
      },
      null,
      2,
    ),
  },
  {
    id: "weather-list-systems",
    tag: "Weather",
    method: "POST",
    path: "/api/weather",
    summary: "List weather systems",
    description:
      "Debug view of moving weather system positions at a given time.",
    requestBody: JSON.stringify(
      {
        action: "listSystems",
        isoUtc: "2020-06-14T16:00:00.000Z",
      },
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
        name: "Countries",
        description:
          "Countries with ISO codes, local flag images, languages, and population aggregated from cities.",
      },
      {
        name: "Locations",
        description: "Cities belonging to a country, with coordinates and timezone.",
      },
      {
        name: "Colleges",
        description:
          "Colleges and universities within a location, with student attendance and optional NCAA logo path.",
      },
      {
        name: "Leagues",
        description:
          "Professional sports league containers. Use listConferences, listDivisions, and listTeams to browse a league hierarchy.",
      },
      {
        name: "Conferences",
        description: "League subdivisions such as AFC/NFC or Eastern/Western conferences.",
      },
      {
        name: "Divisions",
        description:
          "Conference subdivisions such as AFC East or Atlantic Division.",
      },
      {
        name: "Teams",
        description:
          "Professional franchises with home venues. Team abbreviations are unique per league.",
      },
      {
        name: "Venues",
        description: "Venues within a location, such as stadiums or golf courses.",
      },
      {
        name: "Events",
        description:
          "Scheduled events at venue-local times. Events may form a parent-child hierarchy; child events share the parent's venue and must fall within its time window.",
      },
      {
        name: "Weather",
        description:
          "Simulated weather from seasonal baseline and moving systems across locations.",
      },
    ],
    paths,
  };
}
