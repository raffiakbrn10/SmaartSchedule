import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { notificationService } from "../services/telegram/notificationService";
import type { DeliveryResult } from "../services/telegram/types";
import type { ApiResponse } from "../types/api";

const testSchema = z.object({ chatId: z.string().trim().min(1).optional() });

export const adminController = {
  async testTelegram(req: Request, res: Response<ApiResponse<DeliveryResult>>, next: NextFunction): Promise<void> {
    try {
      const { chatId } = testSchema.parse(req.body);
      const result = await notificationService.sendTestNotification(req.user!.username, chatId);
      res.status(result.ok ? 200 : 503).json({ success: result.ok, message: result.ok ? "Notifikasi uji terkirim." : "Notifikasi uji tidak terkirim.", data: result });
    } catch (error) { next(error); }
  },
};



