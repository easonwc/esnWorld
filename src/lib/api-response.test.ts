import { describe, expect, it } from "vitest";
import { jsonResponse } from "./api-response";

describe("jsonResponse", () => {
  it("uses no-store caching by default", () => {
    const response = jsonResponse({ ok: true });

    expect(response.headers.get("Cache-Control")).toBe(
      "no-store, no-cache, must-revalidate",
    );
  });

  it("uses catalog caching for static-ish list responses", () => {
    const response = jsonResponse({ data: [] }, 200, "catalog");

    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
    );
  });
});
