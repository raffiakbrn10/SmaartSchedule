import { describe, expect, it, vi, beforeEach } from "vitest";
import { handleTelegramUpdate } from "../src/services/telegram/updateHandler.js";
import { telegramClient } from "../src/services/telegram/telegramClient.js";
import { userRepository } from "../src/repositories/userRepository.js";
import { authService } from "../src/services/authService.js";

vi.mock("../src/services/telegram/telegramClient.js", () => ({
  telegramClient: {
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

describe("handleTelegramUpdate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("links chat ID on valid start command", async () => {
    const mockUpdate = {
      update_id: 100,
      message: {
        text: "/start secret-token",
        chat: { id: 12345 },
      },
    };

    vi.mocked(authService.verifyPurposeToken).mockReturnValueOnce({ id: 9, username: "john" });
    vi.mocked(userRepository.updateTelegramChatId).mockResolvedValueOnce(true);
    vi.mocked(telegramClient.sendMessage).mockResolvedValueOnce({ ok: true, status: "delivered", attempts: 1 });

    await handleTelegramUpdate(mockUpdate);

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

    vi.mocked(authService.verifyPurposeToken).mockImplementationOnce(() => {
      throw new Error("Invalid token");
    });
    vi.mocked(telegramClient.sendMessage).mockResolvedValueOnce({ ok: true, status: "delivered", attempts: 1 });

    await handleTelegramUpdate(mockUpdate);

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

    await handleTelegramUpdate(mockUpdate);

    expect(authService.verifyPurposeToken).not.toHaveBeenCalled();
  });
});
