import { logger } from "../../config/logger";
import { authService } from "../authService";
import { telegramClient } from "./telegramClient";
import { telegramTemplates } from "./templates";
import { userRepository } from "../../repositories/userRepository";

export interface TelegramUpdate {
  update_id: number;
  message?: {
    text?: string;
    chat: {
      id: number;
    };
  };
}

export async function handleTelegramUpdate(update: TelegramUpdate): Promise<void> {
  const message = update.message;
  if (!message?.text) return;

  const chatId = String(message.chat.id);
  const text = message.text.trim();

  logger.info({ chatId, text, updateId: update.update_id }, "Telegram update received");

  // Handle /start with linking token
  const startMatch = text.match(/^\/start\s+(.+)$/);
  if (startMatch?.[1]) {
    try {
      const user = authService.verifyPurposeToken(startMatch[1], "telegram-link");
      await userRepository.updateTelegramChatId(user.id, chatId);
      await telegramClient.sendMessage(chatId, telegramTemplates.linked(user.username));
      logger.info({ chatId, userId: user.id }, "Telegram account linked successfully");
    } catch {
      await telegramClient.sendMessage(
        chatId,
        "Tautan ini tidak valid atau sudah kedaluwarsa. Buat tautan baru dari halaman Profil di SmartSchedule."
      );
    }
    return;
  }

  // Handle plain /start (no token)
  if (text === "/start") {
    await telegramClient.sendMessage(chatId, telegramTemplates.welcome());
    return;
  }

  // Handle any other message
  await telegramClient.sendMessage(chatId, telegramTemplates.help());
}
