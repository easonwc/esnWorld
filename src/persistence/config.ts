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

/** @deprecated Use shouldResetWorldDatabaseOnStartup */
export function shouldResetDatabaseOnStartup(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return shouldResetWorldDatabaseOnStartup(env);
}

export function shouldResetWorldDatabaseOnStartup(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return (
    parseBoolean(env.WORLD_DATABASE_RESET_ON_STARTUP, false) ||
    parseBoolean(env.DATABASE_RESET_ON_STARTUP, false)
  );
}

export function shouldResetSessionOnStartup(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return parseBoolean(env.SESSION_RESET_ON_STARTUP, false);
}

export function shouldFullResetDatabaseOnStartup(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return parseBoolean(env.FULL_DATABASE_RESET_ON_STARTUP, false);
}
