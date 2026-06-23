import pino from "pino";
import { env } from "./env";

export const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  redact: ["req.headers.authorization", "req.headers.cookie", "req.headers.x-telegram-bot-api-secret-token", "password", "token", "refreshToken"],
});



