import { z } from "zod";

export const scheduleSchema = z.object({
  judul: z.string().trim().min(1, "Judul wajib diisi").max(200),
  prioritas: z.enum(["Rendah", "Medium", "Tinggi"]),
  status: z.enum(["Belum Selesai", "Sedang Berjalan", "Selesai"]),
  deadline: z.string().min(1, "Deadline wajib diisi"),
});
