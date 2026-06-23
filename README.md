# SmartSchedule

SmartSchedule is a TypeScript task and deadline manager with a Next.js App Router frontend and a separate Express API. It preserves the original registration, dashboard, schedule management, Google Calendar, Telegram linking, and deadline-reminder workflows while moving secrets, database access, and integrations entirely to the backend.

## Architecture and stack

- `frontend/` — Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Zod, accessible client interactions, and a centralized typed API client.
- `backend/` — Express 5, TypeScript, Zod validation, MySQL/TiDB repositories, HTTP-only JWT sessions (with bearer-token compatibility), Google Calendar, Telegram Bot API, structured Pino logging, Helmet, restricted CORS, and endpoint rate limits.
- `backend/migrations/` — additive SQL migrations. Existing `users`, `schedules`, and `notifications` records are not replaced.
- One npm workspace and one root `package-lock.json` manage both applications.

The frontend never accesses MySQL, Google client secrets, the Telegram Bot API, or private environment variables. Schedule writes complete independently of Google or Telegram delivery outcomes.

## Prerequisites

- Node.js 22 or newer
- npm 11 or newer
- MySQL 8-compatible database or TiDB
- Optional Google Cloud OAuth credentials
- Optional Telegram bot credentials

## Installation

```bash
npm ci
```

Copy the environment templates:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env.local
```

Create a long random `JWT_SECRET` (at least 32 characters), then configure the database values in `backend/.env`. Do not commit either local environment file.

## Database setup and migration

The application expects the existing schema fields used by the legacy release:

- `users`: `id`, `username`, `password`, `google_refresh_token`, `telegram_chat_id`
- `schedules`: `id`, `user_id`, `judul`, `prioritas`, `status`, `deadline`
- `notifications`: retained for backward compatibility

Apply the additive migration after backing up production data:

```bash
npm run db:migrate
```

Migration `001_notification_delivery.sql` adds `schedules.reminder_level` when missing and creates `notification_deliveries`. The new table stores idempotency keys and delivery outcomes so repeated application events do not produce duplicate messages. No existing rows are deleted or rewritten.

## Environment variables

Backend variables are documented in [`backend/.env.example`](backend/.env.example):

| Variable | Purpose |
| --- | --- |
| `PORT`, `BACKEND_URL`, `FRONTEND_URL` | Service addresses; defaults are ports 4000 and 3000. |
| `CORS_ORIGINS` | Comma-separated exact frontend origins allowed to send credentialed requests. |
| `JWT_SECRET`, `JWT_EXPIRES_IN`, `AUTH_COOKIE_NAME` | Signed HTTP-only session configuration. |
| `ADMIN_USER_IDS` | Comma-separated database user IDs allowed to call admin endpoints. |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL` | MySQL/TiDB connection. Use `DB_SSL=true` for TiDB Cloud. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` | Google Calendar OAuth. The callback must end in `/google/callback`. |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_DEFAULT_CHAT_ID` | Telegram Bot API credentials and optional fallback destination. |
| `TELEGRAM_BOT_USERNAME` | Bot username used to create signed account-link links. |
| `TELEGRAM_NOTIFICATIONS_ENABLED` | Master delivery switch. Keep `false` in tests and until credentials are ready. |
| `TELEGRAM_POLLING_ENABLED` | Enables `/start` account-link polling. Run it on one designated backend worker. |
| `TELEGRAM_REQUEST_TIMEOUT_MS`, `TELEGRAM_MAX_RETRIES` | Delivery timeout and limited retry policy for network, HTTP 429, and HTTP 5xx failures. |
| `REMINDER_JOB_ENABLED` | Enables the minute-level deadline job. A MySQL named lock prevents concurrent backend instances from running the same cycle. |

The frontend exposes only `NEXT_PUBLIC_BACKEND_URL`; it is an API origin, not a secret.

## Development and production commands

```bash
npm run dev                 # frontend and backend together
npm run dev:frontend
npm run dev:backend
npm run typecheck
npm run lint
npm test
npm run build
npm run start               # both production services after build
npm run start:frontend
npm run start:backend
```

The backend verifies environment configuration and database connectivity before listening. For UI-only development without a database, run the frontend separately; protected data screens will show the API error state.

## Telegram setup

1. Open Telegram and message `@BotFather`.
2. Run `/newbot`, choose a display name and unique username, and copy the bot token into `TELEGRAM_BOT_TOKEN`.
3. Set the username without `@` in `TELEGRAM_BOT_USERNAME`.
4. To obtain a chat ID, send a message to the bot and inspect `https://api.telegram.org/bot<token>/getUpdates`, or use the signed **Mulai bot Telegram** link in the profile after polling is enabled. Never paste the token into frontend code or logs.
5. Optionally set `TELEGRAM_DEFAULT_CHAT_ID` for administrator tests and system-level messages.
6. Run the database migration, then set `TELEGRAM_NOTIFICATIONS_ENABLED=true`. Enable `TELEGRAM_POLLING_ENABLED=true` on one backend instance if users need account linking.

Telegram messages are sent as escaped HTML. Requests time out, retry only temporary failures with bounded backoff, and return typed delivery results. Delivery failures are logged without credentials and never cancel schedule creation. Automated tests inject mock HTTP clients and cannot send real messages.

The implemented events are:

- a schedule is created for a user with a linked Telegram chat;
- an incomplete schedule crosses the existing 3-day, 2-day, 1-day, 3-hour, 2-hour, or 1-hour reminder threshold;
- an administrator explicitly invokes the protected test endpoint.

## Testing notifications safely

Keep `TELEGRAM_NOTIFICATIONS_ENABLED=false` while running automated tests:

```bash
npm test
```

For a manual delivery test, authenticate as a user whose ID is present in `ADMIN_USER_IDS`, then send a credentialed request:

```bash
curl -X POST http://localhost:4000/admin/notifications/test \
  -H "Content-Type: application/json" \
  -b "smartschedule_session=<session-cookie>" \
  -d '{}'
```

The optional body `{ "chatId": "123456789" }` overrides the default chat. This route is authenticated, admin-only, and limited to three requests per minute.

## Main API endpoints

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | Service health. |
| `POST` | `/auth/register` | Public, rate limited | Register. |
| `POST` | `/auth/login` | Public, rate limited | Create an HTTP-only session. |
| `POST` | `/auth/logout` | Public | Clear the session. |
| `GET` | `/auth/me` | Authenticated | Current user. |
| `GET/POST` | `/schedules` | Authenticated | List or create schedules. |
| `PUT/DELETE` | `/schedules/:id` | Authenticated, owner-scoped | Update or delete a schedule. |
| `GET` | `/integrations/status` | Authenticated | Google and Telegram link status. |
| `GET` | `/google/auth-url` | Authenticated | Signed Google OAuth URL. |
| `GET` | `/google/callback` | Signed OAuth state | Save a Google refresh token. |
| `GET` | `/integrations/telegram/link` | Authenticated | Short-lived signed Telegram deep link. |
| `POST` | `/admin/notifications/test` | Admin, rate limited | Telegram delivery test. |

Responses use `{ success, message, data?, errors? }`. Production errors do not expose stack traces.

## Deployment considerations

- Deploy `frontend` and `backend` as separate services and use HTTPS for both. Set the exact deployed origins in `FRONTEND_URL`, `BACKEND_URL`, `CORS_ORIGINS`, and `NEXT_PUBLIC_BACKEND_URL`.
- The authentication cookie is `Secure`, `HttpOnly`, and `SameSite=Lax` in production. Use same-site domains (for example `app.example.com` and `api.example.com`) so browsers accept credentialed requests reliably.
- Run `npm run build` in the repository root. Start each workspace independently if the platform manages services separately.
- Apply migrations once during deployment, before enabling reminders.
- The reminder job is safe across multiple backend instances because each cycle obtains a database advisory lock. Enable Telegram long polling on only one designated instance. A webhook is preferable on platforms that suspend workers or prohibit long-lived requests.
- Never enable real Telegram delivery in preview/test environments that share production chat IDs.
- The schedule creation notification and Google event creation are best-effort. For high-volume deployments, replace the in-process dispatch with a durable queue while keeping the existing idempotency keys.

## Troubleshooting

- **Backend exits at startup:** read the environment-validation message, verify database networking/TLS, and confirm `JWT_SECRET` is not the development default in production.
- **Browser reports a CORS error:** add the exact frontend scheme, host, and port to `CORS_ORIGINS`; do not use `*` with credentialed cookies.
- **Login succeeds but the session disappears:** verify HTTPS, same-site frontend/backend domains, and proxy forwarding. The backend trusts one proxy hop.
- **Google does not return a refresh token:** revoke the application's previous Google access and link again; the flow requests offline consent.
- **Telegram link is unavailable:** set the token, username, notification flag, and polling flag, then restart the backend.
- **Duplicate or missing reminders:** confirm migration 001 was applied, database time is UTC-compatible, and `REMINDER_JOB_ENABLED=true`. Failed sends remain retryable; delivered dedupe keys are retained.
