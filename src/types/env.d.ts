declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
      PORT?: string;
      FRONTEND_URL?: string;
      BACKEND_URL?: string;
      CORS_ORIGINS?: string;
      ADMIN_USER_IDS?: string;
      NEXT_PUBLIC_SUPABASE_URL?: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
      NEXT_PUBLIC_BACKEND_URL?: string;
      DB_HOST?: string;
      DB_PORT?: string;
      DB_USER?: string;
      DB_PASSWORD?: string;
      DB_NAME?: string;
      DB_SSL?: string;
      DATABASE_URL?: string;
      GOOGLE_CLIENT_ID?: string;
      GOOGLE_CLIENT_SECRET?: string;
      GOOGLE_REDIRECT_URI?: string;
      TELEGRAM_BOT_TOKEN?: string;
      TELEGRAM_DEFAULT_CHAT_ID?: string;
      TELEGRAM_BOT_USERNAME?: string;
      TELEGRAM_NOTIFICATIONS_ENABLED?: string;
      TELEGRAM_POLLING_ENABLED?: string;
      TELEGRAM_WEBHOOK_ENABLED?: string;
      TELEGRAM_WEBHOOK_SECRET?: string;
      TELEGRAM_WEBHOOK_URL?: string;
      TELEGRAM_REQUEST_TIMEOUT_MS?: string;
      TELEGRAM_MAX_RETRIES?: string;
      REMINDER_JOB_ENABLED?: string;
      CRON_SECRET?: string;
    }
  }
}

export {};
