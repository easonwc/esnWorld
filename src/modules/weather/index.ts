import { getEventStore, EventError } from "@/modules/events";
import { getWorldClockService } from "@/modules/world-clock";
import { getLocationStore, LocationError, parseIsoUtc } from "@/modules/locations";
import { getVenueStore, VenueError } from "@/modules/venues";
import { loadWeatherConfig } from "./config";
import { WeatherError, WeatherErrorCodes } from "./errors";
import { createWeatherSystems } from "./systems";
import { listSystemsAtTime, transformWeatherAtPoint } from "./transform";
import type {
  WeatherInput,
  WeatherResult,
  WeatherSystem,
} from "./types";

function validateVenueId(venueId: unknown): string {
  if (typeof venueId !== "string" || venueId.trim().length === 0) {
    throw new WeatherError(
      WeatherErrorCodes.MISSING_VENUE_ID,
      "venueId is required",
    );
  }
  return venueId.trim();
}

function validateLocationId(locationId: unknown): string {
  if (typeof locationId !== "string" || locationId.trim().length === 0) {
    throw new WeatherError(
      WeatherErrorCodes.MISSING_LOCATION_ID,
      "locationId is required",
    );
  }
  return locationId.trim();
}

function validateEventId(eventId: unknown): string {
  if (typeof eventId !== "string" || eventId.trim().length === 0) {
    throw new WeatherError(
      WeatherErrorCodes.MISSING_EVENT_ID,
      "eventId is required",
    );
  }
  return eventId.trim();
}

function resolveIsoUtc(isoUtc?: string): string {
  return isoUtc === undefined
    ? getWorldClockService().getCurrentOutput().isoUtc
    : parseIsoUtc(isoUtc);
}

export class WeatherService {
  private readonly systems: WeatherSystem[];
  private readonly config = loadWeatherConfig();

  constructor(systems?: WeatherSystem[]) {
    this.systems =
      systems ??
      createWeatherSystems(
        this.config.seed,
        this.config.worldStartEpochMs,
      );
  }

  getSystems(): WeatherSystem[] {
    return [...this.systems];
  }

  getConfig() {
    return this.config;
  }
}

const globalForWeather = globalThis as typeof globalThis & {
  __weatherService?: WeatherService;
};

export function getWeatherService(): WeatherService {
  if (!globalForWeather.__weatherService) {
    globalForWeather.__weatherService = new WeatherService();
  }
  return globalForWeather.__weatherService;
}

export function resetWeatherService(systems?: WeatherSystem[]): WeatherService {
  const service = new WeatherService(systems);
  globalForWeather.__weatherService = service;
  return service;
}

async function weatherAtVenue(
  venueId: string,
  isoUtc: string,
): Promise<WeatherResult> {
  let venue;

  try {
    venue = await getVenueStore().get(venueId);
  } catch (error) {
    if (error instanceof VenueError) {
      throw new WeatherError(WeatherErrorCodes.VENUE_NOT_FOUND, error.message);
    }
    throw error;
  }

  const location = await getLocationStore().get(venue.locationId);
  const service = getWeatherService();

  return transformWeatherAtPoint(
    {
      latitude: venue.latitude,
      longitude: venue.longitude,
      isoUtc,
      locationId: location.id,
      locationName: location.name,
      country: location.countryName,
      timezone: location.timezone,
      venueId: venue.id,
      venueName: venue.name,
      isIndoor: venue.isIndoor,
      weatherApplies: !venue.isIndoor,
    },
    service.getSystems(),
    service.getConfig(),
  );
}

async function weatherAtLocation(
  locationId: string,
  isoUtc: string,
): Promise<WeatherResult> {
  let location;

  try {
    location = await getLocationStore().get(locationId);
  } catch (error) {
    if (error instanceof LocationError) {
      throw new WeatherError(
        WeatherErrorCodes.LOCATION_NOT_FOUND,
        error.message,
      );
    }
    throw error;
  }

  const service = getWeatherService();

  return transformWeatherAtPoint(
    {
      latitude: location.latitude,
      longitude: location.longitude,
      isoUtc,
      locationId: location.id,
      locationName: location.name,
      country: location.countryName,
      timezone: location.timezone,
      weatherApplies: true,
    },
    service.getSystems(),
    service.getConfig(),
  );
}

async function weatherForEvent(
  eventId: string,
  phase: "start" | "end" = "start",
): Promise<WeatherResult> {
  let event;

  try {
    event = await getEventStore().get(eventId);
  } catch (error) {
    if (error instanceof EventError) {
      throw new WeatherError(WeatherErrorCodes.EVENT_NOT_FOUND, error.message);
    }
    throw error;
  }

  const isoUtc = phase === "end" ? event.isoUtcEnd : event.isoUtcStart;
  return weatherAtVenue(event.venueId, isoUtc);
}

export async function executeWeather(
  input: WeatherInput,
): Promise<WeatherResult> {
  switch (input.action) {
    case "getAtVenue":
      return weatherAtVenue(
        validateVenueId(input.venueId),
        resolveIsoUtc(input.isoUtc),
      );

    case "getAtLocation":
      return weatherAtLocation(
        validateLocationId(input.locationId),
        resolveIsoUtc(input.isoUtc),
      );

    case "getForEvent":
      return weatherForEvent(
        validateEventId(input.eventId),
        input.phase ?? "start",
      );

    case "listSystems": {
      const isoUtc = resolveIsoUtc(input.isoUtc);
      return {
        isoUtc,
        systems: listSystemsAtTime(getWeatherService().getSystems(), isoUtc),
      };
    }

    default: {
      const unknownAction = (input as { action: string }).action;
      throw new WeatherError(
        WeatherErrorCodes.INVALID_ACTION,
        `Unknown action: ${unknownAction}`,
      );
    }
  }
}

export * from "./types";
export * from "./errors";
export { loadWeatherConfig } from "./config";
export { computeSeasonalBaseline } from "./seasonal";
export { createWeatherSystems, systemPositionAt } from "./systems";
export { transformWeatherAtPoint } from "./transform";
