import { jsonResponse } from "@/lib/api-response";
import { listGetResponse } from "@/lib/list-route";
import { LocationError } from "@/modules/locations";
import {
  countVenues,
  executeVenue,
  listVenues,
  VenueError,
  type VenueInput,
} from "@/modules/venues";

export const dynamic = "force-dynamic";

function errorResponse(error: VenueError | LocationError) {
  const status =
    error.code === "VENUE_NOT_FOUND" || error.code === "LOCATION_NOT_FOUND"
      ? 404
      : 400;

  return jsonResponse(
    { error: { code: error.code, message: error.message } },
    status,
  );
}

export async function GET(request: Request) {
  return listGetResponse(request, listVenues, countVenues);
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

  const input = body as VenueInput;

  if (!input || typeof input !== "object" || !("action" in input)) {
    return jsonResponse(
      { error: { code: "INVALID_INPUT", message: "action is required" } },
      400,
    );
  }

  try {
    const output = await executeVenue(input);
    return jsonResponse({ data: output });
  } catch (error) {
    if (error instanceof VenueError || error instanceof LocationError) {
      return errorResponse(error);
    }
    throw error;
  }
}
