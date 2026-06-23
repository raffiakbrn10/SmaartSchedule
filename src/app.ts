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
  nextHandler?: (
    req: express.Request,
    res: express.Response,
  ) => Promise<void> | void,
) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(pinoHttp({ logger }));
  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        callback(null, !origin || env.corsOrigins.includes(origin));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    }),
  );
  app.use(express.json({ limit: "64kb" }));
  app.use(cookieParser());

  // === PERBAIKAN 1: Menghapus app.get("/") agar rute utama diambil alih Next.js ===
  // (Rute lama: app.get("/", ...) dihapus dari sini)

  // Rute API tetap dipertahankan
  app.get("/health", (_req, res) => {
    res.json({ success: true, message: "API sehat.", data: { status: "ok" } });
  });
  app.use("/auth", authRoutes);
  app.use("/schedules", scheduleRoutes);
  app.use("/google", googleRoutes);
  app.use("/integrations", integrationRoutes);
  app.use("/api/users", integrationRoutes);
  app.use("/admin", adminRoutes);

  // Jalur jembatan antara Express dan Next.js
  if (nextHandler) {
    app.use((req, res, next) => {
      const apiPrefixes = [
        "/auth",
        "/schedules",
        "/google",
        "/integrations",
        "/api/users",
        "/admin",
        "/health",
      ];

      // === PERBAIKAN 2: Menghapus kondisi '|| req.path === "/"' ===
      // Ini memastikan jika user mengakses "/", "/dashboard", atau halaman UI lainnya, Express akan langsung melemparnya ke Next.js
      const isApi = apiPrefixes.some(
        (prefix) => req.path === prefix || req.path.startsWith(prefix + "/"),
      );

      if (isApi) {
        return next(); // Jika rute API, lanjut diproses oleh Express di atas
      }

      // Jika BUKAN rute API, biarkan Next.js yang memproses tampilannya
      void nextHandler(req, res);
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}



