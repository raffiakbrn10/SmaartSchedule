export type DeliveryStatus = "delivered" | "disabled" | "skipped" | "duplicate" | "failed";

export interface DeliveryResult {
  ok: boolean;
  status: DeliveryStatus;
  attempts: number;
  messageId?: number;
  error?: string;
}

export type NotificationPayload =
  | { type: "schedule-created"; dedupeKey: string; chatId?: string; title: string; deadline: Date }
  | { type: "deadline-reminder"; dedupeKey: string; chatId?: string; title: string; deadline: Date; timeRemaining: string }
  | { type: "test"; dedupeKey: string; chatId?: string; requestedBy: string };
