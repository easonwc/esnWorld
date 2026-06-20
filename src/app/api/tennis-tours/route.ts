import { jsonResponse } from "@/lib/api-response";
import {
  TennisError,
  executeTennisTour,
  type TennisTourInput,
} from "@/modules/tennis";

export const dynamic = "force-dynamic";

function errorResponse(error: TennisError) {
  const status = error.code === "TOUR_NOT_FOUND" ? 404 : 400;

  return jsonResponse(
    { error: { code: error.code, message: error.message } },
    status,
  );
}

export async function GET() {
  try {
    const output = await executeTennisTour({ action: "list" });
    return jsonResponse({ data: output });
  } catch (error) {
    if (error instanceof TennisError) {
      return errorResponse(error);
    }
    throw error;
  }
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

  const input = body as TennisTourInput;

  if (!input || typeof input !== "object" || !("action" in input)) {
    return jsonResponse(
      { error: { code: "INVALID_INPUT", message: "action is required" } },
      400,
    );
  }

  try {
    const output = await executeTennisTour(input);
    return jsonResponse({ data: output });
  } catch (error) {
    if (error instanceof TennisError) {
      return errorResponse(error);
    }
    throw error;
  }
}
