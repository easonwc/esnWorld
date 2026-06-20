import { jsonResponse } from "@/lib/api-response";
import { listGetResponse } from "@/lib/list-route";
import { CountryError } from "@/modules/countries";
import {
  HumanError,
  countHumans,
  executeHuman,
  listHumans,
  type HumanInput,
} from "@/modules/humans";
import { LocationError } from "@/modules/locations";

export const dynamic = "force-dynamic";

function errorResponse(
  error: HumanError | LocationError | CountryError,
) {
  const status =
    error.code === "HUMAN_NOT_FOUND" ||
    error.code === "BIRTH_LOCATION_NOT_FOUND" ||
    error.code === "NATIONALITY_COUNTRY_NOT_FOUND" ||
    error.code === "LOCATION_NOT_FOUND" ||
    error.code === "COUNTRY_NOT_FOUND"
      ? 404
      : 400;

  return jsonResponse(
    { error: { code: error.code, message: error.message } },
    status,
  );
}

export async function GET(request: Request) {
  return listGetResponse(request, listHumans, countHumans);
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

  const input = body as HumanInput;

  if (!input || typeof input !== "object" || !("action" in input)) {
    return jsonResponse(
      { error: { code: "INVALID_INPUT", message: "action is required" } },
      400,
    );
  }

  try {
    const output = await executeHuman(input);
    return jsonResponse({ data: output });
  } catch (error) {
    if (
      error instanceof HumanError ||
      error instanceof LocationError ||
      error instanceof CountryError
    ) {
      return errorResponse(error);
    }
    throw error;
  }
}
