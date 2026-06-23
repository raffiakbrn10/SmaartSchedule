import { env } from "../../config/env";
import { logger } from "../../config/logger";
import { errorMessage } from "../../utils/errors";
import type { DeliveryResult } from "./types";

interface TelegramResponse<T> { ok: boolean; result?: T; description?: string; error_code?: number; parameters?: { retry_after?: number } }
interface TelegramMessage { message_id: number }

export class TelegramClient {
  constructor(
    private readonly token = env.TELEGRAM_BOT_TOKEN,
    private readonly enabled = env.TELEGRAM_NOTIFICATIONS_ENABLED,
    private readonly request: typeof fetch = fetch,
  ) {}

  private async call<T>(method: string, body: Record<string, unknown>, signal?: AbortSignal): Promise<{ response: Response; payload: TelegramResponse<T> }> {
    const response = await this.request(`https://api.telegram.org/bot${this.token}/${method}`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), ...(signal ? { signal } : {}),
    });
    const payload = await response.json() as TelegramResponse<T>;
    return { response, payload };
  }

  async sendMessage(chatId: string, message: string): Promise<DeliveryResult> {
    if (!this.enabled) return { ok: false, status: "disabled", attempts: 0 };
    if (!chatId) return { ok: false, status: "skipped", attempts: 0, error: "No Telegram chat ID configured" };
    let lastError = "Telegram delivery failed";
    for (let attempt = 1; attempt <= env.TELEGRAM_MAX_RETRIES + 1; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), env.TELEGRAM_REQUEST_TIMEOUT_MS);
      try {
        const { response, payload } = await this.call<TelegramMessage>("sendMessage", { chat_id: chatId, text: message, parse_mode: "HTML", disable_web_page_preview: true }, controller.signal);
        if (response.ok && payload.ok && payload.result) {
          logger.info({ chatId, attempt, messageId: payload.result.message_id }, "Telegram message delivered");
          return { ok: true, status: "delivered", attempts: attempt, messageId: payload.result.message_id };
        }
        lastError = payload.description ?? `Telegram returned HTTP ${response.status}`;
        const temporary = response.status === 429 || response.status >= 500;
        if (!temporary || attempt > env.TELEGRAM_MAX_RETRIES) break;
        const waitMs = (payload.parameters?.retry_after ?? (0.25 * 2 ** (attempt - 1))) * 1000;
        await new Promise((resolve) => setTimeout(resolve, Math.min(waitMs, 5000)));
      } catch (error) {
        lastError = error instanceof DOMException && error.name === "AbortError" ? "Telegram request timed out" : errorMessage(error);
        if (attempt > env.TELEGRAM_MAX_RETRIES) break;
        await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** (attempt - 1)));
      } finally { clearTimeout(timeout); }
    }
    logger.warn({ chatId, error: lastError }, "Telegram message delivery failed");
    return { ok: false, status: "failed", attempts: env.TELEGRAM_MAX_RETRIES + 1, error: lastError };
  }

  async getUpdates(offset: number, signal: AbortSignal): Promise<Array<{ update_id: number; message?: { text?: string; chat: { id: number } } }>> {
    if (!this.token) return [];
    const { response, payload } = await this.call<Array<{ update_id: number; message?: { text?: string; chat: { id: number } } }>>("getUpdates", { offset, timeout: 20, allowed_updates: ["message"] }, signal);
    if (!response.ok || !payload.ok) throw new Error(payload.description ?? "Unable to poll Telegram updates");
    return payload.result ?? [];
  }

  async setWebhook(url: string, secretToken?: string): Promise<boolean> {
    if (!this.token) return false;
    const body: Record<string, unknown> = { url, allowed_updates: ["message"] };
    if (secretToken) {
      body.secret_token = secretToken;
    }
    const { response, payload } = await this.call<boolean>("setWebhook", body);
    if (!response.ok || !payload.ok) {
      logger.error({ description: payload.description }, "Failed to set Telegram webhook");
      return false;
    }
    return true;
  }

  async deleteWebhook(): Promise<boolean> {
    if (!this.token) return false;
    const { response, payload } = await this.call<boolean>("deleteWebhook", {});
    if (!response.ok || !payload.ok) {
      logger.error({ description: payload.description }, "Failed to delete Telegram webhook");
      return false;
    }
    return true;
  }
}

export const telegramClient = new TelegramClient();



