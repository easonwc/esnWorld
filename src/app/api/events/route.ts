import { jsonResponse } from "@/lib/api-response";
import { listGetResponse } from "@/lib/list-route";
import { LocationError } from "@/modules/locations";
import { VenueError } from "@/modules/venues";
import {
  countEvents,
  EventError,
  executeEvent,
  listEvents,
  type EventInput,
} from "@/modules/events";

export const dynamic = "force-dynamic";

function errorResponse(error: EventError | LocationError | VenueError) {
  const status =
    error.code === "EVENT_NOT_FOUND" ||
    error.code === "VENUE_NOT_FOUND" ||
    error.code === "LOCATION_NOT_FOUND"
      ? 404
      : 400;

  return jsonResponse(
    { error: { code: error.code, message: error.message } },
    status,
  );
}

export async function GET(request: Request) {
  return listGetResponse(
    request,
    (options) => listEvents(undefined, options),
    countEvents,
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

  const input = body as EventInput;

  if (!input || typeof input !== "object" || !("action" in input)) {
    return jsonResponse(
      { error: { code: "INVALID_INPUT", message: "action is required" } },
      400,
    );
  }

  try {
    const output = await executeEvent(input);
    return jsonResponse({ data: output });
  } catch (error) {
    if (
      error instanceof EventError ||
      error instanceof LocationError ||
      error instanceof VenueError
    ) {
      return errorResponse(error);
    }
    throw error;
  }
}
