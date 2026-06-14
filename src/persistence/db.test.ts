import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { afterEach, describe, expect, it } from "vitest";
import {
  deleteDatabaseFiles,
  closeDb,
  getDb,
} from "./db";

describe("database reset on startup", () => {
  const originalEnv = process.env.DATABASE_RESET_ON_STARTUP;
  const originalPath = process.env.DATABASE_PATH;
  let tempDir = "";

  afterEach(() => {
    closeDb();
    if (tempDir) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      tempDir = "";
    }
    process.env.DATABASE_RESET_ON_STARTUP = originalEnv;
    process.env.DATABASE_PATH = originalPath;
  });

  it("removes an existing database when DATABASE_RESET_ON_STARTUP=true", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "esnworld-db-reset-"));
    const dbPath = path.join(tempDir, "world.db");
    process.env.DATABASE_PATH = dbPath;
    process.env.DATABASE_RESET_ON_STARTUP = "true";

    const seedDb = new Database(dbPath);
    seedDb.exec("CREATE TABLE marker (value TEXT NOT NULL)");
    seedDb.prepare("INSERT INTO marker (value) VALUES (?)").run("old-data");
    seedDb.close();

    expect(fs.existsSync(dbPath)).toBe(true);

    getDb();

    expect(fs.existsSync(dbPath)).toBe(true);
    const db = getDb();
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
      .all() as { name: string }[];

    expect(tables.some((table) => table.name === "locations")).toBe(true);
    expect(tables.some((table) => table.name === "marker")).toBe(false);
    closeDb();
  });

  it("deleteDatabaseFiles removes sqlite sidecar files", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "esnworld-db-reset-"));
    const dbPath = path.join(tempDir, "world.db");

    fs.writeFileSync(dbPath, "db");
    fs.writeFileSync(`${dbPath}-wal`, "wal");
    fs.writeFileSync(`${dbPath}-shm`, "shm");

    deleteDatabaseFiles(dbPath);

    expect(fs.existsSync(dbPath)).toBe(false);
    expect(fs.existsSync(`${dbPath}-wal`)).toBe(false);
    expect(fs.existsSync(`${dbPath}-shm`)).toBe(false);
  });
});
