import { requireAuth } from "@/lib/server/auth";

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    return Response.json({ success: true, message: "Sesi aktif.", data: { user } });
  } catch (error) {
    return Response.json({ success: false, message: error instanceof Error ? error.message : "Autentikasi diperlukan." }, { status: 401 });
  }
}
