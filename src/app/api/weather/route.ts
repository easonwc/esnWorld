import { jsonResponse } from "@/lib/api-response";
import { EventError } from "@/modules/events";
import { LocationError } from "@/modules/locations";
import { VenueError } from "@/modules/venues";
import {
  WeatherError,
  executeWeather,
  type WeatherInput,
} from "@/modules/weather";

export const dynamic = "force-dynamic";

function errorResponse(
  error: WeatherError | VenueError | LocationError | EventError,
) {
  const status =
    error.code === "VENUE_NOT_FOUND" ||
    error.code === "LOCATION_NOT_FOUND" ||
    error.code === "EVENT_NOT_FOUND"
      ? 404
      : 400;

  return jsonResponse(
    { error: { code: error.code, message: error.message } },
    status,
  );
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      { error: { code: "INVALID_JSON", message: "Request body must be valid JSON" } },
      400,
    );
  }

  const input = body as WeatherInput;

  if (!input || typeof input !== "object" || !("action" in input)) {
    return jsonResponse(
      { error: { code: "INVALID_INPUT", message: "action is required" } },
      400,
    );
  }

  try {
    const output = await executeWeather(input);
    return jsonResponse({ data: output });
  } catch (error) {
    if (
      error instanceof WeatherError ||
      error instanceof VenueError ||
      error instanceof LocationError ||
      error instanceof EventError
    ) {
      return errorResponse(error);
    }
    throw error;
  }
}
