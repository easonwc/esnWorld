import { jsonResponse } from "@/lib/api-response";
import {
  TennisError,
  executeTennisScheduling,
  type TennisSchedulingInput,
} from "@/modules/tennis";

export const dynamic = "force-dynamic";

function errorResponse(error: TennisError) {
  return jsonResponse(
    { error: { code: error.code, message: error.message } },
    400,
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

  const input = body as TennisSchedulingInput;

  if (!input || typeof input !== "object" || !("action" in input)) {
    return jsonResponse(
      { error: { code: "INVALID_INPUT", message: "action is required" } },
      400,
    );
  }

  try {
    const output = await executeTennisScheduling(input);
    return jsonResponse({ data: output });
  } catch (error) {
    if (error instanceof TennisError) {
      return errorResponse(error);
    }
    throw error;
  }
}
