import { jsonResponse } from "@/lib/api-response";
import {
  PaginationError,
  parseListOptions,
  type ListOptions,
  type PaginationMeta,
} from "@/lib/pagination";

export async function listGetResponse<T>(
  request: Request,
  list: (options?: ListOptions) => Promise<T[]>,
  count: () => Promise<number>,
) {
  let options: ListOptions | null;

  try {
    options = parseListOptions(new URL(request.url).searchParams);
  } catch (error) {
    if (error instanceof PaginationError) {
      return jsonResponse(
        {
          error: {
            code: "INVALID_PAGINATION",
            message: error.message,
          },
        },
        400,
      );
    }
    throw error;
  }

  if (!options) {
    return jsonResponse({ data: await list() });
  }

  const [data, total] = await Promise.all([list(options), count()]);
  const pagination: PaginationMeta = {
    total,
    limit: options.limit,
    offset: options.offset,
  };

  return jsonResponse({ data, pagination });
}
