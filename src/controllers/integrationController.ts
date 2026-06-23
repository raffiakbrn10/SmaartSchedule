import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import { userRepository } from "../repositories/userRepository.js";
import { authService } from "../services/authService.js";
import { googleCalendarService } from "../services/googleCalendarService.js";
import type { ApiResponse } from "../types/api.js";
import { AppError } from "../utils/errors.js";

const callbackSchema = z.object({ code: z.string().min(1), state: z.string().min(1) });

export const integrationController = {
  async status(req: Request, res: Response<ApiResponse<{ googleLinked: boolean; telegramLinked: boolean }>>, next: NextFunction): Promise<void> {
    try {
      const user = await userRepository.findById(req.user!.id);
      if (!user) throw new AppError(404, "Pengguna tidak ditemukan.");
      res.json({ success: true, message: "Status integrasi berhasil dimuat.", data: { googleLinked: Boolean(user.google_refresh_token), telegramLinked: Boolean(user.telegram_chat_id) } });
    } catch (error) { next(error); }
  },
  googleAuthUrl(req: Request, res: Response<ApiResponse<{ url: string }>>, next: NextFunction): void {
    try {
      const state = authService.createPurposeToken(req.user!, "google-link");
      res.json({ success: true, message: "URL Google dibuat.", data: { url: googleCalendarService.getAuthorizationUrl(state) } });
    } catch (error) { next(error); }
  },
  async googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, state } = callbackSchema.parse(req.query);
      const user = authService.verifyPurposeToken(state, "google-link");
      const refreshToken = await googleCalendarService.exchangeCode(code);
      if (!refreshToken) throw new AppError(400, "Google tidak mengembalikan refresh token. Cabut akses lama lalu coba lagi.");
      await userRepository.updateGoogleRefreshToken(user.id, refreshToken);
      res.redirect(`${env.FRONTEND_URL}/profile?google_linked=success`);
    } catch (error) {
      if (error instanceof AppError) return next(error);
      res.redirect(`${env.FRONTEND_URL}/profile?google_linked=failed`);
    }
  },
  telegramLink(req: Request, res: Response<ApiResponse<{ url: string }>>, next: NextFunction): void {
    try {
      if (!env.TELEGRAM_POLLING_ENABLED || !env.TELEGRAM_BOT_USERNAME) throw new AppError(503, "Penautan Telegram belum dikonfigurasi.");
      const token = authService.createPurposeToken(req.user!, "telegram-link");
      res.json({ success: true, message: "Tautan Telegram dibuat.", data: { url: `https://t.me/${env.TELEGRAM_BOT_USERNAME}?start=${encodeURIComponent(token)}` } });
    } catch (error) { next(error); }
  },
};
