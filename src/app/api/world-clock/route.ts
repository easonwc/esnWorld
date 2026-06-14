import { jsonResponse } from "@/lib/api-response";
import {
  WorldClockError,
  getWorldClockService,
  type WorldClockInput,
} from "@/modules/world-clock";

export const dynamic = "force-dynamic";

function errorResponse(error: WorldClockError) {
  return jsonResponse(
    { error: { code: error.code, message: error.message } },
    400,
  );
}

export async function GET() {
  const service = getWorldClockService();
  const output = service.getCurrentOutput();
  return jsonResponse({ data: output });
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

  const input = body as WorldClockInput;

  if (!input || typeof input !== "object" || !("action" in input)) {
    return jsonResponse(
      { error: { code: "INVALID_INPUT", message: "action is required" } },
      400,
    );
  }

  try {
    const service = getWorldClockService();
    const output = service.execute(input);
    return jsonResponse({ data: output });
  } catch (error) {
    if (error instanceof WorldClockError) {
      return errorResponse(error);
    }
    throw error;
  }
}
