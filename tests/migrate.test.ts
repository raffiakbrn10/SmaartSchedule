import { describe, expect, it, vi, beforeEach } from "vitest";
import { pool } from "../src/config/database.js";
import { readFile } from "node:fs/promises";

vi.mock("../src/config/database.js", () => ({
  pool: {
    query: vi.fn(),
    end: vi.fn(),
  },
}));

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn().mockResolvedValue("CREATE TABLE test;\n-- comment\nCREATE TABLE test2;"),
}));

describe("database migration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("reads and executes statements", async () => {
    await import("../src/database/migrate.js");

    expect(readFile).toHaveBeenCalledOnce();
    expect(pool.query).toHaveBeenCalledOnce();
    expect(pool.query).toHaveBeenCalledWith("CREATE TABLE test;\n-- comment\nCREATE TABLE test2;");
    expect(pool.end).toHaveBeenCalledOnce();
  });
});
