import { env } from "@/config/env";
import { createPurposeToken, requireAuth } from "@/lib/server/auth";
import { googleCalendarService } from "@/services/googleCalendarService";
import { AppError } from "@/utils/errors";

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    const state = createPurposeToken(user, "google-link");
    return Response.json({ success: true, message: "URL Google dibuat.", data: { url: googleCalendarService.getAuthorizationUrl(state) } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal membuat URL Google.";
    const status = error instanceof AppError ? error.statusCode : 400;
    return Response.json({ success: false, message }, { status });
  }
}
