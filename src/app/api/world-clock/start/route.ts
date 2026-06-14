import { jsonResponse } from "@/lib/api-response";
import { getWorldClockService, WorldClockError } from "@/modules/world-clock";

export const dynamic = "force-dynamic";

function errorResponse(error: WorldClockError) {
  const status =
    error.code === "CLOCK_ALREADY_RUNNING" || error.code === "CLOCK_NOT_RUNNING"
      ? 409
      : 400;

  return jsonResponse(
    { error: { code: error.code, message: error.message } },
    status,
  );
}

export async function POST() {
  try {
    const service = getWorldClockService();
    const output = service.start();
    return jsonResponse({ data: output });
  } catch (error) {
    if (error instanceof WorldClockError) {
      return errorResponse(error);
    }
    throw error;
  }
}
