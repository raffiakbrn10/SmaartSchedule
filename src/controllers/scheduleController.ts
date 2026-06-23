import type { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";
import { scheduleRepository, type ScheduleRecord } from "../repositories/scheduleRepository";
import { userRepository } from "../repositories/userRepository";
import { scheduleIdSchema, type ScheduleInput } from "../schemas/schedule";
import { googleCalendarService } from "../services/googleCalendarService";
import { notificationService } from "../services/telegram/notificationService";
import type { ApiResponse } from "../types/api";
import { AppError, errorMessage } from "../utils/errors";

export const scheduleController = {
  async list(req: Request, res: Response<ApiResponse<{ schedules: ScheduleRecord[] }>>, next: NextFunction): Promise<void> {
    try { res.json({ success: true, message: "Jadwal berhasil dimuat.", data: { schedules: await scheduleRepository.findByUserId(req.user!.id) } }); }
    catch (error) { next(error); }
  },
  async create(req: Request<Record<string, never>, ApiResponse<{ id: number }>, ScheduleInput>, res: Response<ApiResponse<{ id: number }>>, next: NextFunction): Promise<void> {
    try {
      const id = await scheduleRepository.create(req.user!.id, req.body);
      const user = await userRepository.findById(req.user!.id);
      if (user?.telegram_chat_id) void notificationService.sendNotification({ type: "schedule-created", dedupeKey: `schedule-created:${id}`, chatId: user.telegram_chat_id, title: req.body.judul, deadline: new Date(req.body.deadline) }).catch((error: unknown) => logger.warn({ error: errorMessage(error), scheduleId: id }, "Schedule notification failed"));
      if (user?.google_refresh_token) void googleCalendarService.createEvent(user.google_refresh_token, { title: req.body.judul, deadline: new Date(req.body.deadline), description: `Prioritas: ${req.body.prioritas}` });
      res.status(201).json({ success: true, message: "Jadwal berhasil ditambahkan.", data: { id } });
    } catch (error) { next(error); }
  },
  async update(req: Request<{ id: string }, ApiResponse<never>, ScheduleInput>, res: Response<ApiResponse<never>>, next: NextFunction): Promise<void> {
    try {
      const id = scheduleIdSchema.parse(req.params.id);
      if (!(await scheduleRepository.update(id, req.user!.id, req.body))) throw new AppError(404, "Jadwal tidak ditemukan.");
      res.json({ success: true, message: "Jadwal berhasil diperbarui." });
    } catch (error) { next(error); }
  },
  async delete(req: Request<{ id: string }>, res: Response<ApiResponse<never>>, next: NextFunction): Promise<void> {
    try {
      const id = scheduleIdSchema.parse(req.params.id);
      if (!(await scheduleRepository.delete(id, req.user!.id))) throw new AppError(404, "Jadwal tidak ditemukan.");
      res.json({ success: true, message: "Jadwal berhasil dihapus." });
    } catch (error) { next(error); }
  },
};



