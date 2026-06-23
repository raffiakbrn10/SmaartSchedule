import request from "supertest";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { createApp } from "../src/app.js";
import { authService } from "../src/services/authService.js";
import { userRepository, type UserRecord } from "../src/repositories/userRepository.js";
import { googleCalendarService } from "../src/services/googleCalendarService.js";
import { handleTelegramUpdate } from "../src/services/telegram/updateHandler.js";
import { env } from "../src/config/env.js";

vi.mock("../src/services/authService.js", () => ({
  authService: {
    verifySession: vi.fn(),
    createPurposeToken: vi.fn(),
    verifyPurposeToken: vi.fn(),
  },
}));

vi.mock("../src/repositories/userRepository.js", () => ({
  userRepository: {
    findById: vi.fn(),
    updateGoogleRefreshToken: vi.fn(),
  },
}));

vi.mock("../src/services/googleCalendarService.js", () => ({
  googleCalendarService: {
    getAuthorizationUrl: vi.fn(),
    exchangeCode: vi.fn(),
  },
}));

vi.mock("../src/services/telegram/updateHandler.js", () => ({
  handleTelegramUpdate: vi.fn(() => Promise.resolve()),
}));

describe("integrationController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.verifySession).mockReturnValue({ id: 1, username: "user" });
  });

  const app = createApp();

  describe("GET /integrations/status", () => {
    it("returns status of linked integrations", async () => {
      vi.mocked(userRepository.findById).mockResolvedValueOnce({
        id: 1,
        username: "user",
        password: "hash",
        google_refresh_token: "token",
        telegram_chat_id: "123",
      } as UserRecord);

      const response = await request(app)
        .get("/integrations/status")
        .set("Authorization", "Bearer token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Status integrasi berhasil dimuat.",
        data: { googleLinked: true, telegramLinked: true },
      });
    });

    it("returns 404 if user not found", async () => {
      vi.mocked(userRepository.findById).mockResolvedValueOnce(null);

      const response = await request(app)
        .get("/integrations/status")
        .set("Authorization", "Bearer token");

      expect(response.status).toBe(404);
      const body = response.body as Record<string, unknown>;
      expect(body.message).toBe("Pengguna tidak ditemukan.");
    });
  });

  describe("GET /google/auth-url", () => {
    it("returns authorization URL", async () => {
      vi.mocked(authService.createPurposeToken).mockReturnValueOnce("google-purpose-token");
      vi.mocked(googleCalendarService.getAuthorizationUrl).mockReturnValueOnce("https://google-auth-url");

      const response = await request(app)
        .get("/google/auth-url")
        .set("Authorization", "Bearer token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "URL Google dibuat.",
        data: { url: "https://google-auth-url" },
      });
      expect(authService.createPurposeToken).toHaveBeenCalledWith({ id: 1, username: "user" }, "google-link");
      expect(googleCalendarService.getAuthorizationUrl).toHaveBeenCalledWith("google-purpose-token");
    });
  });

  describe("GET /google/callback", () => {
    it("successfully links google account and redirects to profile", async () => {
      vi.mocked(authService.verifyPurposeToken).mockReturnValueOnce({ id: 1, username: "user" });
      vi.mocked(googleCalendarService.exchangeCode).mockResolvedValueOnce("refresh-token-xyz");
      vi.mocked(userRepository.updateGoogleRefreshToken).mockResolvedValueOnce(true);

      const response = await request(app)
        .get("/google/callback?code=auth-code&state=purpose-token");

      expect(response.status).toBe(302);
      expect(response.headers.location).toContain("/profile?google_linked=success");
      expect(authService.verifyPurposeToken).toHaveBeenCalledWith("purpose-token", "google-link");
      expect(googleCalendarService.exchangeCode).toHaveBeenCalledWith("auth-code");
      expect(userRepository.updateGoogleRefreshToken).toHaveBeenCalledWith(1, "refresh-token-xyz");
    });

    it("redirects to profile with failed status on non-AppError exceptions", async () => {
      vi.mocked(authService.verifyPurposeToken).mockImplementationOnce(() => {
        throw new Error("unexpected error");
      });

      const response = await request(app)
        .get("/google/callback?code=auth-code&state=purpose-token");

      expect(response.status).toBe(302);
      expect(response.headers.location).toContain("/profile?google_linked=failed");
    });

    it("returns AppError response on AppError exceptions", async () => {
      vi.mocked(authService.verifyPurposeToken).mockReturnValueOnce({ id: 1, username: "user" });
      vi.mocked(googleCalendarService.exchangeCode).mockResolvedValueOnce(null); // triggers 400 AppError

      const response = await request(app)
        .get("/google/callback?code=auth-code&state=purpose-token");

      expect(response.status).toBe(400);
      const body = response.body as Record<string, unknown>;
      expect(body.message).toContain("Google tidak mengembalikan refresh token");
    });
  });

  describe("GET /integrations/telegram/link", () => {
    const originalPolling = env.TELEGRAM_POLLING_ENABLED;
    const originalWebhook = env.TELEGRAM_WEBHOOK_ENABLED;
    const originalUsername = env.TELEGRAM_BOT_USERNAME;

    afterEach(() => {
      env.TELEGRAM_POLLING_ENABLED = originalPolling;
      env.TELEGRAM_WEBHOOK_ENABLED = originalWebhook;
      env.TELEGRAM_BOT_USERNAME = originalUsername;
    });

    it("returns short Telegram link if configured (polling)", async () => {
      env.TELEGRAM_POLLING_ENABLED = true;
      env.TELEGRAM_WEBHOOK_ENABLED = false;
      env.TELEGRAM_BOT_USERNAME = "mybot";
      vi.mocked(authService.createPurposeToken).mockReturnValueOnce("tg-token");

      const response = await request(app)
        .get("/integrations/telegram/link")
        .set("Authorization", "Bearer token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Tautan Telegram dibuat.",
        data: { url: "https://t.me/mybot?start=tg-token" },
      });
    });

    it("returns short Telegram link if configured (webhook)", async () => {
      env.TELEGRAM_POLLING_ENABLED = false;
      env.TELEGRAM_WEBHOOK_ENABLED = true;
      env.TELEGRAM_BOT_USERNAME = "mybot";
      vi.mocked(authService.createPurposeToken).mockReturnValueOnce("tg-token");

      const response = await request(app)
        .get("/integrations/telegram/link")
        .set("Authorization", "Bearer token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Tautan Telegram dibuat.",
        data: { url: "https://t.me/mybot?start=tg-token" },
      });
    });

    it("returns 503 if telegram integration is disabled or not configured", async () => {
      env.TELEGRAM_POLLING_ENABLED = false;
      env.TELEGRAM_WEBHOOK_ENABLED = false;

      const response = await request(app)
        .get("/integrations/telegram/link")
        .set("Authorization", "Bearer token");

      expect(response.status).toBe(503);
      const body = response.body as Record<string, unknown>;
      expect(body.message).toBe("Penautan Telegram belum dikonfigurasi.");
    });
  });

  describe("POST /integrations/telegram/webhook", () => {
    const originalWebhookEnabled = env.TELEGRAM_WEBHOOK_ENABLED;
    const originalWebhookSecret = env.TELEGRAM_WEBHOOK_SECRET;

    afterEach(() => {
      env.TELEGRAM_WEBHOOK_ENABLED = originalWebhookEnabled;
      env.TELEGRAM_WEBHOOK_SECRET = originalWebhookSecret;
    });

    it("returns 403 when webhook is disabled", async () => {
      env.TELEGRAM_WEBHOOK_ENABLED = false;

      const response = await request(app)
        .post("/integrations/telegram/webhook")
        .send({ update_id: 123 });

      expect(response.status).toBe(403);
      expect(response.body.message).toContain("Webhook Telegram dinonaktifkan");
      expect(handleTelegramUpdate).not.toHaveBeenCalled();
    });

    it("returns 401 when secret token is configured but missing or incorrect", async () => {
      env.TELEGRAM_WEBHOOK_ENABLED = true;
      env.TELEGRAM_WEBHOOK_SECRET = "supersecret";

      const response1 = await request(app)
        .post("/integrations/telegram/webhook")
        .send({ update_id: 123 });

      expect(response1.status).toBe(401);
      expect(response1.body.message).toContain("Token rahasia webhook tidak valid");

      const response2 = await request(app)
        .post("/integrations/telegram/webhook")
        .set("X-Telegram-Bot-Api-Secret-Token", "wrongsecret")
        .send({ update_id: 123 });

      expect(response2.status).toBe(401);
      expect(handleTelegramUpdate).not.toHaveBeenCalled();
    });

    it("returns 200 and processes update when secret token matches or is not required", async () => {
      env.TELEGRAM_WEBHOOK_ENABLED = true;
      env.TELEGRAM_WEBHOOK_SECRET = "supersecret";

      const updatePayload = { update_id: 123, message: { text: "/start tg-token", chat: { id: 111 } } };

      const response = await request(app)
        .post("/integrations/telegram/webhook")
        .set("X-Telegram-Bot-Api-Secret-Token", "supersecret")
        .send(updatePayload);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain("Webhook diproses");
      expect(handleTelegramUpdate).toHaveBeenCalledWith(updatePayload);
    });
  });
});
