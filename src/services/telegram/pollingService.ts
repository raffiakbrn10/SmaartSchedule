import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";
import { userRepository } from "../../repositories/userRepository.js";
import { authService } from "../authService.js";
import { telegramClient } from "./telegramClient.js";
import { telegramTemplates } from "./templates.js";

let stopped = false;

export function stopTelegramPolling(): void { stopped = true; }

export async function startTelegramPolling(): Promise<void> {
  if (!env.TELEGRAM_POLLING_ENABLED || !env.TELEGRAM_NOTIFICATIONS_ENABLED) return;
  stopped = false;
  let offset = 0;
  logger.info("Telegram account-link polling started");
  while (!stopped) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25_000);
    try {
      const updates = await telegramClient.getUpdates(offset, controller.signal);
      for (const update of updates) {
        offset = update.update_id + 1;
        const match = update.message?.text?.match(/^\/start\s+(.+)$/);
        if (!match?.[1] || !update.message) continue;
        try {
          const user = authService.verifyPurposeToken(match[1], "telegram-link");
          await userRepository.updateTelegramChatId(user.id, String(update.message.chat.id));
          await telegramClient.sendMessage(String(update.message.chat.id), telegramTemplates.linked(user.username));
        } catch { await telegramClient.sendMessage(String(update.message.chat.id), "Tautan ini tidak valid atau sudah kedaluwarsa. Buat tautan baru dari SmartSchedule."); }
      }
    } catch (error) {
      if (!stopped) logger.warn({ error }, "Telegram polling cycle failed");
    } finally { clearTimeout(timer); }
    if (!stopped) await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
