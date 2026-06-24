import { env } from "@/config/env";
import { logger } from "@/config/logger";
import { handleTelegramUpdate } from "@/services/telegram/updateHandler";

export async function POST(request: Request) {
  try {
    if (!env.TELEGRAM_WEBHOOK_ENABLED) {
      return Response.json({ success: false, message: "Webhook Telegram dinonaktifkan." }, { status: 403 });
    }

    // Validate webhook secret token
    if (env.TELEGRAM_WEBHOOK_SECRET) {
      const incomingSecret = request.headers.get("x-telegram-bot-api-secret-token");
      if (incomingSecret !== env.TELEGRAM_WEBHOOK_SECRET) {
        return Response.json({ success: false, message: "Token rahasia webhook tidak valid." }, { status: 401 });
      }
    }

    const body = await request.json();

    if (body && typeof body === "object" && "update_id" in body) {
      try {
        const promise = handleTelegramUpdate(body);
        if (promise && typeof promise.catch === "function") {
          promise.catch((error) => {
            logger.error({ error, update: body }, "Error handling Telegram update via Next.js webhook");
          });
        }
      } catch (error) {
        logger.error({ error, update: body }, "Error invoking handleTelegramUpdate from Next.js webhook");
      }
    }

    return Response.json({ success: true, message: "Webhook diproses." });
  } catch (error) {
    logger.error({ error }, "Telegram webhook route error");
    return Response.json({ success: false, message: "Webhook error." }, { status: 500 });
  }
}
