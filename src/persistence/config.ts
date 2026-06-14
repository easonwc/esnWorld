import path from "node:path";

export function getDatabasePath(): string {
  const configured = process.env.DATABASE_PATH?.trim();
  if (configured) {
    return path.isAbsolute(configured)
      ? configured
      : path.resolve(process.cwd(), configured);
  }
  return path.resolve(process.cwd(), "data", "world.db");
}
