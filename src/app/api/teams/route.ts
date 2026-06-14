import { jsonResponse } from "@/lib/api-response";
import { DivisionError } from "@/modules/divisions";
import { VenueError } from "@/modules/venues";
import {
  TeamError,
  executeTeam,
  listTeams,
  type TeamInput,
} from "@/modules/teams";

export const dynamic = "force-dynamic";

function errorResponse(error: TeamError | DivisionError | VenueError) {
  const status =
    error.code === "TEAM_NOT_FOUND" ||
    error.code === "DIVISION_NOT_FOUND" ||
    error.code === "VENUE_NOT_FOUND"
      ? 404
      : 400;

  return jsonResponse(
    { error: { code: error.code, message: error.message } },
    status,
  );
}

export async function GET() {
  const teams = await listTeams();
  return jsonResponse({ data: teams });
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

  const input = body as TeamInput;

  if (!input || typeof input !== "object" || !("action" in input)) {
    return jsonResponse(
      { error: { code: "INVALID_INPUT", message: "action is required" } },
      400,
    );
  }

  try {
    const output = await executeTeam(input);
    return jsonResponse({ data: output });
  } catch (error) {
    if (
      error instanceof TeamError ||
      error instanceof DivisionError ||
      error instanceof VenueError
    ) {
      return errorResponse(error);
    }
    throw error;
  }
}
