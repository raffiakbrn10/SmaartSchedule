import { scheduleRepository } from "@/repositories/scheduleRepository";
import { scheduleInputSchema } from "@/schemas/schedule";
import { requireAuth } from "@/lib/server/auth";
import { AppError } from "@/utils/errors";

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    const schedules = await scheduleRepository.findByUserId(user.id);
    return Response.json({ success: true, message: "Jadwal berhasil dimuat.", data: { schedules } });
  } catch (error) {
    return Response.json({ success: false, message: error instanceof Error ? error.message : "Gagal memuat jadwal." }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);
    const body = scheduleInputSchema.parse(await request.json());
    const id = await scheduleRepository.create(user.id, body);
    return Response.json({ success: true, message: "Jadwal berhasil ditambahkan.", data: { id } }, { status: 201 });
  } catch (error) {
    const message = error instanceof AppError ? error.message : error instanceof Error ? error.message : "Gagal menambahkan jadwal.";
    const status = error instanceof AppError ? error.statusCode : 400;
    return Response.json({ success: false, message }, { status });
  }
}
