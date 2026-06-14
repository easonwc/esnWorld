export interface ListOptions {
  limit: number;
  offset: number;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
}

export const DEFAULT_LIST_LIMIT = 100;
export const MAX_LIST_LIMIT = 500;

export class PaginationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaginationError";
  }
}

function parsePositiveInt(value: string, field: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new PaginationError(`${field} must be a positive integer`);
  }
  return parsed;
}

function parseNonNegativeInt(value: string, field: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new PaginationError(`${field} must be a non-negative integer`);
  }
  return parsed;
}

export function parseListOptions(
  searchParams: URLSearchParams,
): ListOptions | null {
  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");

  if (limitParam === null && offsetParam === null) {
    return null;
  }

  const limit =
    limitParam !== null
      ? Math.min(parsePositiveInt(limitParam, "limit"), MAX_LIST_LIMIT)
      : DEFAULT_LIST_LIMIT;
  const offset =
    offsetParam !== null ? parseNonNegativeInt(offsetParam, "offset") : 0;

  return { limit, offset };
}

export function paginateArray<T>(
  items: readonly T[],
  options: ListOptions,
): T[] {
  return items.slice(options.offset, options.offset + options.limit);
}
