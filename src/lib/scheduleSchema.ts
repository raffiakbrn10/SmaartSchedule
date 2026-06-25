import { z } from "zod";

export const scheduleSchema = z.object({
  judul: z.string().trim().min(1, "Judul wajib diisi").max(200),
  kategori: z.enum(["Tugas", "Organisasi", "Kepanitiaan"]),
  prioritas: z.enum(["Rendah", "Medium", "Tinggi"]),
  status: z.enum(["Belum Selesai", "Selesai"]),
  deadline: z.string().min(1, "Deadline wajib diisi"),
});
