import { jsonResponse } from "@/lib/api-response";
import { ConferenceError } from "@/modules/conferences";
import {
  DivisionError,
  executeDivision,
  listDivisions,
  type DivisionInput,
} from "@/modules/divisions";

export const dynamic = "force-dynamic";

function errorResponse(error: DivisionError | ConferenceError) {
  const status =
    error.code === "DIVISION_NOT_FOUND" || error.code === "CONFERENCE_NOT_FOUND"
      ? 404
      : 400;

  return jsonResponse(
    { error: { code: error.code, message: error.message } },
    status,
  );
}

export async function GET() {
  const divisions = await listDivisions();
  return jsonResponse({ data: divisions });
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

  const input = body as DivisionInput;

  if (!input || typeof input !== "object" || !("action" in input)) {
    return jsonResponse(
      { error: { code: "INVALID_INPUT", message: "action is required" } },
      400,
    );
  }

  try {
    const output = await executeDivision(input);
    return jsonResponse({ data: output });
  } catch (error) {
    if (error instanceof DivisionError || error instanceof ConferenceError) {
      return errorResponse(error);
    }
    throw error;
  }
}
