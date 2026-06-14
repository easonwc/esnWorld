import { NextResponse } from "next/server";

export type CacheProfile = "no-store" | "catalog";

const CACHE_CONTROL: Record<CacheProfile, string> = {
  "no-store": "no-store, no-cache, must-revalidate",
  catalog: "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
};

export function jsonResponse(
  data: unknown,
  status = 200,
  cache: CacheProfile = "no-store",
) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": CACHE_CONTROL[cache],
    },
  });
}

