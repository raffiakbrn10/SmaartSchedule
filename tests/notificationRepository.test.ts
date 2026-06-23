import { describe, expect, it, vi, beforeEach } from "vitest";
import { db } from "../src/config/database.js";
import { notificationRepository } from "../src/repositories/notificationRepository.js";


vi.mock("../src/config/database.js", () => ({
  db: {
    execute: vi.fn(),
  },
}));

describe("notificationRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("claim inserts/updates delivery record and returns boolean", async () => {
    vi.mocked(db.execute).mockResolvedValueOnce([[{ dedupe_key: "key1" }], []]);

    const success = await notificationRepository.claim("key1", "type1", "chat1");
    expect(success).toBe(true);
    expect(db.execute).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO notification_deliveries"), ["key1", "type1", "chat1"]);

    vi.mocked(db.execute).mockResolvedValueOnce([[], []]);
    const fail = await notificationRepository.claim("key1", "type1", "chat1");
    expect(fail).toBe(false);
  });

  it("delivered updates status to delivered", async () => {
    vi.mocked(db.execute).mockResolvedValueOnce([[], []]);

    await notificationRepository.delivered("key1");
    expect(db.execute).toHaveBeenCalledWith(expect.stringContaining("status = 'delivered'"), ["key1"]);
  });

  it("failed updates status to failed and records reason", async () => {
    vi.mocked(db.execute).mockResolvedValueOnce([[], []]);

    await notificationRepository.failed("key1", "short reason");
    expect(db.execute).toHaveBeenCalledWith(expect.stringContaining("status = 'failed'"), ["short reason", "key1"]);
  });
});
