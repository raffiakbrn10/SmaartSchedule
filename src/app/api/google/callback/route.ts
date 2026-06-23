import { env } from "@/config/env";
import { userRepository } from "@/repositories/userRepository";
import { googleCalendarService } from "@/services/googleCalendarService";
import { verifyPurposeToken } from "@/lib/server/auth";
import { AppError } from "@/utils/errors";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  try {
    if (!code || !state) throw new AppError(400, "Google authorization code is required.");
    const user = verifyPurposeToken(state, "google-link");
    const refreshToken = await googleCalendarService.exchangeCode(code);
    if (!refreshToken) throw new AppError(400, "Google tidak mengembalikan refresh token. Cabut akses lama lalu coba lagi.");
    await userRepository.updateGoogleRefreshToken(user.id, refreshToken);
    return Response.redirect(`${env.FRONTEND_URL}/profile?google_linked=success`);
  } catch {
    return Response.redirect(`${env.FRONTEND_URL}/profile?google_linked=failed`);
  }
}
