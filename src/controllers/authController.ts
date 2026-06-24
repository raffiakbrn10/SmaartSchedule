import type { NextFunction, Request, Response } from "express";
import { google } from "googleapis";
import { env } from "../config/env";
import { userRepository } from "../repositories/userRepository";
import type { CredentialsInput } from "../schemas/auth";
import { authService } from "../services/authService";
import type { ApiResponse, AuthUser } from "../types/api";
import { AppError } from "../utils/errors";

const authCookieName = "smartschedule_session";
const jwtSecret = process.env.JWT_SECRET || "development-only-secret-change-me-now";
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "1d";
const cookieOptions = { httpOnly: true, secure: env.NODE_ENV === "production", sameSite: "lax" as const, maxAge: 24 * 60 * 60 * 1000, path: "/" };

export const authController = {
  async register(req: Request<Record<string, never>, ApiResponse<{ user: AuthUser }>, CredentialsInput>, res: Response<ApiResponse<{ user: AuthUser }>>, next: NextFunction): Promise<void> {
    try {
      const user = await authService.register(req.body);
      res.status(201).json({ success: true, message: "Registrasi berhasil. Silakan masuk.", data: { user } });
    } catch (error) { next(error); }
  },
  async login(req: Request<Record<string, never>, ApiResponse<{ user: AuthUser }>, CredentialsInput>, res: Response<ApiResponse<{ user: AuthUser }>>, next: NextFunction): Promise<void> {
    try {
      const { user, token } = await authService.login(req.body);
      res.cookie(authCookieName, token, cookieOptions).json({ success: true, message: "Login berhasil.", data: { user } });
    } catch (error) { next(error); }
  },
  logout(_req: Request, res: Response<ApiResponse<never>>): void {
    res.clearCookie(authCookieName, { ...cookieOptions, maxAge: undefined }).json({ success: true, message: "Logout berhasil." });
  },
  me(req: Request, res: Response<ApiResponse<{ user: AuthUser }>>): void {
    res.json({ success: true, message: "Sesi aktif.", data: { user: req.user! } });
  },
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { displayName } = req.body;
      if (!displayName || typeof displayName !== "string" || displayName.trim().length < 2) {
        throw new AppError(400, "Nama panggilan harus berupa teks minimal 2 karakter.");
      }
      await userRepository.updateDisplayName(req.user!.id, displayName.trim());
      // Re-sign token
      const authUser: AuthUser = { id: req.user!.id, username: req.user!.username, displayName: displayName.trim() };
      const jwt = await import("jsonwebtoken");
      const token = jwt.default.sign(authUser, jwtSecret, { expiresIn: jwtExpiresIn as any });
      res.cookie(authCookieName, token, cookieOptions).json({ success: true, message: "Profil berhasil diperbarui.", data: { user: authUser } });
    } catch (error) { next(error); }
  },
  googleLogin(_req: Request, res: Response, next: NextFunction): void {
    try {
      if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
        throw new AppError(503, "Google Login belum dikonfigurasi.");
      }
      const redirectUri = `${env.BACKEND_URL}/auth/google/callback`;
      const client = new google.auth.OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, redirectUri);
      const url = client.generateAuthUrl({
        access_type: "online",
        scope: ["openid", "email", "profile"],
      });
      res.redirect(url);
    } catch (error) { next(error); }
  },
  async googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const code = req.query.code as string;
      if (!code) throw new AppError(400, "Google authorization code is required.");
      
      const redirectUri = `${env.BACKEND_URL}/auth/google/callback`;
      const client = new google.auth.OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, redirectUri);
      const { tokens } = await client.getToken(code);
      client.setCredentials(tokens);
      
      const oauth2 = google.oauth2({ version: "v2", auth: client });
      const userInfo = await oauth2.userinfo.get();
      const email = userInfo.data.email;
      const googleName = userInfo.data.name || email?.split('@')[0];
      if (!email) throw new AppError(400, "Email Google tidak ditemukan.");
      
      let user = await userRepository.findByUsername(email);
      if (!user) {
        const bcrypt = await import("bcryptjs");
        const randomPassword = Math.random().toString(36) + Math.random().toString(36);
        const hashedPassword = await bcrypt.default.hash(randomPassword, 12);
        const id = await userRepository.create(email, hashedPassword, googleName);
        user = {
          id,
          username: email,
          password: hashedPassword,
          display_name: googleName || null,
          google_refresh_token: null,
          telegram_chat_id: null
        };
      }
      
      const authUser: AuthUser = { id: user.id, username: user.username, ...(user.display_name && { displayName: user.display_name }) };
      const jwt = await import("jsonwebtoken");
      const token = jwt.default.sign(authUser, jwtSecret, { expiresIn: jwtExpiresIn as any });
      
      res.cookie(authCookieName, token, cookieOptions);
      res.redirect(`${env.FRONTEND_URL}/dashboard`);
    } catch (error) {
      next(error);
    }
  }
};



