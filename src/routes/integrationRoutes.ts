import { Router } from "express";
import { integrationController } from "../controllers/integrationController.js";
import { requireAuth } from "../middleware/auth.js";

export const integrationRoutes = Router();
integrationRoutes.get("/status", requireAuth, integrationController.status);
integrationRoutes.get("/telegram/link", requireAuth, integrationController.telegramLink);

export const googleRoutes = Router();
googleRoutes.get("/auth-url", requireAuth, integrationController.googleAuthUrl);
googleRoutes.get("/callback", integrationController.googleCallback);
