import { createServer } from "node:http";
import next from "next";
import { verifyDatabaseConnection } from "./config/database";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { startReminderJob } from "./jobs/reminderJob";
import { createApp } from "./app";
import { startTelegramPolling, stopTelegramPolling } from "./services/telegram/pollingService";
import { setupTelegramWebhook } from "./services/telegram/webhookService";

async function main(): Promise<void> {
  await verifyDatabaseConnection();
  logger.info("Database connection verified");

  const dev = env.NODE_ENV !== "production";
  // @ts-ignore Next.js default export typing is not seen as callable in ESM NodeNext resolution
  const nextApp = next({ dev });
  const handle = nextApp.getRequestHandler();

  await nextApp.prepare();
  logger.info("Next.js preparation complete");

  const expressApp = createApp(handle);
  const server = createServer(expressApp);
  const reminderTask = startReminderJob();
  if (env.TELEGRAM_WEBHOOK_ENABLED) {
    void setupTelegramWebhook();
  } else {
    void startTelegramPolling();
  }

  server.listen(env.PORT, () => logger.info({ port: env.PORT }, "SmartSchedule server started"));

  const shutdown = (): void => {
    void reminderTask?.stop();
    stopTelegramPolling();
    server.close((error) => {
      if (error) logger.error({ error }, "Server shutdown failed");
      process.exit(error ? 1 : 0);
    });
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

void main().catch((error: unknown) => {
  console.error("FULL ERROR OBJECT:", error);
  if (error instanceof Error) {
    console.error("STACK TRACE:", error.stack);
  }
  logger.fatal({ error }, "Server startup failed");
  process.exit(1);
});



