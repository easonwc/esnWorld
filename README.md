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
| **League** | A professional sports league container for teams, with logo | National Football League (NFL) — `/logos/leagues/nfl.png` |
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
| **Leagues** | ✅ | Professional sports league containers (name, abbreviation, logo) |
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
| `DATABASE_PATH` | `./data/world.db` | SQLite database path |
| `WORLD_DATABASE_RESET_ON_STARTUP` | `false` | Truncate world-tier tables on startup (also clears session tier first) |
| `DATABASE_RESET_ON_STARTUP` | `false` | Deprecated alias for `WORLD_DATABASE_RESET_ON_STARTUP` |
| `SESSION_RESET_ON_STARTUP` | `false` | Truncate session-tier tables only (events, world clock state) |
| `FULL_DATABASE_RESET_ON_STARTUP` | `false` | Delete the SQLite file entirely on startup |
| `LOCATIONS_SEED_ON_STARTUP` | `false` | When `true`, merge seed countries, cities, and colleges on server startup |
| `NFL_SEED_ON_STARTUP` | `false` | Merge NFL league hierarchy (see [Professional sports league seeds](#professional-sports-league-seeds)) |
| `MLB_SEED_ON_STARTUP` | `false` | Merge MLB league hierarchy |
| `NBA_SEED_ON_STARTUP` | `false` | Merge NBA league hierarchy |
| `NHL_SEED_ON_STARTUP` | `false` | Merge NHL league hierarchy |
| `MLS_SEED_ON_STARTUP` | `false` | Merge MLS league hierarchy |
| `WNBA_SEED_ON_STARTUP` | `false` | Merge WNBA league hierarchy |
| `TENNIS_VENUES_SEED_ON_STARTUP` | `false` | Merge tennis `multi_resource` venues with numbered courts (requires host cities — enable `LOCATIONS_SEED_ON_STARTUP` first) |
| `GOLF_VENUES_SEED_ON_STARTUP` | `false` | Merge golf `multi_resource` venues with tee groups (shared by PGA, future LPGA, and DP World catalogs) |
| `TENNIS_GOLF_VENUES_SEED_ON_STARTUP` | `false` | **Deprecated** — enables both `TENNIS_VENUES_SEED_ON_STARTUP` and `GOLF_VENUES_SEED_ON_STARTUP` |
| `PGA_TOUR_SEED_ON_STARTUP` | `false` | Merge PGA Tour tournament catalog and venue pools (auto-merges required golf cities and venues) |
| `GOLF_TOUR_LOGO_DOWNLOAD_ON_STARTUP` | `false` | Download golf tour logos (PGA, future LPGA) on startup |
| `PGA_TOUR_ENABLED` | `false` | Run PGA season scheduler on world-clock transitions (Oct 1 release → next calendar year) |
| `FLAG_DOWNLOAD_ON_STARTUP` | `false` | Download country flag SVGs on server startup |
| `NFL_LOGO_DOWNLOAD_ON_STARTUP` | `false` | Download NFL team and league logos on startup |
| `MLB_LOGO_DOWNLOAD_ON_STARTUP` | `false` | Download MLB team and league logos on startup |
| `NBA_LOGO_DOWNLOAD_ON_STARTUP` | `false` | Download NBA team and league logos on startup |
| `NHL_LOGO_DOWNLOAD_ON_STARTUP` | `false` | Download NHL team and league logos on startup |
| `MLS_LOGO_DOWNLOAD_ON_STARTUP` | `false` | Download MLS team and league logos on startup |
| `WNBA_LOGO_DOWNLOAD_ON_STARTUP` | `false` | Download WNBA team and league logos on startup |
| `COLLEGE_LOGO_DOWNLOAD_ON_STARTUP` | `false` | Download NCAA college logos on startup |

League seed flags are independent — enable any combination. Each seed also merges countries and supplemental stadium cities as needed, so they can run without `LOCATIONS_SEED_ON_STARTUP` (though enabling both is recommended for a complete world).

League seeds assign logo paths but do **not** download images unless the matching `{LEAGUE}_LOGO_DOWNLOAD_ON_STARTUP=true`. College seeds assign logo paths but do **not** download images unless `COLLEGE_LOGO_DOWNLOAD_ON_STARTUP=true`.

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

- **Server startup** — when `FLAG_DOWNLOAD_ON_STARTUP=true`, syncs missing flag files for countries in the database
- **Create country API** — `POST /api/countries` with `isoCode` respects `FLAG_DOWNLOAD_ON_STARTUP` (set `true` to download on create, or run `npm run download-flags`)

By default, flag downloads are **off** on startup. Image paths are still stored; use `npm run download-flags` or set `FLAG_DOWNLOAD_ON_STARTUP=true` to fetch files.

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
| Leagues | Leagues | ✅ Phase 1 | SQLite via `DATABASE_PATH`; name, abbreviation, logo |
| Conferences | Conferences | ✅ Phase 1 | SQLite via `DATABASE_PATH`; belong to a league |
| Divisions | Divisions | ✅ Phase 1 | SQLite via `DATABASE_PATH`; belong to a conference |
| Teams | Teams | ✅ Phase 1 | SQLite via `DATABASE_PATH`; belong to a division and home venue |
| Venues | Venues | ✅ Phase 1 | SQLite via `DATABASE_PATH` |
| Scheduled events | Events | ✅ | SQLite session tier; hierarchy + venue conflict rules |
| World clock | World Clock | ✅ (session tier) | Ticker state persisted in SQLite; status still derived |
| Weather systems | Weather | ❌ (derived) | Positions and conditions are computed from `WEATHER_SEED` + world time today; no separate store yet |

On first run, the database is **empty** unless you set `LOCATIONS_SEED_ON_STARTUP=true`. Persistence splits into two tiers in one SQLite file:

- **World tier** — countries, cities, colleges, venues, leagues, teams (rarely reset). Use `WORLD_DATABASE_RESET_ON_STARTUP=true` for a one-time atlas rebuild (also clears session data).
- **Session tier** — events and world clock state (reset each season or test run). Use `SESSION_RESET_ON_STARTUP=true` to clear the calendar without touching geography or sports structure.
- **Full reset** — `FULL_DATABASE_RESET_ON_STARTUP=true` deletes the SQLite file entirely.

Set any reset flag for one startup, then set it back to `false`.

### World seed (optional)

Set `LOCATIONS_SEED_ON_STARTUP=true` in `.env` to merge **200 countries**, **452 cities**, and **225 US colleges and universities** when the server starts. Countries are seeded first (ISO code, languages, local flag image), then cities are linked by country name, then colleges are linked to their campus cities.

Merge behavior:

- **Empty database** — all seed countries, cities, and colleges are inserted.
- **Existing database** — only entries not already present are added (countries by `name`; cities by `name` + `region` + `countryName`; colleges by institution `name`, case-insensitive). Nothing is overwritten or duplicated.
- **Disabled** (`false`, the default) — no seed runs; the database stays as-is.

Seed catalogs: `src/persistence/seed/countries.data.ts`, `src/persistence/seed/locations.data.ts`, `src/persistence/seed/ncaa-locations.data.ts` (auto-generated from `scripts/generate-ncaa-locations.ts`), `src/persistence/seed/tennis-locations.data.ts`, `src/persistence/seed/golf-locations.data.ts`, `src/persistence/seed/tennis-venues.data.ts`, `src/persistence/seed/golf-venues.data.ts`, and `src/persistence/seed/colleges.data.ts` (auto-generated alongside NCAA locations).

The city catalog includes major world metros, NFL/NBA/MLB/NHL/MLS/WNBA markets, **209 NCAA Division I campus cities**, and **47 tennis and golf event host cities** (Grand Slams, ATP/WTA Masters staples, golf majors, and flagship PGA/DP World Tour venues). **United States seed cities always include a `region` set to the state** (or District of Columbia). International cities may omit `region`.

The college catalog lists **225 NCAA Division I football programs** (FBS + FCS) with approximate enrollment. Each college links to its campus city by `locationName` + `locationRegion` + `countryName`. Colleges with a known ESPN team id also get a logo path at `/logos/ncaa/{espnId}.png` (224 of 225 schools; Washington and Lee University has no ESPN mapping).

#### College logos

On server startup, the college seed assigns logo paths on college records. **Network downloads are off by default.** Set `COLLEGE_LOGO_DOWNLOAD_ON_STARTUP=true` to fetch images during startup, or use `npm run download-college-logos` anytime.

When downloads are enabled:

1. **College logos** are saved to `public/logos/ncaa/` as `{espnId}.png` and stored on each college record.

Logo source: [ESPN CDN](https://a.espncdn.com/i/teamlogos/ncaa/500/{espnId}.png). ESPN ids are mapped in `src/persistence/logos/college-espn-ids.ts` (regenerate with `npm run generate-college-espn-ids`).

Downloaded images are gitignored; each machine fetches its own copy. Vitest always skips downloads. Paths are assigned even when downloads are disabled.

**Download college logos manually:**

```bash
npm run download-college-logos  # 224 NCAA colleges with ESPN ids
```

### Professional sports league seeds

Optional startup seeds merge a full professional league hierarchy into SQLite:

```
League → Conference → Division → Team → Venue (home stadium/arena) → Location (city)
```

Each enabled seed is **idempotent**: existing leagues, conferences, divisions, venues, and teams are skipped (teams merge by `league_id` + `abbreviation`, so `KC` can exist in both NFL and MLB). Shared stadiums (e.g. MetLife Stadium, Barclays Center, Lumen Field) are deduplicated by `locationId` + stadium name.

| League | Env flag | Teams | Conferences | Divisions | Team logos | League logo |
|--------|----------|-------|-------------|-----------|------------|-------------|
| NFL | `NFL_SEED_ON_STARTUP` | 32 | 2 (AFC, NFC) | 8 | `/logos/nfl/{abbr}.png` | `/logos/leagues/nfl.png` |
| MLB | `MLB_SEED_ON_STARTUP` | 30 | 2 (AL, NL) | 6 | `/logos/mlb/{abbr}.png` | `/logos/leagues/mlb.png` |
| NBA | `NBA_SEED_ON_STARTUP` | 30 | 2 (East, West) | 6 | `/logos/nba/{abbr}.png` | `/logos/leagues/nba.png` |
| NHL | `NHL_SEED_ON_STARTUP` | 32 | 2 (East, West) | 4 | `/logos/nhl/{abbr}.png` | `/logos/leagues/nhl.png` |
| MLS | `MLS_SEED_ON_STARTUP` | 30 | 2 (East, West) | 2* | `/logos/mls/{abbr}.png` | `/logos/leagues/mls.png` |
| WNBA | `WNBA_SEED_ON_STARTUP` | 13 | 2 (East, West) | 2* | `/logos/wnba/{abbr}.png` | `/logos/leagues/wnba.png` |

\*MLS and WNBA have no formal divisions; each conference uses a single placeholder division to fit the hierarchy.

#### League and team logos

On server startup, each enabled league seed assigns logo paths on team and league records. **Network downloads are off by default.** Set the matching `{LEAGUE}_LOGO_DOWNLOAD_ON_STARTUP=true` (or `FLAG_DOWNLOAD_ON_STARTUP` for flags) to fetch images during startup, or use the `npm run download-*` scripts anytime.

When downloads are enabled:

1. **Team logos** are saved to `public/logos/{league}/` and stored on each team record.
2. **League logos** are saved to `public/logos/leagues/` and stored on the league record.

Logo sources:

| League | Team logo CDN | League logo CDN |
|--------|---------------|-----------------|
| NFL | [NFL.com](https://www.nfl.com) | ESPN |
| MLB, NBA, NHL, WNBA | ESPN | ESPN |
| MLS | [MLSsoccer.com](https://www.mlssoccer.com) | ESPN |

Downloaded images are gitignored; each machine fetches its own copy. Vitest always skips downloads. Paths are assigned even when downloads are disabled.

**Download logos manually:**

```bash
npm run download-nfl-logos      # 32 NFL teams
npm run download-mlb-logos      # 30 MLB teams
npm run download-nba-logos      # 30 NBA teams
npm run download-nhl-logos      # 32 NHL teams
npm run download-mls-logos      # 30 MLS teams
npm run download-wnba-logos     # 13 WNBA teams
npm run download-league-logos   # All six league logos
```

Seed catalogs live in `src/persistence/seed/{league}-teams.data.ts`. Shared merge logic is in `src/persistence/seed/sports-league-seed.ts`.

Per-league details follow below.

### NFL seed (optional)

Set `NFL_SEED_ON_STARTUP=true` in `.env` to merge the full **National Football League** on server startup:

- **1 league** (NFL), with logo at `/logos/leagues/nfl.png`
- **2 conferences** (AFC, NFC)
- **8 divisions**
- **32 teams**, each with a logo path at `/logos/nfl/{abbreviation}.png`
- **~30 stadium venues** (shared stadiums such as MetLife and SoFi are deduplicated), each linked to a city location

NFL seed also ensures countries and locations exist (including 9 supplemental stadium cities such as Orchard Park and Inglewood). It can run independently of `LOCATIONS_SEED_ON_STARTUP`, though enabling both is recommended for a complete world.

Merge behavior is idempotent: existing leagues, conferences, divisions, venues, and teams are skipped (teams merge by league + abbreviation).

Seed catalog: `src/persistence/seed/nfl-teams.data.ts`.

### MLB seed (optional)

Set `MLB_SEED_ON_STARTUP=true` in `.env` to merge the full **Major League Baseball** on server startup:

- **1 league** (MLB), with logo at `/logos/leagues/mlb.png`
- **2 conferences** (American League, National League)
- **6 divisions**
- **30 teams**, each with a logo path at `/logos/mlb/{abbreviation}.png`
- **30 ballpark venues**, each linked to a city location

MLB seed also ensures countries and locations exist (including supplemental stadium cities such as St. Petersburg and Cumberland). It can run alongside `NFL_SEED_ON_STARTUP` — team abbreviations are scoped per league (e.g. both NFL and MLB have a `KC` team).

Seed catalog: `src/persistence/seed/mlb-teams.data.ts`.

### NBA seed (optional)

Set `NBA_SEED_ON_STARTUP=true` in `.env` to merge the full **National Basketball Association** on server startup:

- **1 league** (NBA), with logo at `/logos/leagues/nba.png`
- **2 conferences** (Eastern, Western)
- **6 divisions**
- **30 teams**, each with a logo path at `/logos/nba/{abbreviation}.png`
- **30 arena venues**, each linked to a city location

NBA seed also ensures countries and locations exist (including supplemental arena cities such as Brooklyn and Inglewood). It can run alongside the other league seeds — team abbreviations are scoped per league.

Seed catalog: `src/persistence/seed/nba-teams.data.ts`.

### NHL seed (optional)

Set `NHL_SEED_ON_STARTUP=true` in `.env` to merge the full **National Hockey League** on server startup:

- **1 league** (NHL), with logo at `/logos/leagues/nhl.png`
- **2 conferences** (Eastern, Western)
- **4 divisions** (Atlantic, Metropolitan, Central, Pacific)
- **32 teams**, each with a logo path at `/logos/nhl/{abbreviation}.png`
- **Arena venues** (shared multi-sport buildings such as TD Garden and Madison Square Garden are deduplicated), each linked to a city location

NHL seed also ensures countries and locations exist (including supplemental arena cities such as Newark, Elmont, and Saint Paul). It can run alongside the other league seeds.

Seed catalog: `src/persistence/seed/nhl-teams.data.ts`.

### MLS seed (optional)

Set `MLS_SEED_ON_STARTUP=true` in `.env` to merge the full **Major League Soccer** on server startup:

- **1 league** (MLS), with logo at `/logos/leagues/mls.png`
- **2 conferences** (Eastern, Western)
- **2 divisions** (one per conference — MLS has no formal divisions since 2020)
- **30 teams**, each with a logo path at `/logos/mls/{abbreviation}.png`
- **Stadium venues** (shared multi-sport buildings such as Gillette Stadium and Lumen Field are deduplicated), each linked to a city location

MLS seed also ensures countries and locations exist (including supplemental stadium cities such as Harrison, Fort Lauderdale, and Commerce City). It can run alongside the other league seeds.

Seed catalog: `src/persistence/seed/mls-teams.data.ts`.

### WNBA seed (optional)

Set `WNBA_SEED_ON_STARTUP=true` in `.env` to merge the full **Women's National Basketball Association** on server startup:

- **1 league** (WNBA), with logo at `/logos/leagues/wnba.png`
- **2 conferences** (Eastern, Western)
- **2 divisions** (one per conference)
- **13 teams**, each with a logo path at `/logos/wnba/{abbreviation}.png`
- **Arena venues** (shared multi-sport buildings such as Barclays Center and Target Center are deduplicated), each linked to a city location

WNBA seed also ensures countries and locations exist (including supplemental arena cities such as College Park, Uncasville, and Arlington). It can run alongside the other league seeds.

Seed catalog: `src/persistence/seed/wnba-teams.data.ts`.

### Tennis and golf venue seeds (optional)

Tennis and golf venues are seeded separately so each sport (and future golf tours like LPGA) can grow independently.

Set `TENNIS_VENUES_SEED_ON_STARTUP=true` to merge **33** tennis `multi_resource` venues with numbered courts (`Court 1` … `Court N`).

Set `GOLF_VENUES_SEED_ON_STARTUP=true` to merge **59** golf `multi_resource` venues with **30 tee groups** each (`Tee Group 1` … `Tee Group 30`).

The legacy `TENNIS_GOLF_VENUES_SEED_ON_STARTUP=true` flag still enables **both** seeds.

- **33 tennis complexes** — four Grand Slams, Masters 1000 and tour staples, plus Miami, Cincinnati, Rome, Madrid, Shanghai, Beijing, Montreal, and Toronto
- **59 golf courses** — majors, full PGA Tour calendar venues, Open Championship rotation venues, and Ryder Cup hosts (shared catalog for PGA, future LPGA, and DP World)

Host cities must already exist in the database — enable `LOCATIONS_SEED_ON_STARTUP=true` first (or create cities via the API). Seeds are idempotent: existing venues and resources are skipped.

Seed catalogs: `src/persistence/seed/tennis-venues.data.ts` and `src/persistence/seed/golf-venues.data.ts`.

### PGA Tour (optional)

Set `PGA_TOUR_SEED_ON_STARTUP=true` to merge the **PGA Tour** catalog (**47** tournaments: Phase A signature & designated events plus Phase B weekly and fall swing stops). Also merges required golf venues and host cities as needed. The tour record includes a **logo** path (`/logos/golf-tours/pga.svg`).

Set `GOLF_TOUR_LOGO_DOWNLOAD_ON_STARTUP=true` to fetch tour logo files on startup (add LPGA to `GOLF_TOUR_LOGO_DOWNLOAD_URLS` when that catalog lands).

Set `PGA_TOUR_ENABLED=true` to run the **season scheduler** when the world clock crosses **October 1** (`PGA_TOUR_SCHEDULE_RELEASE_*`, default midnight `America/New_York`). The scheduler materializes the **next calendar year** as event trees (tournament → rounds → tee groups). Scheduling uses hybrid clock hooks: mutations (`set`/`advance`/`stop`), a 1-second interval while the clock is running, and manual `POST /api/golf-scheduling` with `action: "processNow"`. If any tournament fails validation, the **entire season batch fails** and an error is logged.

Seed catalog: `src/persistence/seed/pga-tour.data.ts`.

### Future enhancements

1. ~~**Seed data**~~ — ✅ Optional country, city, and college catalogs via `LOCATIONS_SEED_ON_STARTUP`; optional NFL, MLB, NBA, NHL, MLS, and WNBA league seeds with team and league logos; optional tennis and golf `multi_resource` venue seeds via `TENNIS_VENUES_SEED_ON_STARTUP` / `GOLF_VENUES_SEED_ON_STARTUP`.
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

The server stores the flag path at `/flags/us.svg`. The SVG file is downloaded only when `FLAG_DOWNLOAD_ON_STARTUP=true` or you run `npm run download-flags`.

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

`population` must be a non-negative integer. Every city **must** include a valid `countryId` referencing an existing country — free-text country names are not accepted. `region` is optional when creating locations through the API; use it to distinguish cities with the same name in one country (e.g. `Columbia` in Missouri vs South Carolina). Seed data for United States cities always sets `region` to the state. A location cannot be deleted while it still has venues or colleges.

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

`attendance` is approximate total enrollment. Every college **must** reference an existing `locationId`. College responses include a `logo` path (empty string when no logo is mapped).

### Leagues

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/leagues` | List all leagues |
| `POST` | `/api/leagues` | Create, get, delete, or list children (`action`: `create`, `get`, `delete`, `listConferences`, `listDivisions`, `listTeams`) |

**List conferences in a league:**

```json
{
  "action": "listConferences",
  "leagueId": "<league-id>"
}
```

**List divisions in a league:**

```json
{
  "action": "listDivisions",
  "leagueId": "<league-id>"
}
```

**List teams in a league:**

```json
{
  "action": "listTeams",
  "leagueId": "<league-id>"
}
```

**Create a league:**

```json
{
  "action": "create",
  "name": "National Football League",
  "abbreviation": "NFL"
}
```

Leagues are top-level containers for professional sports teams. Leagues created via the API start with an empty `logo` field; leagues merged from startup seeds include a logo path at `/logos/leagues/{abbreviation}.png` (the file is downloaded only when `{LEAGUE}_LOGO_DOWNLOAD_ON_STARTUP=true` or you run `npm run download-league-logos`).

### Conferences

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/conferences` | List all conferences |
| `POST` | `/api/conferences` | Create, get, delete, or list by league (`action`: `create`, `get`, `delete`, `listByLeague`) |

### Divisions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/divisions` | List all divisions |
| `POST` | `/api/divisions` | Create, get, delete, list by conference, or list by league (`action`: `create`, `get`, `delete`, `listByConference`, `listByLeague`) |

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
| `POST` | `/api/venues` | Create, get, delete, list by location, local time, or manage resources (`action`: `create`, `get`, `delete`, `listByLocation`, `localTime`, `createResource`, `listResources`, `getResource`, `deleteResource`) |

**Create a venue within a city:**

```json
{
  "action": "create",
  "locationId": "<location-id>",
  "name": "Madison Square Garden",
  "latitude": 40.7505,
  "longitude": -73.9934,
  "isIndoor": true,
  "schedulingMode": "exclusive"
}
```

Local time at a venue uses the parent location's timezone.

**Indoor vs outdoor:** Set `isIndoor: true` for venues where weather does not affect events — including fully indoor arenas and **retractable-roof venues** (hybrid venues count as indoor in this simulation). Use `isIndoor: false` for outdoor-only venues such as open-air stadiums and golf courses.

**Scheduling modes:**

- `exclusive` (default) — one booking at a time for the whole venue. Stadiums and arenas use this mode.
- `multi_resource` — parallel bookings via schedulable **venue resources** (courts, tee groups, lanes). Weather remains holistic at the venue level.

**Create a resource on a multi_resource venue:**

```json
{
  "action": "createResource",
  "venueId": "<venue-id>",
  "name": "Court 17",
  "resourceType": "court"
}
```

Resource types: `court`, `tee_group`, `lane`, `generic`.

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

On **exclusive** venues, overlapping unrelated events at the same venue are rejected unless one is an ancestor of the other. On **multi_resource** venues, optional `venueResourceId` binds a leaf event to a specific resource; parallel matches on different resources are allowed, while container events (no `venueResourceId`) only conflict with other containers.

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
npm run download-college-logos  # Download NCAA college logos to public/logos/ncaa/
npm run download-league-logos  # Download NFL/MLB/NBA/NHL/MLS/WNBA league logos to public/logos/leagues/
npm run generate-ncaa-locations  # Regenerate NCAA campus cities and college seed data
npm run generate-college-espn-ids  # Regenerate ESPN id map for college logos
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
    seed/              # World + league catalogs (nfl, mlb, nba, nhl, mls, wnba)
    logos/             # Team and league logo download config
  app/
    api/             # API route handlers
    api-docs/        # Interactive API explorer
  lib/
    openapi-spec.ts  # API definitions (single source of truth)
```

## License

Private project.
