import { z } from "zod";

export const priorities = ["Rendah", "Medium", "Tinggi"] as const;
export const statuses = ["Belum Selesai", "Sedang Berjalan", "Selesai"] as const;

export const scheduleInputSchema = z.object({
  judul: z.string().trim().min(1, "Judul wajib diisi").max(200),
  prioritas: z.enum(priorities),
  status: z.enum(statuses),
  deadline: z.iso.datetime({ local: true }).or(z.string().datetime()),
});

export const scheduleIdSchema = z.coerce.number().int().positive();
export type ScheduleInput = z.infer<typeof scheduleInputSchema>;
