import jwt, { type SignOptions } from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/config/env";
import { userRepository } from "@/repositories/userRepository";
import { AppError } from "@/utils/errors";

interface SessionClaims extends jwt.JwtPayload { id: number; username: string; purpose?: string }

const jwtSecret = process.env.JWT_SECRET || (process.env.NODE_ENV === "production" ? "change-me-in-vercel" : "development-only-secret-change-me-now");
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "1d";
const options: SignOptions = { expiresIn: jwtExpiresIn as NonNullable<SignOptions["expiresIn"]> };

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } });

export interface AuthUser { id: number; username: string }

export async function requireAuth(request: Request): Promise<AuthUser> {
  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) throw new AppError(401, "Autentikasi diperlukan.");

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user?.email) throw new AppError(401, "Sesi tidak valid atau kedaluwarsa.");

  const localId = user.user_metadata?.local_user_id;
  if (typeof localId === "number") return { id: localId, username: user.email };

  const existing = await userRepository.findByUsername(user.email);
  if (existing) return { id: existing.id, username: existing.username };
  const id = await userRepository.create(user.email, "SUPABASE_EXTERNAL_AUTH");
  return { id, username: user.email };
}

export function createPurposeToken(user: AuthUser, purpose: "google-link" | "telegram-link", expiresIn: SignOptions["expiresIn"] = "10m"): string {
  return jwt.sign({ ...user, purpose }, jwtSecret, { expiresIn });
}

export function verifyPurposeToken(token: string, purpose: "google-link" | "telegram-link"): AuthUser {
  const decoded = jwt.verify(token, jwtSecret) as SessionClaims;
  if (decoded.purpose !== purpose || !Number.isSafeInteger(decoded.id) || !decoded.username) throw new AppError(400, "Tautan integrasi tidak valid atau kedaluwarsa.");
  return { id: decoded.id, username: decoded.username };
}

export function signSession(user: AuthUser): string {
  return jwt.sign(user, jwtSecret, options);
}
