import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

describe("env configuration", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("successfully parses valid environment", async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "test";
    process.env.JWT_SECRET = "some-long-secret-key-configured-for-test-32-chars";
    process.env.CORS_ORIGINS = "http://localhost:3000,http://localhost:4000";
    process.env.ADMIN_USER_IDS = "1,2,3";

    const { env } = await import("../src/config/env.js");
    expect(env.NODE_ENV).toBe("test");
    expect(env.corsOrigins).toEqual(["http://localhost:3000", "http://localhost:4000"]);
    expect(env.adminUserIds.has(1)).toBe(true);
    expect(env.adminUserIds.has(2)).toBe(true);
    expect(env.adminUserIds.has(3)).toBe(true);
  });

  it("throws error if NEXT_PUBLIC_SUPABASE_URL is invalid", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "not-a-valid-url";

    await expect(import("../src/config/env.js")).rejects.toThrow("Environment validation failed");
  });


  it("throws error if TELEGRAM_NOTIFICATIONS_ENABLED is true and TELEGRAM_BOT_TOKEN is missing", async () => {
    process.env.TELEGRAM_NOTIFICATIONS_ENABLED = "true";
    process.env.TELEGRAM_BOT_TOKEN = "";

    await expect(import("../src/config/env.js")).rejects.toThrow("TELEGRAM_BOT_TOKEN is required when Telegram notifications are enabled");
  });

  it("throws error if TELEGRAM_POLLING_ENABLED is true and TELEGRAM_BOT_USERNAME is missing", async () => {
    process.env.TELEGRAM_POLLING_ENABLED = "true";
    process.env.TELEGRAM_BOT_USERNAME = "";

    await expect(import("../src/config/env.js")).rejects.toThrow("TELEGRAM_BOT_USERNAME is required when Telegram polling or webhook is enabled");
  });

  it("throws error if TELEGRAM_WEBHOOK_ENABLED is true and TELEGRAM_BOT_USERNAME is missing", async () => {
    process.env.TELEGRAM_WEBHOOK_ENABLED = "true";
    process.env.TELEGRAM_BOT_USERNAME = "";

    await expect(import("../src/config/env.js")).rejects.toThrow("TELEGRAM_BOT_USERNAME is required when Telegram polling or webhook is enabled");
  });

  it("throws error if both TELEGRAM_POLLING_ENABLED and TELEGRAM_WEBHOOK_ENABLED are true", async () => {
    process.env.TELEGRAM_POLLING_ENABLED = "true";
    process.env.TELEGRAM_WEBHOOK_ENABLED = "true";
    process.env.TELEGRAM_BOT_USERNAME = "mybot";

    await expect(import("../src/config/env.js")).rejects.toThrow("Cannot enable both Telegram polling and Telegram webhook at the same time");
  });

  it("throws error if environment validation fails due to invalid parameters", async () => {
    process.env.PORT = "invalid-port";

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(import("../src/config/env.js")).rejects.toThrow("Environment validation failed");
    consoleErrorSpy.mockRestore();
  });
});
