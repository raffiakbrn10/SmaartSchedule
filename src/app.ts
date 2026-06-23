import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { adminRoutes } from "./routes/adminRoutes";
import { authRoutes } from "./routes/authRoutes";
import { googleRoutes, integrationRoutes } from "./routes/integrationRoutes";
import { scheduleRoutes } from "./routes/scheduleRoutes";

export function createApp(
  nextHandler?: (req: express.Request, res: express.Response) => Promise<void> | void
) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(pinoHttp({ logger }));
  app.use(helmet());
  app.use(cors({ origin(origin, callback) { callback(null, !origin || env.corsOrigins.includes(origin)); }, credentials: true, methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"] }));
  app.use(express.json({ limit: "64kb" }));
  app.use(cookieParser());

  app.get("/", (_req, res) => { res.type("text").send("SmartSchedule API"); });
  app.get("/health", (_req, res) => { res.json({ success: true, message: "API sehat.", data: { status: "ok" } }); });
  app.use("/auth", authRoutes);
  app.use("/schedules", scheduleRoutes);
  app.use("/google", googleRoutes);
  app.use("/integrations", integrationRoutes);
  app.use("/api/users", integrationRoutes);
  app.use("/admin", adminRoutes);

  if (nextHandler) {
    app.use((req, res, next) => {
      const apiPrefixes = ["/auth", "/schedules", "/google", "/integrations", "/api/users", "/admin", "/health"];
      const isApi = apiPrefixes.some(prefix => req.path === prefix || req.path.startsWith(prefix + "/")) || req.path === "/";
      if (isApi) {
        return next();
      }
      void nextHandler(req, res);
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}



