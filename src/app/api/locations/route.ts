import { jsonResponse } from "@/lib/api-response";
import {
  executeLocation,
  listLocations,
  LocationError,
  type LocationInput,
} from "@/modules/locations";

export const dynamic = "force-dynamic";

function errorResponse(error: LocationError) {
  const status = error.code === "LOCATION_NOT_FOUND" ? 404 : 400;

  return jsonResponse(
    { error: { code: error.code, message: error.message } },
    status,
  );
}

export async function GET() {
  const locations = listLocations();
  return jsonResponse({ data: locations });
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

  const input = body as LocationInput;

  if (!input || typeof input !== "object" || !("action" in input)) {
    return jsonResponse(
      { error: { code: "INVALID_INPUT", message: "action is required" } },
      400,
    );
  }

  try {
    const output = executeLocation(input);
    return jsonResponse({ data: output });
  } catch (error) {
    if (error instanceof LocationError) {
      return errorResponse(error);
    }
    throw error;
  }
}
