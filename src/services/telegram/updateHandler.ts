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
  const match = update.message?.text?.match(/^\/start\s+(.+)$/);
  if (!match?.[1] || !update.message) return;

  try {
    const user = authService.verifyPurposeToken(match[1], "telegram-link");
    await userRepository.updateTelegramChatId(user.id, String(update.message.chat.id));
    await telegramClient.sendMessage(String(update.message.chat.id), telegramTemplates.linked(user.username));
  } catch {
    await telegramClient.sendMessage(
      String(update.message.chat.id),
      "Tautan ini tidak valid atau sudah kedaluwarsa. Buat tautan baru dari SmartSchedule."
    );
  }
}
