import { jsonResponse } from "@/lib/api-response";
import {
  ConferenceError,
  executeConference,
  listConferences,
  type ConferenceInput,
} from "@/modules/conferences";
import { LeagueError } from "@/modules/leagues";

export const dynamic = "force-dynamic";

function errorResponse(error: ConferenceError | LeagueError) {
  const status =
    error.code === "CONFERENCE_NOT_FOUND" || error.code === "LEAGUE_NOT_FOUND"
      ? 404
      : 400;

  return jsonResponse(
    { error: { code: error.code, message: error.message } },
    status,
  );
}

export async function GET() {
  const conferences = await listConferences();
  return jsonResponse({ data: conferences });
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

  const input = body as ConferenceInput;

  if (!input || typeof input !== "object" || !("action" in input)) {
    return jsonResponse(
      { error: { code: "INVALID_INPUT", message: "action is required" } },
      400,
    );
  }

  try {
    const output = await executeConference(input);
    return jsonResponse({ data: output });
  } catch (error) {
    if (error instanceof ConferenceError || error instanceof LeagueError) {
      return errorResponse(error);
    }
    throw error;
  }
}
