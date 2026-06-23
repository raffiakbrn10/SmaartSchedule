import { env } from "../../config/env";
import { logger } from "../../config/logger";
import { telegramClient } from "./telegramClient";
import { handleTelegramUpdate } from "./updateHandler";

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
        await handleTelegramUpdate(update);
      }
    } catch (error) {
      if (!stopped) logger.warn({ error }, "Telegram polling cycle failed");
    } finally { clearTimeout(timer); }
    if (!stopped) await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}



