export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiOperation {
  id: string;
  tag: string;
  method: HttpMethod;
  path: string;
  summary: string;
  description: string;
  requestBody?: string;
}

export const apiOperations: ApiOperation[] = [
  {
    id: "world-clock-get",
    tag: "World Clock",
    method: "GET",
    path: "/api/world-clock",
    summary: "Get current world time",
    description:
      "Returns the current UTC world clock time. Re-execute after starting the clock to see elapsed simulated time (1 simulated minute per real second by default).",
  },
  {
    id: "world-clock-set",
    tag: "World Clock",
    method: "POST",
    path: "/api/world-clock",
    summary: "Set world time",
    description: "Sets the world clock to a specific UTC datetime.",
    requestBody: JSON.stringify(
      { action: "set", isoUtc: "2020-01-01T12:00:00.000Z" },
      null,
      2,
    ),
  },
  {
    id: "world-clock-advance",
    tag: "World Clock",
    method: "POST",
    path: "/api/world-clock",
    summary: "Advance world time",
    description:
      "Advances the world clock forward by a positive number of simulated milliseconds.",
    requestBody: JSON.stringify({ action: "advance", milliseconds: 60000 }, null, 2),
  },
  {
    id: "world-clock-start",
    tag: "World Clock",
    method: "POST",
    path: "/api/world-clock/start",
    summary: "Start the world clock",
    description:
      "Starts automatic time advancement using WORLD_CLOCK_SIMULATED_MS_PER_REAL_MS from the environment.",
  },
  {
    id: "world-clock-stop",
    tag: "World Clock",
    method: "POST",
    path: "/api/world-clock/stop",
    summary: "Stop the world clock",
    description: "Stops automatic advancement and freezes time at the current value.",
  },
  {
    id: "calendar-get",
    tag: "Calendar",
    method: "GET",
    path: "/api/calendar",
    summary: "Get current calendar date",
    description:
      "Returns the US calendar date for the current world clock time, including weekday and day-of-year.",
  },
  {
    id: "calendar-from-iso",
    tag: "Calendar",
    method: "POST",
    path: "/api/calendar",
    summary: "Calendar from ISO UTC",
    description: "Converts a UTC ISO 8601 datetime into US calendar fields.",
    requestBody: JSON.stringify(
      { action: "fromIso", isoUtc: "2020-06-14T12:00:00.000Z" },
      null,
      2,
    ),
  },
  {
    id: "calendar-from-date",
    tag: "Calendar",
    method: "POST",
    path: "/api/calendar",
    summary: "Calendar from date",
    description:
      "Converts year, month, and day into US calendar fields. Optional time components default to midnight.",
    requestBody: JSON.stringify(
      { action: "fromDate", year: 2020, month: 6, day: 14 },
      null,
      2,
    ),
  },
];

export function buildOpenApiSpec() {
  const paths: Record<string, Record<string, unknown>> = {};

  for (const op of apiOperations) {
    const pathKey = op.path;
    const methodKey = op.method.toLowerCase();

    if (!paths[pathKey]) {
      paths[pathKey] = {};
    }

    const operation: Record<string, unknown> = {
      tags: [op.tag],
      summary: op.summary,
      description: op.description,
      responses: {
        "200": {
          description: "Successful response",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { type: "object" },
                },
              },
            },
          },
        },
        "400": { description: "Invalid request" },
        "409": { description: "Clock state conflict (start/stop)" },
      },
    };

    if (op.requestBody) {
      operation.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: { type: "object" },
            example: JSON.parse(op.requestBody),
          },
        },
      };
    }

    paths[pathKey][methodKey] = operation;
  }

  return {
    openapi: "3.0.3",
    info: {
      title: "ESN World Engine API",
      version: "0.1.0",
      description:
        "API for the ESN World Engine. The world clock is the canonical UTC time source.",
    },
    tags: [
      {
        name: "World Clock",
        description: "UTC world clock with configurable simulated tick rate.",
      },
      {
        name: "Calendar",
        description: "US Gregorian calendar derived from UTC world time.",
      },
    ],
    paths,
  };
}
