import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { startTelegramPolling, stopTelegramPolling } from "../src/services/telegram/pollingService.js";
import { telegramClient } from "../src/services/telegram/telegramClient.js";
import { userRepository } from "../src/repositories/userRepository.js";
import { authService } from "../src/services/authService.js";
import { env } from "../src/config/env.js";

vi.mock("../src/services/telegram/telegramClient.js", () => ({
  telegramClient: {
    getUpdates: vi.fn(),
    sendMessage: vi.fn(),
  },
}));

vi.mock("../src/repositories/userRepository.js", () => ({
  userRepository: {
    updateTelegramChatId: vi.fn(),
  },
}));

vi.mock("../src/services/authService.js", () => ({
  authService: {
    verifyPurposeToken: vi.fn(),
  },
}));

describe("telegram pollingService", () => {
  const originalPolling = env.TELEGRAM_POLLING_ENABLED;
  const originalNotifications = env.TELEGRAM_NOTIFICATIONS_ENABLED;

  beforeEach(() => {
    vi.clearAllMocks();
    env.TELEGRAM_POLLING_ENABLED = true;
    env.TELEGRAM_NOTIFICATIONS_ENABLED = true;
  });

  afterEach(() => {
    env.TELEGRAM_POLLING_ENABLED = originalPolling;
    env.TELEGRAM_NOTIFICATIONS_ENABLED = originalNotifications;
    stopTelegramPolling();
  });

  it("does not start if telegram polling/notifications are disabled", async () => {
    env.TELEGRAM_POLLING_ENABLED = false;
    await startTelegramPolling();
    expect(telegramClient.getUpdates).not.toHaveBeenCalled();
  });

  it("polls updates and links chat ID on valid start command", async () => {
    const mockUpdate = {
      update_id: 100,
      message: {
        text: "/start secret-token",
        chat: { id: 12345 },
      },
    };

    vi.mocked(telegramClient.getUpdates).mockImplementation(() => {
      stopTelegramPolling();
      return Promise.resolve([mockUpdate] as unknown as Awaited<ReturnType<typeof telegramClient.getUpdates>>);
    });

    vi.mocked(authService.verifyPurposeToken).mockReturnValueOnce({ id: 9, username: "john" });
    vi.mocked(userRepository.updateTelegramChatId).mockResolvedValueOnce(true);
    vi.mocked(telegramClient.sendMessage).mockResolvedValueOnce({ ok: true, status: "delivered", attempts: 1 });

    await startTelegramPolling();

    expect(telegramClient.getUpdates).toHaveBeenCalledOnce();
    expect(authService.verifyPurposeToken).toHaveBeenCalledWith("secret-token", "telegram-link");
    expect(userRepository.updateTelegramChatId).toHaveBeenCalledWith(9, "12345");
    expect(telegramClient.sendMessage).toHaveBeenCalledWith("12345", expect.stringContaining("john"));
  });

  it("sends error message on invalid start command token", async () => {
    const mockUpdate = {
      update_id: 101,
      message: {
        text: "/start invalid-token",
        chat: { id: 54321 },
      },
    };

    vi.mocked(telegramClient.getUpdates).mockImplementation(() => {
      stopTelegramPolling();
      return Promise.resolve([mockUpdate] as unknown as Awaited<ReturnType<typeof telegramClient.getUpdates>>);
    });

    vi.mocked(authService.verifyPurposeToken).mockImplementationOnce(() => {
      throw new Error("Invalid token");
    });
    vi.mocked(telegramClient.sendMessage).mockResolvedValueOnce({ ok: true, status: "delivered", attempts: 1 });

    await startTelegramPolling();

    expect(telegramClient.getUpdates).toHaveBeenCalledOnce();
    expect(telegramClient.sendMessage).toHaveBeenCalledWith("54321", expect.stringContaining("tidak valid"));
  });

  it("skips updates without a start message text", async () => {
    const mockUpdate = {
      update_id: 102,
      message: {
        text: "/other-command",
        chat: { id: 54321 },
      },
    };

    vi.mocked(telegramClient.getUpdates).mockImplementation(() => {
      stopTelegramPolling();
      return Promise.resolve([mockUpdate] as unknown as Awaited<ReturnType<typeof telegramClient.getUpdates>>);
    });

    await startTelegramPolling();

    expect(telegramClient.getUpdates).toHaveBeenCalledOnce();
    expect(authService.verifyPurposeToken).not.toHaveBeenCalled();
  });

  it("logs errors on polling network failures", async () => {
    vi.mocked(telegramClient.getUpdates).mockImplementation(() => {
      stopTelegramPolling();
      return Promise.reject(new Error("network error"));
    });

    await startTelegramPolling();
    expect(telegramClient.getUpdates).toHaveBeenCalledOnce();
  });
});
