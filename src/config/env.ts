import dotenv from "dotenv";
import path from "node:path";
import { z } from "zod";

// Load environment variables from .env.local first, falling back to standard .env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

const booleanString = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),

  FRONTEND_URL: z.url().default("http://localhost:3000"),
  BACKEND_URL: z.url().default("http://localhost:4000"),
  NEXT_PUBLIC_BACKEND_URL: z.string().default(""),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),

  // Menambahkan variabel keamanan & JWT yang sebelumnya terlewat
  JWT_SECRET: z
    .string()
    .min(1)
    .default("secret_pengganti_sementara_untuk_lokal"),
  JWT_EXPIRES_IN: z.string().default("1d"),
  AUTH_COOKIE_NAME: z.string().default("smartschedule_session"),
  ADMIN_USER_IDS: z.string().default(""),

  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url()
    .default("https://placeholder-project-id.supabase.co"),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(1)
    .default("placeholder-anon-key"),

  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_USER: z.string().default("root"),
  DB_PASSWORD: z.string().default(""),
  DB_NAME: z.string().default("smartschedule"),
  DB_SSL: booleanString.default(false),
  DATABASE_URL: z.string().optional(),

  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),
  GOOGLE_REDIRECT_URI: z.url().default("http://localhost:4000/google/callback"),

  TELEGRAM_BOT_TOKEN: z.string().trim().default(""),
  TELEGRAM_DEFAULT_CHAT_ID: z.string().trim().default(""),
  TELEGRAM_BOT_USERNAME: z.string().trim().default(""),
  TELEGRAM_NOTIFICATIONS_ENABLED: booleanString.default(false),
  TELEGRAM_POLLING_ENABLED: booleanString.default(false),
  TELEGRAM_WEBHOOK_ENABLED: booleanString.default(false),
  TELEGRAM_WEBHOOK_SECRET: z.string().trim().default(""),
  TELEGRAM_WEBHOOK_URL: z.string().trim().url().or(z.literal("")).default(""),
  TELEGRAM_REQUEST_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .min(500)
    .max(30_000)
    .default(5000),
  TELEGRAM_MAX_RETRIES: z.coerce.number().int().min(0).max(5).default(2),

  REMINDER_JOB_ENABLED: booleanString.default(false),
  CRON_SECRET: z.string().default(""),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error(
    "Invalid environment configuration",
    parsed.error.flatten().fieldErrors,
  );
  throw new Error("Environment validation failed");
}

if (
  parsed.data.TELEGRAM_NOTIFICATIONS_ENABLED &&
  !parsed.data.TELEGRAM_BOT_TOKEN
) {
  throw new Error(
    "TELEGRAM_BOT_TOKEN is required when Telegram notifications are enabled",
  );
}
if (
  (parsed.data.TELEGRAM_POLLING_ENABLED || parsed.data.TELEGRAM_WEBHOOK_ENABLED) && !parsed.data.TELEGRAM_BOT_USERNAME) {
  throw new Error(
    "TELEGRAM_BOT_USERNAME is required when Telegram polling or webhook is enabled",
  );
}
if (
  parsed.data.TELEGRAM_POLLING_ENABLED &&
  parsed.data.TELEGRAM_WEBHOOK_ENABLED
) {
  throw new Error(
    "Cannot enable both Telegram polling and Telegram webhook at the same time",
  );
}

export const env = {
  ...parsed.data,
  corsOrigins: parsed.data.CORS_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  adminUserIds: new Set(
    parsed.data.ADMIN_USER_IDS.split(",")
      .map(Number)
      .filter(Number.isSafeInteger),
  ),
};
export type Env = typeof env;
export default env;
