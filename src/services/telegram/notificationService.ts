import { env } from "../../config/env";
import { notificationRepository, type NotificationDeliveryRepository } from "../../repositories/notificationRepository";
import { errorMessage } from "../../utils/errors";
import { telegramClient, type TelegramClient } from "./telegramClient";
import { telegramTemplates } from "./templates";
import type { DeliveryResult, NotificationPayload } from "./types";

export class NotificationService {
  constructor(
    private readonly client: TelegramClient = telegramClient,
    private readonly deliveries: NotificationDeliveryRepository = notificationRepository,
    private readonly enabled = env.TELEGRAM_NOTIFICATIONS_ENABLED,
    private readonly defaultChatId = env.TELEGRAM_DEFAULT_CHAT_ID,
  ) {}

  async sendMessage(chatId: string, message: string): Promise<DeliveryResult> { return this.client.sendMessage(chatId, message); }

  async sendNotification(payload: NotificationPayload): Promise<DeliveryResult> {
    const chatId = payload.chatId ?? this.defaultChatId;
    if (!this.enabled) return { ok: false, status: "disabled", attempts: 0 };
    if (!chatId) return { ok: false, status: "skipped", attempts: 0, error: "No Telegram chat ID configured" };
    const claimed = await this.deliveries.claim(payload.dedupeKey, payload.type, chatId);
    if (!claimed) return { ok: true, status: "duplicate", attempts: 0 };
    const message = payload.type === "schedule-created"
      ? telegramTemplates.scheduleCreated(payload.title, payload.deadline)
      : payload.type === "deadline-reminder"
        ? telegramTemplates.deadlineReminder(payload.title, payload.deadline, payload.timeRemaining)
        : telegramTemplates.test(payload.requestedBy);
    try {
      const result = await this.client.sendMessage(chatId, message);
      if (result.ok) await this.deliveries.delivered(payload.dedupeKey);
      else await this.deliveries.failed(payload.dedupeKey, result.error ?? result.status);
      return result;
    } catch (error) {
      const reason = errorMessage(error);
      await this.deliveries.failed(payload.dedupeKey, reason);
      return { ok: false, status: "failed", attempts: 0, error: reason };
    }
  }

  async sendTestNotification(requestedBy: string, chatId?: string): Promise<DeliveryResult> {
    return this.sendNotification({ type: "test", dedupeKey: `test:${requestedBy}:${Date.now()}`, requestedBy, ...(chatId ? { chatId } : {}) });
  }
}

export const notificationService = new NotificationService();



