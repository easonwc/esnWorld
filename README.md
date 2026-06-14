# ESN World Engine

A server-side World Engine built with **Next.js**, **Node.js**, and **TypeScript**. It provides APIs for a simulated world with a UTC clock, US calendar, city locations, colleges, leagues, teams, venues, events, and weather.

## Domain model

| Entity | Represents | Example |
|--------|------------|---------|
| **World Clock** | Canonical UTC time for the entire world | `2020-01-01T12:00:00.000Z` |
| **Calendar** | US Gregorian date derived from UTC | June 14, 2020 — Sunday, day 166 |
| **Country** | A nation with ISO code, local flag image, languages, and aggregated city population | United States — `/flags/us.svg` |
| **Location** | A city belonging to a country | New York, United States |
| **College** | A US college or university within a city | University of Michigan (Ann Arbor, Michigan) |
| **League** | A professional sports league container for teams | National Football League (NFL) |
| **Conference** | A league subdivision (e.g. AFC, NFC) | American Football Conference |
| **Division** | A conference subdivision (e.g. AFC East) | AFC East |
| **Team** | A professional sports franchise with home stadium | Buffalo Bills |
| **Venue** | A place within a city | Highmark Stadium (outdoor), SoFi Stadium (indoor) |
| **Event** | A scheduled happening at a venue | Championship Final at 12:00 local, 2 hours |
| **Weather** | Simulated conditions at a place and time | 78°F, partly cloudy, rain likely at kickoff |

Locations hold the **timezone** used for local-time calculations. Cities belong to a **country** (flag, languages, total population from cities). Colleges and venues belong to a location. Teams belong to a division (within a conference and league) and reference a home **venue** (stadium) with its own coordinates.

## Modules

| Module | Status | Description |
|--------|--------|-------------|
| **World Clock** | ✅ | Canonical UTC time source with configurable simulated tick rate |
| **Calendar** | ✅ | US Gregorian calendar derived from world clock UTC time |
| **Countries** | ✅ | Nations with ISO code, local flag image, languages, and population summed from cities |
| **Locations** | ✅ | Cities with country, population, coordinates, and IANA timezone |
| **Colleges** | ✅ | US colleges and universities within a location (name, attendance) |
| **Leagues** | ✅ | Professional sports league containers (name, abbreviation) |
| **Conferences** | ✅ | League subdivisions (AFC, NFC) |
| **Divisions** | ✅ | Conference subdivisions (AFC East, NFC West, etc.) |
| **Teams** | ✅ | Professional franchises with home venue and logo |
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
| `DATABASE_PATH` | `./data/world.db` | SQLite file for persisted world geography and sports entities |
| `LOCATIONS_SEED_ON_STARTUP` | `false` | When `true`, merge seed countries and cities on server startup (skips entries that already exist) |
| `SKIP_FLAG_DOWNLOAD` | unset | When `true`, skip downloading flag SVGs (tests use this implicitly via Vitest) |

### Country flag images

Country records store a local image path such as `/flags/us.svg`, not an emoji. SVG files live in `public/flags/` and are served by Next.js when the dev or production server is running.

**Download all flags (recommended for local setup):**

```bash
npm run download-flags
```

This script:

- Reads the 200-country seed catalog in `src/persistence/seed/countries.data.ts`
- Downloads each flag SVG from [flagcdn.com](https://flagcdn.com) (e.g. `https://flagcdn.com/us.svg`)
- Saves files to `public/flags/` as `{iso}.svg` (e.g. `us.svg`, `gb.svg`)
- Skips files that already exist, so it is safe to re-run

Requires a network connection on first run. Downloaded images are gitignored (`public/flags/*.svg`); each machine fetches its own copy.

**Other ways flags get downloaded:**

- **Server startup** — after seeding (if enabled), the server syncs missing flag files for countries already in the database
- **Create country API** — `POST /api/countries` with `isoCode` downloads that country's flag automatically

Set `SKIP_FLAG_DOWNLOAD=true` in `.env` to disable network fetches (flag paths are still stored, but files are not downloaded).

### Run

```bash
npm run dev
```

Open [http://localhost:3000/api-docs](http://localhost:3000/api-docs) for the interactive API explorer.

## Saving and persisting world state

The world splits into **constants** (configuration and rules) and **mutable state** (anything that changes as the simulation runs). Persistence should eventually cover all mutable state so a restart resumes the same world — not just geography.

### Constants (`.env` — not stored in the database)

These define how the world behaves and can be recomputed from config alone:

| Config | Module | Role |
|--------|--------|------|
| `WORLD_CLOCK_INITIAL_ISO_UTC` | World Clock | Default start time (overridden once clock state is persisted) |
| `WORLD_CLOCK_SIMULATED_MS_PER_REAL_MS` | World Clock | Tick rate |
| `WEATHER_SEED` | Weather | Reproducible probability and system layout |
| `WEATHER_UNITS`, `WEATHER_WIND_UNITS` | Weather | Display units |

The **calendar** is derived from world clock UTC — it has no independent state.

### Mutable state (what changes during a session)

| State | Module | Persisted today? | Notes |
|-------|--------|------------------|-------|
| Countries | Countries | ✅ | Flag, languages; population summed from cities |
| Cities | Locations | ✅ Phase 1 | SQLite via `DATABASE_PATH`; belong to a country |
| Colleges | Colleges | ✅ Phase 1 | SQLite via `DATABASE_PATH`; belong to a location |
| Leagues | Leagues | ✅ Phase 1 | SQLite via `DATABASE_PATH` |
| Conferences | Conferences | ✅ Phase 1 | SQLite via `DATABASE_PATH`; belong to a league |
| Divisions | Divisions | ✅ Phase 1 | SQLite via `DATABASE_PATH`; belong to a conference |
| Teams | Teams | ✅ Phase 1 | SQLite via `DATABASE_PATH`; belong to a division and home venue |
| Venues | Venues | ✅ Phase 1 | SQLite via `DATABASE_PATH` |
| Scheduled events | Events | ❌ | In-memory; lost on restart |
| World clock | World Clock | ❌ | Current UTC, running/stopped, tick progress — in-memory |
| Weather systems | Weather | ❌ (derived) | Positions and conditions are computed from `WEATHER_SEED` + world time today; no separate store yet |

On first run, the database is **empty** unless you set `LOCATIONS_SEED_ON_STARTUP=true`. Create countries and cities via the API, or enable the seed to load countries and major world cities automatically.

### World seed (optional)

Set `LOCATIONS_SEED_ON_STARTUP=true` in `.env` to merge **200 countries**, **419 cities**, and **225 US colleges and universities** when the server starts. Countries are seeded first (ISO code, languages, local flag image), then cities are linked by country name, then colleges are linked to their campus cities.

Merge behavior:

- **Empty database** — all seed countries, cities, and colleges are inserted.
- **Existing database** — only entries not already present are added (countries by `name`; cities by `name` + `region` + `countryName`; colleges by institution `name`, case-insensitive). Nothing is overwritten or duplicated.
- **Disabled** (`false`, the default) — no seed runs; the database stays as-is.

Seed catalogs: `src/persistence/seed/countries.data.ts`, `src/persistence/seed/locations.data.ts`, `src/persistence/seed/ncaa-locations.data.ts` (auto-generated from `scripts/generate-ncaa-locations.ts`), `src/persistence/seed/tennis-golf-locations.data.ts`, and `src/persistence/seed/colleges.data.ts` (auto-generated alongside NCAA locations).

The city catalog includes major world metros, all NFL/NBA/MLB/NHL markets, **209 NCAA Division I campus cities**, and **47 tennis and golf event host cities** (Grand Slams, ATP/WTA Masters staples, golf majors, and flagship PGA/DP World Tour venues). NCAA entries use plain city names with a `region` field for the US state. Schools in cities already present without a conflicting region (e.g. New York, Los Angeles, Chicago) are not duplicated.

The college catalog lists **225 NCAA Division I football programs** (FBS + FCS) with approximate enrollment. Each college links to its campus city by `locationName` + `locationRegion` + `countryName`, falling back to a region-less city match when the metro is already in the world catalog (e.g. Atlanta, Houston).

### NFL seed (optional)

Set `NFL_SEED_ON_STARTUP=true` in `.env` to merge the full **National Football League** on server startup:

- **1 league** (NFL), with logo at `/logos/leagues/nfl.png`
- **2 conferences** (AFC, NFC)
- **8 divisions**
- **32 teams**, each with a downloaded logo at `/logos/nfl/{abbreviation}.png`
- **~30 stadium venues** (shared stadiums such as MetLife and SoFi are deduplicated), each linked to a city location

NFL seed also ensures countries and locations exist (including 9 supplemental stadium cities such as Orchard Park and Inglewood). It can run independently of `LOCATIONS_SEED_ON_STARTUP`, though enabling both is recommended for a complete world.

Merge behavior is idempotent: existing leagues, conferences, divisions, venues, and teams are skipped (teams merge by league + abbreviation).

**Download team logos manually:**

```bash
npm run download-nfl-logos
```

Logos are fetched from NFL.com and stored in `public/logos/nfl/`. League logos use ESPN's CDN at `public/logos/leagues/`. Downloaded images are gitignored; each machine fetches its own copy. Set `SKIP_NFL_LOGO_DOWNLOAD=true` to skip network downloads for both team and league logos (paths are still assigned).

Seed catalog: `src/persistence/seed/nfl-teams.data.ts`.

### MLB seed (optional)

Set `MLB_SEED_ON_STARTUP=true` in `.env` to merge the full **Major League Baseball** on server startup:

- **1 league** (MLB), with logo at `/logos/leagues/mlb.png`
- **2 conferences** (American League, National League)
- **6 divisions**
- **30 teams**, each with a downloaded logo at `/logos/mlb/{abbreviation}.png`
- **30 ballpark venues**, each linked to a city location

MLB seed also ensures countries and locations exist (including supplemental stadium cities such as St. Petersburg and Cumberland). It can run alongside `NFL_SEED_ON_STARTUP` — team abbreviations are scoped per league (e.g. both NFL and MLB have a `KC` team).

**Download team logos manually:**

```bash
npm run download-mlb-logos
```

Logos are fetched from ESPN's CDN and stored in `public/logos/mlb/`. Set `SKIP_MLB_LOGO_DOWNLOAD=true` to skip network downloads.

Seed catalog: `src/persistence/seed/mlb-teams.data.ts`.

### NBA seed (optional)

Set `NBA_SEED_ON_STARTUP=true` in `.env` to merge the full **National Basketball Association** on server startup:

- **1 league** (NBA), with logo at `/logos/leagues/nba.png`
- **2 conferences** (Eastern, Western)
- **6 divisions**
- **30 teams**, each with a downloaded logo at `/logos/nba/{abbreviation}.png`
- **30 arena venues**, each linked to a city location

NBA seed also ensures countries and locations exist (including supplemental arena cities such as Brooklyn and Inglewood). It can run alongside the other league seeds — team abbreviations are scoped per league.

**Download team logos manually:**

```bash
npm run download-nba-logos
```

Logos are fetched from ESPN's CDN and stored in `public/logos/nba/`. Set `SKIP_NBA_LOGO_DOWNLOAD=true` to skip network downloads.

Seed catalog: `src/persistence/seed/nba-teams.data.ts`.

### NHL seed (optional)

Set `NHL_SEED_ON_STARTUP=true` in `.env` to merge the full **National Hockey League** on server startup:

- **1 league** (NHL), with logo at `/logos/leagues/nhl.png`
- **2 conferences** (Eastern, Western)
- **4 divisions** (Atlantic, Metropolitan, Central, Pacific)
- **32 teams**, each with a downloaded logo at `/logos/nhl/{abbreviation}.png`
- **Arena venues** (shared multi-sport buildings such as TD Garden and Madison Square Garden are deduplicated), each linked to a city location

NHL seed also ensures countries and locations exist (including supplemental arena cities such as Newark, Elmont, and Saint Paul). It can run alongside the other league seeds.

**Download team logos manually:**

```bash
npm run download-nhl-logos
```

Logos are fetched from ESPN's CDN and stored in `public/logos/nhl/`. Set `SKIP_NHL_LOGO_DOWNLOAD=true` to skip network downloads.

Seed catalog: `src/persistence/seed/nhl-teams.data.ts`.

### MLS seed (optional)

Set `MLS_SEED_ON_STARTUP=true` in `.env` to merge the full **Major League Soccer** on server startup:

- **1 league** (MLS), with logo at `/logos/leagues/mls.png`
- **2 conferences** (Eastern, Western)
- **2 divisions** (one per conference — MLS has no formal divisions since 2020)
- **30 teams**, each with a downloaded logo at `/logos/mls/{abbreviation}.png`
- **Stadium venues** (shared multi-sport buildings such as Gillette Stadium and Lumen Field are deduplicated), each linked to a city location

MLS seed also ensures countries and locations exist (including supplemental stadium cities such as Harrison, Fort Lauderdale, and Commerce City). It can run alongside the other league seeds.

**Download team logos manually:**

```bash
npm run download-mls-logos
```

Logos are fetched from MLS's CDN and stored in `public/logos/mls/`. Set `SKIP_MLS_LOGO_DOWNLOAD=true` to skip network downloads.

Seed catalog: `src/persistence/seed/mls-teams.data.ts`.

### WNBA seed (optional)

Set `WNBA_SEED_ON_STARTUP=true` in `.env` to merge the full **Women's National Basketball Association** on server startup:

- **1 league** (WNBA), with logo at `/logos/leagues/wnba.png`
- **2 conferences** (Eastern, Western)
- **2 divisions** (one per conference)
- **13 teams**, each with a downloaded logo at `/logos/wnba/{abbreviation}.png`
- **Arena venues** (shared multi-sport buildings such as Barclays Center and Target Center are deduplicated), each linked to a city location

WNBA seed also ensures countries and locations exist (including supplemental arena cities such as College Park, Uncasville, and Arlington). It can run alongside the other league seeds.

**Download team logos manually:**

```bash
npm run download-wnba-logos
```

Logos are fetched from ESPN's CDN and stored in `public/logos/wnba/`. Set `SKIP_WNBA_LOGO_DOWNLOAD=true` to skip network downloads for both team and league logos (paths are still assigned).

Seed catalog: `src/persistence/seed/wnba-teams.data.ts`.

### Future enhancements

1. ~~**Seed data**~~ — ✅ Optional country, city, and college catalogs via `LOCATIONS_SEED_ON_STARTUP` (venue seed TBD).
2. **Persist events** — Save planned and scheduled happenings (venue, local start, duration) so the event calendar survives restarts. Event *status* (`upcoming` / `active` / `ended`) stays derived from the persisted clock + stored UTC instants.
3. **Persist world clock** — Save current simulated UTC, whether ticking is active, and enough tick metadata to resume advancement without a jump or drift after restart.
4. **Weather and derived simulation state** — Today weather is deterministic from `WEATHER_SEED` + clock time, so persisting the clock may be sufficient. If we add non-seeded evolution, overrides, or historical snapshots (e.g. “conditions at kickoff” stored for replay), those would be saved as part of world state rather than recomputed on every read.

The goal across these phases is one rule: **persist everything that is not a constant** — geography, schedule, clock, and any simulation outputs we choose to treat as authoritative history.

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

### Countries

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/countries` | List all countries (population is sum of city populations) |
| `POST` | `/api/countries` | Create, get, or delete (`action`: `create`, `get`, `delete`) |

**Create a country:**

```json
{
  "action": "create",
  "name": "United States",
  "isoCode": "US",
  "languages": ["English"]
}
```

The server downloads the flag SVG from [flagcdn.com](https://flagcdn.com) and stores it at `/flags/us.svg`.

A country cannot be deleted while it still has cities.

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
  "countryId": "<country-id>",
  "region": "New York",
  "population": 8336817,
  "latitude": 40.7128,
  "longitude": -74.006,
  "timezone": "America/New_York"
}
```

`population` must be a non-negative integer. Every city **must** include a valid `countryId` referencing an existing country — free-text country names are not accepted. `region` is optional and holds a state, province, or administrative subdivision (use it to distinguish cities with the same name in one country, e.g. `Columbia` in Missouri vs South Carolina). A location cannot be deleted while it still has venues or colleges.

### Colleges

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/colleges` | List all colleges |
| `POST` | `/api/colleges` | Create, get, delete, or list by location (`action`: `create`, `get`, `delete`, `listByLocation`) |

**Create a college within a city:**

```json
{
  "action": "create",
  "locationId": "<location-id>",
  "name": "University of Michigan",
  "attendance": 52000
}
```

`attendance` is approximate total enrollment. Every college **must** reference an existing `locationId`.

### Leagues

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/leagues` | List all leagues |
| `POST` | `/api/leagues` | Create, get, or delete (`action`: `create`, `get`, `delete`) |

**Create a league:**

```json
{
  "action": "create",
  "name": "National Football League",
  "abbreviation": "NFL"
}
```

Leagues are top-level containers for professional sports teams.

### Conferences

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/conferences` | List all conferences |
| `POST` | `/api/conferences` | Create, get, delete, or list by league (`action`: `create`, `get`, `delete`, `listByLeague`) |

### Divisions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/divisions` | List all divisions |
| `POST` | `/api/divisions` | Create, get, delete, or list by conference (`action`: `create`, `get`, `delete`, `listByConference`) |

### Teams

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/teams` | List all teams |
| `POST` | `/api/teams` | Create, get, delete, list by division, or list by league (`action`: `create`, `get`, `delete`, `listByDivision`, `listByLeague`) |

**Create a team:**

```json
{
  "action": "create",
  "divisionId": "<division-id>",
  "venueId": "<venue-id>",
  "name": "Buffalo Bills",
  "abbreviation": "BUF",
  "logo": "/logos/nfl/buf.png"
}
```

Every team **must** reference an existing division and home venue. A venue cannot be deleted while teams still reference it.

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

1. **Install dependencies** — `npm install`
2. **Download flags (optional but recommended)** — `npm run download-flags`
3. **Start the world clock** — `POST /api/world-clock/start`
4. **Create a country** — `POST /api/countries` with `action: "create"`
5. **Create a location** — `POST /api/locations` with `action: "create"` and `countryId`
6. **Create venues** in that city — `POST /api/venues` with `action: "create"`
7. **Check the calendar** — `GET /api/calendar`
8. **Get local time at a venue** — `POST /api/venues` with `action: "localTime"`
9. **Schedule an event** — `POST /api/events` with `action: "create"`
10. **List active events** — `POST /api/events` with `action: "listActive"`
11. **Get weather for an event** — `POST /api/weather` with `action: "getForEvent"`

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm test             # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run download-flags  # Download all 200 country flag SVGs to public/flags/
npm run download-nfl-logos  # Download all 32 NFL team logos to public/logos/nfl/
npm run download-mlb-logos  # Download all 30 MLB team logos to public/logos/mlb/
npm run download-nba-logos  # Download all 30 NBA team logos to public/logos/nba/
npm run download-nhl-logos  # Download all 32 NHL team logos to public/logos/nhl/
npm run download-mls-logos  # Download all 30 MLS team logos to public/logos/mls/
npm run download-wnba-logos  # Download all 13 WNBA team logos to public/logos/wnba/
npm run download-league-logos  # Download NFL/MLB/NBA/NHL/MLS/WNBA league logos to public/logos/leagues/
npm run generate-ncaa-locations  # Regenerate NCAA campus cities and college seed data
npm run lint         # Lint
```

## Project structure

```
src/
  modules/
    world-clock/     # UTC clock, tick rate, start/stop
    calendar/        # US Gregorian calendar transforms
    countries/       # Nations with flag, languages, aggregated population
    locations/       # Cities belonging to a country
    colleges/        # US colleges and universities within a location
    leagues/         # Professional sports league containers
    conferences/     # League subdivisions
    divisions/       # Conference subdivisions
    teams/           # Professional franchises
    venues/          # Venues within a location
    events/          # Scheduled events at venue-local times
    weather/         # Seasonal baseline + moving weather systems
  persistence/       # SQLite DB, migrations, repositories, seed data
  app/
    api/             # API route handlers
    api-docs/        # Interactive API explorer
  lib/
    openapi-spec.ts  # API definitions (single source of truth)
```

## License

Private project.
