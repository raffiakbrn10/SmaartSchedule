import { db } from "../config/database.js";

export interface NotificationDeliveryRepository {
  claim(dedupeKey: string, eventType: string, chatId: string): Promise<boolean>;
  delivered(dedupeKey: string): Promise<void>;
  failed(dedupeKey: string, reason: string): Promise<void>;
}

export const notificationRepository: NotificationDeliveryRepository = {
  async claim(dedupeKey, eventType, chatId) {
    const [rows] = await db.execute<{ dedupe_key: string }[]>(
      `INSERT INTO notification_deliveries (dedupe_key, event_type, chat_id, status, attempts)
       VALUES ($1, $2, $3, 'processing', 1)
       ON CONFLICT (dedupe_key) DO UPDATE
       SET status = 'processing',
           attempts = notification_deliveries.attempts + 1,
           updated_at = CURRENT_TIMESTAMP
       WHERE notification_deliveries.status = 'failed'
       RETURNING dedupe_key`,
      [dedupeKey, eventType, chatId]
    );
    return rows.length > 0;
  },
  async delivered(dedupeKey) {
    await db.execute("UPDATE notification_deliveries SET status = 'delivered', error_message = NULL WHERE dedupe_key = $1", [dedupeKey]);
  },
  async failed(dedupeKey, reason) {
    await db.execute("UPDATE notification_deliveries SET status = 'failed', error_message = $1 WHERE dedupe_key = $2", [reason.slice(0, 500), dedupeKey]);
  },
};
