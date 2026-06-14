import { jsonResponse } from "@/lib/api-response";
import {
  LeagueError,
  executeLeague,
  listLeagues,
  type LeagueInput,
} from "@/modules/leagues";

export const dynamic = "force-dynamic";

function errorResponse(error: LeagueError) {
  const status = error.code === "LEAGUE_NOT_FOUND" ? 404 : 400;

  return jsonResponse(
    { error: { code: error.code, message: error.message } },
    status,
  );
}

export async function GET() {
  const leagues = await listLeagues();
  return jsonResponse({ data: leagues });
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

  const input = body as LeagueInput;

  if (!input || typeof input !== "object" || !("action" in input)) {
    return jsonResponse(
      { error: { code: "INVALID_INPUT", message: "action is required" } },
      400,
    );
  }

  try {
    const output = await executeLeague(input);
    return jsonResponse({ data: output });
  } catch (error) {
    if (error instanceof LeagueError) {
      return errorResponse(error);
    }
    throw error;
  }
}
