import { jsonResponse } from "@/lib/api-response";
import {
  CalendarError,
  executeCalendar,
  getCalendarFromClock,
  type CalendarInput,
} from "@/modules/calendar";

export const dynamic = "force-dynamic";

function errorResponse(error: CalendarError) {
  return jsonResponse(
    { error: { code: error.code, message: error.message } },
    400,
  );
}

export async function GET() {
  const output = getCalendarFromClock();
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

  const input = body as CalendarInput;

  if (!input || typeof input !== "object" || !("action" in input)) {
    return jsonResponse(
      { error: { code: "INVALID_INPUT", message: "action is required" } },
      400,
    );
  }

  try {
    const output = executeCalendar(input);
    return jsonResponse({ data: output });
  } catch (error) {
    if (error instanceof CalendarError) {
      return errorResponse(error);
    }
    throw error;
  }
}
