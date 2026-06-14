import { describe, expect, it } from "vitest";
import {
  DEFAULT_LIST_LIMIT,
  MAX_LIST_LIMIT,
  PaginationError,
  paginateArray,
  parseListOptions,
} from "./pagination";

describe("parseListOptions", () => {
  it("returns null when no pagination query params are present", () => {
    expect(parseListOptions(new URLSearchParams())).toBeNull();
  });

  it("defaults offset to 0 when only limit is provided", () => {
    expect(parseListOptions(new URLSearchParams("limit=25"))).toEqual({
      limit: 25,
      offset: 0,
    });
  });

  it("defaults limit when only offset is provided", () => {
    expect(parseListOptions(new URLSearchParams("offset=10"))).toEqual({
      limit: DEFAULT_LIST_LIMIT,
      offset: 10,
    });
  });

  it("caps limit at MAX_LIST_LIMIT", () => {
    expect(
      parseListOptions(new URLSearchParams(`limit=${MAX_LIST_LIMIT + 1}`)),
    ).toEqual({
      limit: MAX_LIST_LIMIT,
      offset: 0,
    });
  });

  it("rejects invalid limit values", () => {
    expect(() => parseListOptions(new URLSearchParams("limit=0"))).toThrow(
      PaginationError,
    );
  });
});

describe("paginateArray", () => {
  it("returns a slice for the requested page", () => {
    expect(paginateArray([1, 2, 3, 4, 5], { limit: 2, offset: 1 })).toEqual([
      2, 3,
    ]);
  });
});
