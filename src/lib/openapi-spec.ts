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
    id: "humans-list",
    tag: "Humans",
    method: "GET",
    path: "/api/humans",
    summary: "List all humans",
    description:
      "Returns people sorted by family name then given name. Includes computed displayName and joined birthplace/nationality labels. Optional query params: limit (default 100, max 500) and offset (default 0). When provided, the response includes pagination metadata.",
  },
  {
    id: "humans-create",
    tag: "Humans",
    method: "POST",
    path: "/api/humans",
    summary: "Create a human",
    description:
      "Creates a person record with structured name, gender, birth date, birthplace location, nationality country, and metric height/weight.",
    requestBody: JSON.stringify(
      {
        action: "create",
        givenName: "Scottie",
        familyName: "Scheffler",
        gender: "male",
        birthDate: "1996-06-21",
        birthLocationId: "paste-location-id-here",
        nationalityCountryId: "paste-country-id-here",
        heightCm: 185,
        weightKg: 88,
      },
      null,
      2,
    ),
  },
  {
    id: "humans-get",
    tag: "Humans",
    method: "POST",
    path: "/api/humans",
    summary: "Get a human",
    description: "Retrieves a single person by id.",
    requestBody: JSON.stringify(
      { action: "get", id: "paste-human-id-here" },
      null,
      2,
    ),
  },
  {
    id: "humans-delete",
    tag: "Humans",
    method: "POST",
    path: "/api/humans",
    summary: "Delete a human",
    description: "Removes a person by id.",
    requestBody: JSON.stringify(
      { action: "delete", id: "paste-human-id-here" },
      null,
      2,
    ),
  },
  {
    id: "golfers-list",
    tag: "Golfers",
    method: "GET",
    path: "/api/golfers",
    summary: "List all golfers",
    description:
      "Returns golfer profiles with simulation skills and joined human display name. Sorted by human name. Optional query params: limit (default 100, max 500) and offset (default 0).",
  },
  {
    id: "golfers-create",
    tag: "Golfers",
    method: "POST",
    path: "/api/golfers",
    summary: "Create a golfer profile",
    description:
      "Creates a golf simulation profile for an existing human. One golfer profile per human. Skill ratings use golf-sim-library attribute shapes (0–100).",
    requestBody: JSON.stringify(
      {
        action: "create",
        humanId: "paste-human-id-here",
        playsLeftHanded: false,
        turnedProYear: 2015,
        putting: { putting: 88, shortPutting: 90, lagPutting: 86 },
        approach: {
          approach: 90,
          accuracy: 88,
          distanceControl: 91,
          dispersion: 89,
        },
        shortGame: {
          shortGame: 89,
          chipping: 90,
          bunkerPlay: 86,
          pitching: 88,
        },
        teeShot: {
          driving: 88,
          distance: 90,
          accuracy: 85,
          dispersion: 84,
        },
        clubs: {
          driver: 92,
          wood: 88,
          longIron: 90,
          midIron: 91,
          shortIron: 92,
          wedge: 94,
        },
      },
      null,
      2,
    ),
  },
  {
    id: "golfers-get",
    tag: "Golfers",
    method: "POST",
    path: "/api/golfers",
    summary: "Get a golfer profile",
    description: "Retrieves a golfer profile by id.",
    requestBody: JSON.stringify(
      { action: "get", id: "paste-golfer-id-here" },
      null,
      2,
    ),
  },
  {
    id: "golfers-get-by-human",
    tag: "Golfers",
    method: "POST",
    path: "/api/golfers",
    summary: "Get a golfer by human id",
    description: "Retrieves the golfer profile linked to a human.",
    requestBody: JSON.stringify(
      { action: "getByHuman", humanId: "paste-human-id-here" },
      null,
      2,
    ),
  },
  {
    id: "golfers-delete",
    tag: "Golfers",
    method: "POST",
    path: "/api/golfers",
    summary: "Delete a golfer profile",
    description: "Removes a golfer profile by id.",
    requestBody: JSON.stringify(
      { action: "delete", id: "paste-golfer-id-here" },
      null,
      2,
    ),
  },
  {
    id: "tennis-players-list",
    tag: "Tennis Players",
    method: "GET",
    path: "/api/tennis-players",
    summary: "List all tennis players",
    description:
      "Returns tennis simulation profiles with skills and joined human display name. Sorted by human name. Optional query params: limit (default 100, max 500) and offset (default 0).",
  },
  {
    id: "tennis-players-create",
    tag: "Tennis Players",
    method: "POST",
    path: "/api/tennis-players",
    summary: "Create a tennis player profile",
    description:
      "Creates a tennis simulation profile for an existing human. One profile per human. Skill ratings use tennis-sim-library attribute shapes (0–100).",
    requestBody: JSON.stringify(
      {
        action: "create",
        humanId: "paste-human-id-here",
        playsLeftHanded: false,
        backhandStyle: "two_handed",
        turnedProYear: 2003,
        serve: {
          serve: 92,
          firstServe: 91,
          secondServe: 88,
          servePower: 90,
          servePlacement: 89,
        },
        return: {
          return: 88,
          firstServeReturn: 87,
          secondServeReturn: 90,
          returnDepth: 86,
        },
        baseline: {
          baseline: 91,
          forehand: 93,
          backhand: 88,
          consistency: 90,
          power: 89,
          movement: 87,
        },
        net: {
          netPlay: 82,
          volley: 80,
          overhead: 84,
          approach: 81,
        },
        surfacePreference: {
          hard: 75,
          clay: 72,
          grass: 70,
          indoor: 74,
        },
      },
      null,
      2,
    ),
  },
  {
    id: "tennis-players-get",
    tag: "Tennis Players",
    method: "POST",
    path: "/api/tennis-players",
    summary: "Get a tennis player profile",
    description: "Retrieves a tennis player profile by id.",
    requestBody: JSON.stringify(
      { action: "get", id: "paste-tennis-player-id-here" },
      null,
      2,
    ),
  },
  {
    id: "tennis-players-get-by-human",
    tag: "Tennis Players",
    method: "POST",
    path: "/api/tennis-players",
    summary: "Get a tennis player by human id",
    description: "Retrieves the tennis player profile linked to a human.",
    requestBody: JSON.stringify(
      { action: "getByHuman", humanId: "paste-human-id-here" },
      null,
      2,
    ),
  },
  {
    id: "tennis-players-delete",
    tag: "Tennis Players",
    method: "POST",
    path: "/api/tennis-players",
    summary: "Delete a tennis player profile",
    description: "Removes a tennis player profile by id.",
    requestBody: JSON.stringify(
      { action: "delete", id: "paste-tennis-player-id-here" },
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
      "Creates a venue within a location (e.g. stadium, golf course). Requires isIndoor: true for indoor or retractable-roof venues, false for outdoor-only. Optional schedulingMode: exclusive (default) or multi_resource for parallel bookings via venue resources.",
    requestBody: JSON.stringify(
      {
        action: "create",
        locationId: "paste-location-id-here",
        name: "Madison Square Garden",
        latitude: 40.7505,
        longitude: -73.9934,
        isIndoor: true,
        schedulingMode: "exclusive",
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
    id: "venues-create-resource",
    tag: "Venues",
    method: "POST",
    path: "/api/venues",
    summary: "Create a venue resource",
    description:
      "Adds a schedulable resource (court, tee group, lane, or generic) to a multi_resource venue.",
    requestBody: JSON.stringify(
      {
        action: "createResource",
        venueId: "paste-venue-id-here",
        name: "Court 17",
        resourceType: "court",
      },
      null,
      2,
    ),
  },
  {
    id: "venues-list-resources",
    tag: "Venues",
    method: "POST",
    path: "/api/venues",
    summary: "List venue resources",
    description: "Returns all resources for a multi_resource venue.",
    requestBody: JSON.stringify(
      { action: "listResources", venueId: "paste-venue-id-here" },
      null,
      2,
    ),
  },
  {
    id: "venues-get-resource",
    tag: "Venues",
    method: "POST",
    path: "/api/venues",
    summary: "Get a venue resource",
    description: "Retrieves a single venue resource by id.",
    requestBody: JSON.stringify(
      { action: "getResource", id: "paste-resource-id-here" },
      null,
      2,
    ),
  },
  {
    id: "venues-delete-resource",
    tag: "Venues",
    method: "POST",
    path: "/api/venues",
    summary: "Delete a venue resource",
    description: "Removes a venue resource by id.",
    requestBody: JSON.stringify(
      { action: "deleteResource", id: "paste-resource-id-here" },
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
      "Schedules an event at a venue-local start time. Duration is in minutes. Optional parentId links a child event that must use the same venue and fit within the parent's time window. Optional venueResourceId binds a leaf event to a resource on multi_resource venues. Overlapping events at the same venue are rejected unless one is an ancestor of the other; on multi_resource venues, resource-bound events only conflict on the same resource, and container events (no venueResourceId) only conflict with other containers.",
    requestBody: JSON.stringify(
      {
        action: "create",
        name: "Championship Final",
        venueId: "paste-venue-id-here",
        venueResourceId: "paste-resource-id-here",
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
    id: "golf-tours-list",
    tag: "Golf Tours",
    method: "GET",
    path: "/api/golf-tours",
    summary: "List golf tours",
    description: "Returns all golf tours (e.g. PGA Tour) with name, abbreviation, and logo.",
  },
  {
    id: "golf-tours-get",
    tag: "Golf Tours",
    method: "POST",
    path: "/api/golf-tours",
    summary: "Get a golf tour",
    description: "Retrieves a golf tour by id or abbreviation (includes logo path).",
    requestBody: JSON.stringify(
      { action: "get", abbreviation: "PGA" },
      null,
      2,
    ),
  },
  {
    id: "golf-tours-list-tournaments",
    tag: "Golf Tours",
    method: "POST",
    path: "/api/golf-tours",
    summary: "List tournaments on a tour",
    description:
      "Returns the tournament catalog for a golf tour (Masters, Players, majors, etc.).",
    requestBody: JSON.stringify(
      { action: "listTournaments", abbreviation: "PGA" },
      null,
      2,
    ),
  },
  {
    id: "golf-tours-list-season-schedules",
    tag: "Golf Tours",
    method: "POST",
    path: "/api/golf-tours",
    summary: "List season schedules",
    description:
      "Returns materialized season schedules linking catalog tournaments to scheduled root events.",
    requestBody: JSON.stringify(
      {
        action: "listSeasonSchedules",
        abbreviation: "PGA",
        seasonYear: 2026,
      },
      null,
      2,
    ),
  },
  {
    id: "golf-tournaments-get",
    tag: "Golf Tournaments",
    method: "POST",
    path: "/api/golf-tournaments",
    summary: "Get a tournament",
    description:
      "Retrieves a tournament catalog entry by id or slug (includes purse, isMajor, fieldSize golfer capacity, teeGroupCount scheduling slots, entryCriteria, venueMode).",
    requestBody: JSON.stringify(
      {
        action: "get",
        slug: "masters",
        tourAbbreviation: "PGA",
      },
      null,
      2,
    ),
  },
  {
    id: "golf-tournaments-list-by-tour",
    tag: "Golf Tournaments",
    method: "POST",
    path: "/api/golf-tournaments",
    summary: "List tournaments by tour",
    description: "Returns all tournament catalog entries for a golf tour.",
    requestBody: JSON.stringify(
      { action: "listByTour", abbreviation: "PGA" },
      null,
      2,
    ),
  },
  {
    id: "golf-tournaments-list-venues",
    tag: "Golf Tournaments",
    method: "POST",
    path: "/api/golf-tournaments",
    summary: "List tournament venue pool",
    description:
      "Returns venues linked to a tournament (fixed host or rotation pool for majors).",
    requestBody: JSON.stringify(
      {
        action: "listVenues",
        tournamentId: "paste-tournament-id-here",
      },
      null,
      2,
    ),
  },
  {
    id: "golf-scheduling-process-now",
    tag: "Golf Scheduling",
    method: "POST",
    path: "/api/golf-scheduling",
    summary: "Run golf schedulers now",
    description:
      "Manually triggers golf tour season scheduling for the current (or given) world clock time. Requires PGA_TOUR_ENABLED, LPGA_TOUR_ENABLED, and/or DP_WORLD_TOUR_ENABLED with seeded catalogs. Normally also runs automatically when the clock crosses Oct 1.",
    requestBody: JSON.stringify(
      {
        action: "processNow",
        isoUtc: "2025-10-02T12:00:00.000Z",
      },
      null,
      2,
    ),
  },
  {
    id: "tennis-tours-list",
    tag: "Tennis Tours",
    method: "GET",
    path: "/api/tennis-tours",
    summary: "List tennis tours",
    description: "Returns all tennis tours (ATP, WTA) with name, abbreviation, and logo.",
  },
  {
    id: "tennis-tours-get",
    tag: "Tennis Tours",
    method: "POST",
    path: "/api/tennis-tours",
    summary: "Get a tennis tour",
    description: "Retrieves a tennis tour by id or abbreviation.",
    requestBody: JSON.stringify(
      { action: "get", abbreviation: "ATP" },
      null,
      2,
    ),
  },
  {
    id: "tennis-tours-list-tournaments",
    tag: "Tennis Tours",
    method: "POST",
    path: "/api/tennis-tours",
    summary: "List tournaments on a tour",
    description: "Returns the tournament catalog for a tennis tour.",
    requestBody: JSON.stringify(
      { action: "listTournaments", abbreviation: "ATP" },
      null,
      2,
    ),
  },
  {
    id: "tennis-tours-list-season-schedules",
    tag: "Tennis Tours",
    method: "POST",
    path: "/api/tennis-tours",
    summary: "List season schedules",
    description: "Returns materialized season schedule rows for a tennis tour.",
    requestBody: JSON.stringify(
      { action: "listSeasonSchedules", abbreviation: "ATP", seasonYear: 2026 },
      null,
      2,
    ),
  },
  {
    id: "tennis-tournaments-list-by-tour",
    tag: "Tennis Tournaments",
    method: "POST",
    path: "/api/tennis-tournaments",
    summary: "List tournaments by tour",
    description: "Returns all tournament catalog entries for a tennis tour.",
    requestBody: JSON.stringify(
      { action: "listByTour", abbreviation: "ATP" },
      null,
      2,
    ),
  },
  {
    id: "tennis-tournaments-list-venues",
    tag: "Tennis Tournaments",
    method: "POST",
    path: "/api/tennis-tournaments",
    summary: "List tournament venue pool",
    description: "Returns venues linked to a tennis tournament.",
    requestBody: JSON.stringify(
      {
        action: "listVenues",
        tournamentId: "paste-tournament-id-here",
      },
      null,
      2,
    ),
  },
  {
    id: "tennis-scheduling-process-now",
    tag: "Tennis Scheduling",
    method: "POST",
    path: "/api/tennis-scheduling",
    summary: "Run tennis schedulers now",
    description:
      "Manually triggers tennis tour season scheduling for the current (or given) world clock time. Requires ATP_TOUR_ENABLED and/or WTA_TOUR_ENABLED with seeded catalogs. ATP runs before WTA so joint slams share event trees.",
    requestBody: JSON.stringify(
      {
        action: "processNow",
        isoUtc: "2025-10-02T12:00:00.000Z",
      },
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
        name: "Humans",
        description:
          "People with structured identity, birthplace, nationality, and metric biometrics. Sport profiles (golfer, tennis player) extend humans separately.",
      },
      {
        name: "Golfers",
        description:
          "Golf simulation profiles linked to humans, with complete skill attributes from golf-sim-library.",
      },
      {
        name: "Tennis Players",
        description:
          "Tennis simulation profiles linked to humans, with complete skill attributes from tennis-sim-library.",
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
        description:
          "Venues within a location. Supports exclusive (whole-venue) or multi_resource scheduling with courts, tee groups, and other bookable resources.",
      },
      {
        name: "Events",
        description:
          "Scheduled events at venue-local times. Events may form a parent-child hierarchy; optional venueResourceId binds leaves to a resource on multi_resource venues.",
      },
      {
        name: "Golf Tours",
        description:
          "Golf tours and season scheduling. PGA, LPGA, and DP World Tour catalogs with materialized season schedules when tour schedulers are enabled.",
      },
      {
        name: "Golf Tournaments",
        description:
          "Tournament catalog entries with purse, major flag, entry criteria, and venue pools.",
      },
      {
        name: "Golf Scheduling",
        description:
          "Manual and automatic PGA season materialization (tournament → rounds → tee groups).",
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
