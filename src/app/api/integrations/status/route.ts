import { requireAuth } from "@/lib/server/auth";
import { userRepository } from "@/repositories/userRepository";

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    const record = await userRepository.findById(user.id);
    return Response.json({ success: true, message: "Status integrasi berhasil dimuat.", data: { googleLinked: Boolean(record?.google_refresh_token), telegramLinked: Boolean(record?.telegram_chat_id) } });
  } catch {
    return Response.json({ success: false, message: "Autentikasi diperlukan." }, { status: 401 });
  }
}
