import { env } from "@/config/env";
import { createPurposeToken, requireAuth } from "@/lib/server/auth";
import { AppError } from "@/utils/errors";

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    if (!env.TELEGRAM_BOT_USERNAME) throw new AppError(503, "Penautan Telegram belum dikonfigurasi.");
    const token = createPurposeToken(user, "telegram-link");
    return Response.json({ success: true, message: "Tautan Telegram dibuat.", data: { url: `https://t.me/${env.TELEGRAM_BOT_USERNAME}?start=${encodeURIComponent(token)}` } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Autentikasi diperlukan.";
    const status = error instanceof AppError ? error.statusCode : 401;
    return Response.json({ success: false, message }, { status });
  }
}
