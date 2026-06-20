import { jsonResponse } from "@/lib/api-response";
import { listGetResponse } from "@/lib/list-route";
import { HumanError } from "@/modules/humans";
import {
  GolferError,
  countGolfers,
  executeGolfer,
  listGolfers,
  type GolferInput,
} from "@/modules/golfers";

export const dynamic = "force-dynamic";

function errorResponse(error: GolferError | HumanError) {
  const status =
    error.code === "GOLFER_NOT_FOUND" || error.code === "HUMAN_NOT_FOUND"
      ? 404
      : 400;

  return jsonResponse(
    { error: { code: error.code, message: error.message } },
    status,
  );
}

export async function GET(request: Request) {
  return listGetResponse(request, listGolfers, countGolfers);
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

  const input = body as GolferInput;

  if (!input || typeof input !== "object" || !("action" in input)) {
    return jsonResponse(
      { error: { code: "INVALID_INPUT", message: "action is required" } },
      400,
    );
  }

  try {
    const output = await executeGolfer(input);
    return jsonResponse({ data: output });
  } catch (error) {
    if (error instanceof GolferError || error instanceof HumanError) {
      return errorResponse(error);
    }
    throw error;
  }
}
