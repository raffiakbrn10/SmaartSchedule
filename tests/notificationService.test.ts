import { describe, expect, it, vi } from "vitest";
import { NotificationService } from "../src/services/telegram/notificationService.js";
import type { NotificationDeliveryRepository } from "../src/repositories/notificationRepository.js";
import type { TelegramClient } from "../src/services/telegram/telegramClient.js";

function repository(claimed = true): NotificationDeliveryRepository {
  return { claim: vi.fn().mockResolvedValue(claimed), delivered: vi.fn().mockResolvedValue(undefined), failed: vi.fn().mockResolvedValue(undefined) };
}

describe("NotificationService", () => {
  it("persists success and suppresses duplicate events", async () => {
    const client = { sendMessage: vi.fn().mockResolvedValue({ ok: true, status: "delivered", attempts: 1, messageId: 1 }) } as unknown as TelegramClient;
    const deliveries = repository();
    const service = new NotificationService(client, deliveries, true, "default");
    const payload = { type: "schedule-created" as const, dedupeKey: "schedule-created:1", title: "Ujian", deadline: new Date("2026-06-24T10:00:00Z") };
    expect((await service.sendNotification(payload)).ok).toBe(true);
    expect(deliveries.delivered).toHaveBeenCalledWith(payload.dedupeKey);
    const duplicate = new NotificationService(client, repository(false), true, "default");
    expect(await duplicate.sendNotification(payload)).toEqual({ ok: true, status: "duplicate", attempts: 0 });
  });
  it("records delivery failure without throwing", async () => {
    const client = { sendMessage: vi.fn().mockRejectedValue(new Error("network")) } as unknown as TelegramClient;
    const deliveries = repository();
    const result = await new NotificationService(client, deliveries, true, "default").sendTestNotification("admin");
    expect(result).toMatchObject({ ok: false, status: "failed", error: "network" });
    expect(deliveries.failed).toHaveBeenCalled();
  });
});
