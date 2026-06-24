import { env } from "@/config/env";
import { createPurposeToken, requireAuth } from "@/lib/server/auth";
import { AppError } from "@/utils/errors";

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    if ((!env.TELEGRAM_POLLING_ENABLED && !env.TELEGRAM_WEBHOOK_ENABLED) || !env.TELEGRAM_BOT_USERNAME) {
      throw new AppError(503, "Penautan Telegram belum dikonfigurasi.");
    }
    const token = createPurposeToken(user, "telegram-link");
    // Encode token to base64url so it is URL-safe and matches the
    // decoding logic in updateHandler.ts (Buffer.from(x, "base64url"))
    const safeToken = Buffer.from(token).toString("base64url");
    return Response.json({ success: true, message: "Tautan Telegram dibuat.", data: { url: `https://t.me/${env.TELEGRAM_BOT_USERNAME}?start=${safeToken}` } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Autentikasi diperlukan.";
    const status = error instanceof AppError ? error.statusCode : 401;
    return Response.json({ success: false, message }, { status });
  }
}
