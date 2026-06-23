import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { userRepository } from "../repositories/userRepository";
import type { CredentialsInput } from "../schemas/auth";
import type { AuthUser } from "../types/api";
import { AppError } from "../utils/errors";

interface SessionClaims extends jwt.JwtPayload { id: number; username: string; purpose?: string }

const jwtSecret = process.env.JWT_SECRET || (process.env.NODE_ENV === "production" ? crypto.randomBytes(32).toString("hex") : "development-only-secret-change-me-now");
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "1d";

const options: SignOptions = { expiresIn: jwtExpiresIn as NonNullable<SignOptions["expiresIn"]> };

export const authService = {
  async register(input: CredentialsInput): Promise<AuthUser> {
    if (await userRepository.findByUsername(input.username)) throw new AppError(409, "Username sudah digunakan.");
    const id = await userRepository.create(input.username, await bcrypt.hash(input.password, 12));
    return { id, username: input.username };
  },
  async login(input: CredentialsInput): Promise<{ user: AuthUser; token: string }> {
    const user = await userRepository.findByUsername(input.username);
    if (!user || !(await bcrypt.compare(input.password, user.password))) throw new AppError(401, "Username atau password salah.");
    const authUser = { id: user.id, username: user.username };
    return { user: authUser, token: jwt.sign(authUser, jwtSecret, options) };
  },
  verifySession(token: string): AuthUser {
    const decoded = jwt.verify(token, jwtSecret) as SessionClaims;
    if (!Number.isSafeInteger(decoded.id) || !decoded.username || decoded.purpose) throw new AppError(401, "Sesi tidak valid.");
    return { id: decoded.id, username: decoded.username };
  },
  createPurposeToken(user: AuthUser, purpose: "google-link" | "telegram-link", expiresIn: SignOptions["expiresIn"] = "10m"): string {
    return jwt.sign({ ...user, purpose }, jwtSecret, { expiresIn });
  },
  verifyPurposeToken(token: string, purpose: "google-link" | "telegram-link"): AuthUser {
    const decoded = jwt.verify(token, jwtSecret) as SessionClaims;
    if (decoded.purpose !== purpose || !Number.isSafeInteger(decoded.id) || !decoded.username) throw new AppError(400, "Tautan integrasi tidak valid atau kedaluwarsa.");
    return { id: decoded.id, username: decoded.username };
  },
};




