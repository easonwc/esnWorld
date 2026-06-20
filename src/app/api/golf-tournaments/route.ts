import { jsonResponse } from "@/lib/api-response";
import {
  GolfError,
  executeGolfTournament,
  type GolfTournamentInput,
} from "@/modules/golf";

export const dynamic = "force-dynamic";

function errorResponse(error: GolfError) {
  const status = error.code === "TOURNAMENT_NOT_FOUND" ? 404 : 400;

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

  const input = body as GolfTournamentInput;

  if (!input || typeof input !== "object" || !("action" in input)) {
    return jsonResponse(
      { error: { code: "INVALID_INPUT", message: "action is required" } },
      400,
    );
  }

  try {
    const output = await executeGolfTournament(input);
    return jsonResponse({ data: output });
  } catch (error) {
    if (error instanceof GolfError) {
      return errorResponse(error);
    }
    throw error;
  }
}
