import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { adminController } from "../controllers/adminController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

export const adminRoutes = Router();
adminRoutes.use(requireAuth, requireAdmin);
adminRoutes.post("/notifications/test", rateLimit({ windowMs: 60_000, limit: 3, standardHeaders: "draft-8", legacyHeaders: false }), adminController.testTelegram);
