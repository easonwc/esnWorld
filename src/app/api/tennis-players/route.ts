import { jsonResponse } from "@/lib/api-response";
import { listGetResponse } from "@/lib/list-route";
import { HumanError } from "@/modules/humans";
import {
  TennisPlayerError,
  countTennisPlayers,
  executeTennisPlayer,
  listTennisPlayers,
  type TennisPlayerInput,
} from "@/modules/tennis-players";

export const dynamic = "force-dynamic";

function errorResponse(error: TennisPlayerError | HumanError) {
  const status =
    error.code === "TENNIS_PLAYER_NOT_FOUND" || error.code === "HUMAN_NOT_FOUND"
      ? 404
      : 400;

  return jsonResponse(
    { error: { code: error.code, message: error.message } },
    status,
  );
}

export async function GET(request: Request) {
  return listGetResponse(request, listTennisPlayers, countTennisPlayers);
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

  const input = body as TennisPlayerInput;

  if (!input || typeof input !== "object" || !("action" in input)) {
    return jsonResponse(
      { error: { code: "INVALID_INPUT", message: "action is required" } },
      400,
    );
  }

  try {
    const output = await executeTennisPlayer(input);
    return jsonResponse({ data: output });
  } catch (error) {
    if (error instanceof TennisPlayerError || error instanceof HumanError) {
      return errorResponse(error);
    }
    throw error;
  }
}
