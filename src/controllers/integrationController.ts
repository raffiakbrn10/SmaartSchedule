import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { userRepository } from "../repositories/userRepository";
import { authService } from "../services/authService";
import { googleCalendarService } from "../services/googleCalendarService";
import { handleTelegramUpdate } from "../services/telegram/updateHandler";
import type { ApiResponse } from "../types/api";
import { AppError } from "../utils/errors";

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
      if ((!env.TELEGRAM_POLLING_ENABLED && !env.TELEGRAM_WEBHOOK_ENABLED) || !env.TELEGRAM_BOT_USERNAME) {
        throw new AppError(503, "Penautan Telegram belum dikonfigurasi.");
      }
      const token = authService.createPurposeToken(req.user!, "telegram-link");
      const safeToken = Buffer.from(token).toString("base64url");
      res.json({ success: true, message: "Tautan Telegram dibuat.", data: { url: `https://t.me/${env.TELEGRAM_BOT_USERNAME}?start=${safeToken}` } });
    } catch (error) { next(error); }
  },
  async telegramWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!env.TELEGRAM_WEBHOOK_ENABLED) {
        throw new AppError(403, "Webhook Telegram dinonaktifkan.");
      }
      if (env.TELEGRAM_WEBHOOK_SECRET) {
        const incomingSecret = req.headers["x-telegram-bot-api-secret-token"];
        if (incomingSecret !== env.TELEGRAM_WEBHOOK_SECRET) {
          throw new AppError(401, "Token rahasia webhook tidak valid.");
        }
      }
      const update = req.body;
      if (update && typeof update === "object" && "update_id" in update) {
        try {
          const promise = handleTelegramUpdate(update);
          if (promise && typeof promise.catch === "function") {
            promise.catch((error) => {
              logger.error({ error, update }, "Error handling Telegram update via webhook");
            });
          }
        } catch (error) {
          logger.error({ error, update }, "Error invoking handleTelegramUpdate");
        }
      }
      res.status(200).json({ success: true, message: "Webhook diproses." });
    } catch (error) { next(error); }
  },
};



