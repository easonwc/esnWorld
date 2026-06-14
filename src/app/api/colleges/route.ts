import { jsonResponse } from "@/lib/api-response";
import { listGetResponse } from "@/lib/list-route";
import {
  CollegeError,
  countColleges,
  executeCollege,
  listColleges,
  type CollegeInput,
} from "@/modules/colleges";
import { LocationError } from "@/modules/locations";

export const dynamic = "force-dynamic";

function errorResponse(error: CollegeError | LocationError) {
  const status =
    error.code === "COLLEGE_NOT_FOUND" || error.code === "LOCATION_NOT_FOUND"
      ? 404
      : 400;

  return jsonResponse(
    { error: { code: error.code, message: error.message } },
    status,
  );
}

export async function GET(request: Request) {
  return listGetResponse(request, listColleges, countColleges);
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

  const input = body as CollegeInput;

  if (!input || typeof input !== "object" || !("action" in input)) {
    return jsonResponse(
      { error: { code: "INVALID_INPUT", message: "action is required" } },
      400,
    );
  }

  try {
    const output = await executeCollege(input);
    return jsonResponse({ data: output });
  } catch (error) {
    if (error instanceof CollegeError || error instanceof LocationError) {
      return errorResponse(error);
    }
    throw error;
  }
}
