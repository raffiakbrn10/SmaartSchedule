import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { supabase } from "../config/supabase.js";
import { userRepository } from "../repositories/userRepository.js";
import { AppError } from "../utils/errors.js";

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.get("authorization");
    const bearer = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
    
    const cookie = req.cookies as Record<string, unknown> | undefined;
    const cookieToken = cookie?.["sb-access-token"] || cookie?.["smartschedule_session"];
    
    const token = bearer ?? (typeof cookieToken === "string" ? cookieToken : undefined);
    if (!token) throw new AppError(401, "Autentikasi diperlukan.");
    
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);
    if (error || !supabaseUser || !supabaseUser.email) {
      throw new AppError(401, "Sesi tidak valid atau kedaluwarsa.");
    }
    
    const email = supabaseUser.email;
    const localId = supabaseUser.user_metadata?.local_user_id;
    
    let localUser: { id: number; username: string };
    if (typeof localId === "number") {
      localUser = { id: localId, username: email };
    } else {
      let record = await userRepository.findByUsername(email);
      if (!record) {
        const dummyPasswordHash = "SUPABASE_EXTERNAL_AUTH";
        const id = await userRepository.create(email, dummyPasswordHash);
        record = {
          id,
          username: email,
          password: dummyPasswordHash,
          google_refresh_token: null,
          telegram_chat_id: null,
        };
      }
      localUser = { id: record.id, username: record.username };
    }
    
    req.user = { id: localUser.id, username: localUser.username };
    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError(401, "Sesi tidak valid atau kedaluwarsa."));
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user || !env.adminUserIds.has(req.user.id)) return next(new AppError(403, "Akses administrator diperlukan."));
  next();
}
