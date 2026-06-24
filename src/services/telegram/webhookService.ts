import { env } from "../../config/env";
import { logger } from "../../config/logger";
import { telegramClient } from "./telegramClient";

export async function setupTelegramWebhook(): Promise<void> {
  if (!env.TELEGRAM_WEBHOOK_ENABLED || !env.TELEGRAM_NOTIFICATIONS_ENABLED) return;

  const webhookUrl = env.TELEGRAM_WEBHOOK_URL || `${env.BACKEND_URL}/api/integrations/telegram/webhook`;
  logger.info({ webhookUrl }, "Registering Telegram webhook...");

  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const success = await telegramClient.setWebhook(webhookUrl, env.TELEGRAM_WEBHOOK_SECRET || undefined);
      if (success) {
        logger.info("Telegram webhook registration completed");
        return;
      } else {
        logger.error(`Telegram webhook registration failed (Attempt ${attempt})`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      const cause = error instanceof Error && 'cause' in error ? String((error as any).cause) : undefined;
      logger.error({ err: errorMessage, cause, stack: errorStack }, `Error setting up Telegram webhook (Attempt ${attempt})`);
    }

    if (attempt < 5) {
      const waitTime = Math.pow(2, attempt) * 1000;
      logger.info(`Retrying Telegram webhook registration in ${waitTime/1000}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}
