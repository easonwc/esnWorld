import type { ListOptions } from "@/lib/pagination";

export function sqliteListSuffix(options?: ListOptions): string {
  return options ? " LIMIT ? OFFSET ?" : "";
}

export function sqliteListBindings(options?: ListOptions): number[] {
  return options ? [options.limit, options.offset] : [];
}
