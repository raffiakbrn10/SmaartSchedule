import { Router } from "express";
import { integrationController } from "../controllers/integrationController";
import { requireAuth } from "../middleware/auth";

export const integrationRoutes = Router();
integrationRoutes.get("/status", requireAuth, integrationController.status);
integrationRoutes.get("/telegram/link", requireAuth, integrationController.telegramLink);
integrationRoutes.post("/telegram/webhook", integrationController.telegramWebhook);

export const googleRoutes = Router();
googleRoutes.get("/auth-url", requireAuth, integrationController.googleAuthUrl);
googleRoutes.get("/callback", integrationController.googleCallback);



