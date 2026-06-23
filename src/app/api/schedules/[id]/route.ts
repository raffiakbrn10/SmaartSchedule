import { scheduleRepository } from "@/repositories/scheduleRepository";
import { scheduleInputSchema, scheduleIdSchema } from "@/schemas/schedule";
import { requireAuth } from "@/lib/server/auth";
import { AppError } from "@/utils/errors";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;
    const scheduleId = scheduleIdSchema.parse(id);
    const body = scheduleInputSchema.parse(await request.json());
    if (!(await scheduleRepository.update(scheduleId, user.id, body))) throw new AppError(404, "Jadwal tidak ditemukan.");
    return Response.json({ success: true, message: "Jadwal berhasil diperbarui." });
  } catch (error) {
    const message = error instanceof AppError ? error.message : error instanceof Error ? error.message : "Gagal memperbarui jadwal.";
    const status = error instanceof AppError ? error.statusCode : 400;
    return Response.json({ success: false, message }, { status });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;
    const scheduleId = scheduleIdSchema.parse(id);
    if (!(await scheduleRepository.delete(scheduleId, user.id))) throw new AppError(404, "Jadwal tidak ditemukan.");
    return Response.json({ success: true, message: "Jadwal berhasil dihapus." });
  } catch (error) {
    const message = error instanceof AppError ? error.message : error instanceof Error ? error.message : "Gagal menghapus jadwal.";
    const status = error instanceof AppError ? error.statusCode : 400;
    return Response.json({ success: false, message }, { status });
  }
}
