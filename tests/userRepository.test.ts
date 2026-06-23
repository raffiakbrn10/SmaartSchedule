import { describe, expect, it, vi, beforeEach } from "vitest";
import { db } from "../src/config/database.js";
import { userRepository, type UserRecord } from "../src/repositories/userRepository.js";


vi.mock("../src/config/database.js", () => ({
  db: {
    execute: vi.fn(),
  },
}));

describe("userRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("findByUsername returns user record or null", async () => {
    const mockUser = { id: 1, username: "test", password: "pwd", google_refresh_token: null, telegram_chat_id: null } as UserRecord;
    vi.mocked(db.execute).mockResolvedValueOnce([[mockUser], []]);

    const result = await userRepository.findByUsername("test");
    expect(result).toEqual(mockUser);
    expect(db.execute).toHaveBeenCalledWith(expect.stringContaining("SELECT"), ["test"]);

    vi.mocked(db.execute).mockResolvedValueOnce([[], []]);
    const notFound = await userRepository.findByUsername("none");
    expect(notFound).toBeNull();
  });

  it("findById returns user record or null", async () => {
    const mockUser = { id: 1, username: "test", password: "pwd", google_refresh_token: null, telegram_chat_id: null } as UserRecord;
    vi.mocked(db.execute).mockResolvedValueOnce([[mockUser], []]);

    const result = await userRepository.findById(1);
    expect(result).toEqual(mockUser);
    expect(db.execute).toHaveBeenCalledWith(expect.stringContaining("SELECT"), [1]);

    vi.mocked(db.execute).mockResolvedValueOnce([[], []]);
    const notFound = await userRepository.findById(999);
    expect(notFound).toBeNull();
  });

  it("create inserts user and returns insertId", async () => {
    vi.mocked(db.execute).mockResolvedValueOnce([[{ id: 42 }], []]);

    const insertId = await userRepository.create("newuser", "hash");
    expect(insertId).toBe(42);
    expect(db.execute).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO users"), ["newuser", "hash"]);
  });

  it("updateTelegramChatId updates telegram chat id and returns boolean", async () => {
    vi.mocked(db.execute).mockResolvedValueOnce([[{ id: 1 }], []]);

    const success = await userRepository.updateTelegramChatId(1, "12345");
    expect(success).toBe(true);
    expect(db.execute).toHaveBeenCalledWith(expect.stringContaining("UPDATE users SET telegram_chat_id"), ["12345", 1]);

    vi.mocked(db.execute).mockResolvedValueOnce([[], []]);
    const fail = await userRepository.updateTelegramChatId(2, "12345");
    expect(fail).toBe(false);
  });

  it("updateGoogleRefreshToken updates google refresh token and returns boolean", async () => {
    vi.mocked(db.execute).mockResolvedValueOnce([[{ id: 1 }], []]);

    const success = await userRepository.updateGoogleRefreshToken(1, "token");
    expect(success).toBe(true);
    expect(db.execute).toHaveBeenCalledWith(expect.stringContaining("UPDATE users SET google_refresh_token"), ["token", 1]);

    vi.mocked(db.execute).mockResolvedValueOnce([[], []]);
    const fail = await userRepository.updateGoogleRefreshToken(2, "token");
    expect(fail).toBe(false);
  });
});
