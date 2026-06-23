import { describe, expect, it, vi } from "vitest";
import { pool, verifyDatabaseConnection } from "../src/config/database.js";

describe("database config", () => {
  it("verifies database connection successfully", async () => {
    const queryMock = vi.fn().mockResolvedValue({ rows: [] });
    const releaseMock = vi.fn();
    const connectSpy = vi.spyOn(pool, "connect").mockResolvedValue({
      query: queryMock,
      release: releaseMock,
    } as any);

    await expect(verifyDatabaseConnection()).resolves.toBeUndefined();
    expect(connectSpy).toHaveBeenCalledOnce();
    expect(queryMock).toHaveBeenCalledWith("SELECT 1");
    expect(releaseMock).toHaveBeenCalledOnce();

    connectSpy.mockRestore();
  });

  it("handles database verification failure", async () => {
    const connectSpy = vi.spyOn(pool, "connect").mockRejectedValue(new Error("Connection failed"));

    await expect(verifyDatabaseConnection()).rejects.toThrow("Connection failed");
    expect(connectSpy).toHaveBeenCalledOnce();

    connectSpy.mockRestore();
  });
});
