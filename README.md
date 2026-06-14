# ESN World Engine

A server-side World Engine built with **Next.js**, **Node.js**, and **TypeScript**. It provides APIs for a simulated world with a UTC clock, US calendar, and (planned) location-based event scheduling.

## Modules

| Module | Status | Description |
|--------|--------|-------------|
| **World Clock** | ✅ | Canonical UTC time source with configurable simulated tick rate |
| **Calendar** | ✅ | US Gregorian calendar derived from world clock UTC time |
| **Locations** | 🔜 | Venues with latitude/longitude and local timezone offsets |
| **Events** | 🔜 | Parallel events scheduled at venue-local times |

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

### Calendar

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/calendar` | Get calendar date for current world clock time |
| `POST` | `/api/calendar` | Convert UTC to calendar (`action`: `fromIso`, `fromDate`) |

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/openapi` | OpenAPI 3.0 JSON spec |
| — | `/api-docs` | Interactive API explorer (Swagger-style) |

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
  app/
    api/             # API route handlers
    api-docs/        # Interactive API explorer
  lib/
    openapi-spec.ts  # API definitions (single source of truth)
```

## License

Private project.
