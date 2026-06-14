import path from "node:path";
import { parseBoolean } from "./env";

export function getDatabasePath(): string {
  const configured = process.env.DATABASE_PATH?.trim();
  if (configured) {
    return path.isAbsolute(configured)
      ? configured
      : path.resolve(process.cwd(), configured);
  }
  return path.resolve(process.cwd(), "data", "world.db");
}

export function shouldResetDatabaseOnStartup(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return parseBoolean(env.DATABASE_RESET_ON_STARTUP, false);
}
