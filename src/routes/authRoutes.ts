import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { authController } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { credentialsSchema } from "../schemas/auth.js";

export const authRoutes = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 10, standardHeaders: "draft-8", legacyHeaders: false, message: { success: false, message: "Terlalu banyak percobaan. Coba lagi nanti." } });
authRoutes.post("/register", authLimiter, validateBody(credentialsSchema), authController.register);
authRoutes.post("/login", authLimiter, validateBody(credentialsSchema), authController.login);
authRoutes.post("/logout", authController.logout);
authRoutes.get("/me", requireAuth, authController.me);
authRoutes.get("/google", authController.googleLogin);
authRoutes.get("/google/callback", authController.googleCallback);
