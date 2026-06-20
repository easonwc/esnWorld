import { jsonResponse } from "@/lib/api-response";
import {
  GolfError,
  executeGolfScheduling,
  type GolfSchedulingInput,
} from "@/modules/golf";

export const dynamic = "force-dynamic";

function errorResponse(error: GolfError) {
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

  const input = body as GolfSchedulingInput;

  if (!input || typeof input !== "object" || !("action" in input)) {
    return jsonResponse(
      { error: { code: "INVALID_INPUT", message: "action is required" } },
      400,
    );
  }

  try {
    const output = await executeGolfScheduling(input);
    return jsonResponse({ data: output });
  } catch (error) {
    if (error instanceof GolfError) {
      return errorResponse(error);
    }
    throw error;
  }
}
