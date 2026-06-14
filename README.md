# ESN World Engine

A server-side World Engine built with **Next.js**, **Node.js**, and **TypeScript**. It provides APIs for a simulated world with a UTC clock, US calendar, city locations, venues, events, and weather.

## Domain model

| Entity | Represents | Example |
|--------|------------|---------|
| **World Clock** | Canonical UTC time for the entire world | `2020-01-01T12:00:00.000Z` |
| **Calendar** | US Gregorian date derived from UTC | June 14, 2020 — Sunday, day 166 |
| **Location** | A city in a country | New York, United States |
| **Venue** | A place within a city | Madison Square Garden (indoor), Bethpage Black Course (outdoor). Retractable-roof venues count as indoor. |
| **Event** | A scheduled happening at a venue | Championship Final at 12:00 local, 2 hours |
| **Weather** | Simulated conditions at a place and time | 78°F, partly cloudy, rain likely at kickoff |

Locations hold the **timezone** used for local-time calculations. Venues belong to a location and inherit its timezone.

## Modules

| Module | Status | Description |
|--------|--------|-------------|
| **World Clock** | ✅ | Canonical UTC time source with configurable simulated tick rate |
| **Calendar** | ✅ | US Gregorian calendar derived from world clock UTC time |
| **Locations** | ✅ | Cities with country, population, coordinates, and IANA timezone |
| **Venues** | ✅ | Venues within a location (stadiums, golf courses, etc.) |
| **Events** | ✅ | Parallel events scheduled at venue-local start times |
| **Weather** | ✅ | Seasonal baseline + moving systems across locations |

Each module follows an **inputs → transformation → outputs** model with lightweight error handling and unit tests.

## Getting started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
git clone https://github.com/easonwc/esnWorld.git
cd esnWorld
npm install
```

### Environment

Copy the example env file and adjust as needed:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `WORLD_CLOCK_INITIAL_ISO_UTC` | `2020-01-01T00:00:00.000Z` | World clock start time |
| `WORLD_CLOCK_SIMULATED_MS_PER_REAL_MS` | `60` | Simulated ms advanced per real ms (60 = 1 simulated minute per real second) |
| `WEATHER_SEED` | `42` | Seed for reproducible weather probability |
| `WEATHER_UNITS` | `fahrenheit` | Temperature unit (`fahrenheit` or `celsius`) |
| `WEATHER_WIND_UNITS` | `mph` | Wind speed unit (`mph` or `kph`) |

### Run

```bash
npm run dev
```

Open [http://localhost:3000/api-docs](http://localhost:3000/api-docs) for the interactive API explorer.

## API overview

### World Clock

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/world-clock` | Get current world time |
| `POST` | `/api/world-clock` | Set or advance time (`action`: `set`, `advance`) |
| `POST` | `/api/world-clock/start` | Start automatic time advancement |
| `POST` | `/api/world-clock/stop` | Stop and freeze time |

`advance` only accepts positive millisecond values.

### Calendar

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/calendar` | Get calendar date for current world clock time |
| `POST` | `/api/calendar` | Convert UTC to calendar (`action`: `fromIso`, `fromDate`) |

`GET` returns the live date when the clock is running — re-execute to see updates.

### Locations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/locations` | List all cities |
| `POST` | `/api/locations` | Create, get, delete, or get local time (`action`: `create`, `get`, `delete`, `localTime`) |

**Create a city:**

```json
{
  "action": "create",
  "name": "New York",
  "country": "United States",
  "population": 8336817,
  "latitude": 40.7128,
  "longitude": -74.006,
  "timezone": "America/New_York"
}
```

`population` must be a non-negative integer. A location cannot be deleted while it still has venues.

### Venues

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/venues` | List all venues |
| `POST` | `/api/venues` | Create, get, delete, list by location, or get local time (`action`: `create`, `get`, `delete`, `listByLocation`, `localTime`) |

**Create a venue within a city:**

```json
{
  "action": "create",
  "locationId": "<location-id>",
  "name": "Madison Square Garden",
  "latitude": 40.7505,
  "longitude": -73.9934,
  "isIndoor": true
}
```

Local time at a venue uses the parent location's timezone.

**Indoor vs outdoor:** Set `isIndoor: true` for venues where weather does not affect events — including fully indoor arenas and **retractable-roof venues** (hybrid venues count as indoor in this simulation). Use `isIndoor: false` for outdoor-only venues such as open-air stadiums and golf courses.

### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/events` | List all events (status from world clock) |
| `POST` | `/api/events` | Create, get, delete, list by venue, or list active (`action`: `create`, `get`, `delete`, `listByVenue`, `listActive`, `listAtTime`) |

**Schedule an event at venue-local time:**

```json
{
  "action": "create",
  "name": "Championship Final",
  "venueId": "<venue-id>",
  "localStart": {
    "year": 2020,
    "month": 6,
    "day": 14,
    "hour": 12,
    "minute": 0
  },
  "durationMinutes": 120
}
```

Events are stored as UTC instants derived from the venue's city timezone. Status is `upcoming`, `active`, or `ended` relative to the world clock. Multiple events can be active in parallel.

### Weather

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/weather` | `getAtVenue`, `getAtLocation`, `getForEvent`, `listSystems` |

Weather combines a **seasonal baseline** (latitude + day of year) with **moving systems** that propagate across the map as world time advances.

**Weather for an event at kickoff:**

```json
{
  "action": "getForEvent",
  "eventId": "<event-id>",
  "phase": "start"
}
```

**Weather at a venue at a specific time:**

```json
{
  "action": "getAtVenue",
  "venueId": "<venue-id>",
  "isoUtc": "2020-06-14T16:00:00.000Z"
}
```

Venue queries use **venue coordinates**; city queries use **location coordinates**. Results include `weatherApplies` (false for indoor venues). Results are seeded and reproducible via `WEATHER_SEED`.

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/openapi` | OpenAPI 3.0 JSON spec |
| — | `/api-docs` | Interactive API explorer (Swagger-style) |

## Example workflow

1. **Start the world clock** — `POST /api/world-clock/start`
2. **Create a location** — `POST /api/locations` with `action: "create"`
3. **Create venues** in that city — `POST /api/venues` with `action: "create"`
4. **Check the calendar** — `GET /api/calendar`
5. **Get local time at a venue** — `POST /api/venues` with `action: "localTime"`
6. **Schedule an event** — `POST /api/events` with `action: "create"`
7. **List active events** — `POST /api/events` with `action: "listActive"`
8. **Get weather for an event** — `POST /api/weather` with `action: "getForEvent"`

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm test             # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Lint
```

## Project structure

```
src/
  modules/
    world-clock/     # UTC clock, tick rate, start/stop
    calendar/        # US Gregorian calendar transforms
    locations/       # Cities with country, population, and timezone
    venues/          # Venues within a location
    events/          # Scheduled events at venue-local times
    weather/         # Seasonal baseline + moving weather systems
  app/
    api/             # API route handlers
    api-docs/        # Interactive API explorer
  lib/
    openapi-spec.ts  # API definitions (single source of truth)
```

## License

Private project.
