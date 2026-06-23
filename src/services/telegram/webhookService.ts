import { env } from "../../config/env";
import { logger } from "../../config/logger";
import { telegramClient } from "./telegramClient";

export async function setupTelegramWebhook(): Promise<void> {
  if (!env.TELEGRAM_WEBHOOK_ENABLED || !env.TELEGRAM_NOTIFICATIONS_ENABLED) return;

  const webhookUrl = env.TELEGRAM_WEBHOOK_URL || `${env.BACKEND_URL}/integrations/telegram/webhook`;
  logger.info({ webhookUrl }, "Registering Telegram webhook...");

  try {
    const success = await telegramClient.setWebhook(webhookUrl, env.TELEGRAM_WEBHOOK_SECRET || undefined);
    if (success) {
      logger.info("Telegram webhook registration completed");
    } else {
      logger.error("Telegram webhook registration failed");
    }
  } catch (error) {
    logger.error({ error }, "Error setting up Telegram webhook");
  }
}
