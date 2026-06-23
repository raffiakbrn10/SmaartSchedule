import request from "supertest";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { createApp } from "../src/app.js";
import { authService } from "../src/services/authService.js";
import { scheduleRepository, type ScheduleRecord } from "../src/repositories/scheduleRepository.js";
import { userRepository, type UserRecord } from "../src/repositories/userRepository.js";
import { googleCalendarService } from "../src/services/googleCalendarService.js";
import { notificationService } from "../src/services/telegram/notificationService.js";

vi.mock("../src/services/authService.js", () => ({
  authService: {
    verifySession: vi.fn(),
  },
}));

vi.mock("../src/repositories/scheduleRepository.js", () => ({
  scheduleRepository: {
    findByUserId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../src/repositories/userRepository.js", () => ({
  userRepository: {
    findById: vi.fn(),
  },
}));

vi.mock("../src/services/googleCalendarService.js", () => ({
  googleCalendarService: {
    createEvent: vi.fn(),
  },
}));

vi.mock("../src/services/telegram/notificationService.js", () => ({
  notificationService: {
    sendNotification: vi.fn(),
  },
}));

describe("scheduleController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.verifySession).mockReturnValue({ id: 7, username: "user" });
  });

  const app = createApp();

  describe("GET /schedules", () => {
    it("lists all schedules for user", async () => {
      const mockSchedules: ScheduleRecord[] = [{ id: 1, user_id: 7, judul: "Task", prioritas: "Tinggi" as const, status: "Belum Selesai" as const, deadline: new Date(), reminder_level: 0 } as ScheduleRecord];
      vi.mocked(scheduleRepository.findByUserId).mockResolvedValueOnce(mockSchedules);

      const response = await request(app)
        .get("/schedules")
        .set("Authorization", "Bearer token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Jadwal berhasil dimuat.",
        data: {
          schedules: [
            {
              ...mockSchedules[0],
              deadline: mockSchedules[0]!.deadline.toISOString(),
            },
          ],
        },
      });
      expect(scheduleRepository.findByUserId).toHaveBeenCalledWith(7);
    });
  });

  describe("POST /schedules", () => {
    const input = { judul: "Task A", prioritas: "Tinggi" as const, status: "Belum Selesai" as const, deadline: "2026-06-25T10:00:00.000Z" };

    it("creates schedule, attempts telegram and google integrations, and returns 201", async () => {
      vi.mocked(scheduleRepository.create).mockResolvedValueOnce(99);
      vi.mocked(userRepository.findById).mockResolvedValueOnce({
        id: 7,
        username: "user",
        telegram_chat_id: "chat-id",
        google_refresh_token: "google-token",
      } as unknown as UserRecord);
      vi.mocked(notificationService.sendNotification).mockResolvedValueOnce({ ok: true, status: "delivered", attempts: 1 });
      vi.mocked(googleCalendarService.createEvent).mockResolvedValueOnce("event-id");

      const response = await request(app)
        .post("/schedules")
        .set("Authorization", "Bearer token")
        .send(input);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        message: "Jadwal berhasil ditambahkan.",
        data: { id: 99 },
      });
      expect(scheduleRepository.create).toHaveBeenCalledWith(7, input);
      expect(notificationService.sendNotification).toHaveBeenCalledWith(expect.objectContaining({
        chatId: "chat-id",
        title: "Task A",
      }));
      expect(googleCalendarService.createEvent).toHaveBeenCalledWith("google-token", expect.objectContaining({
        title: "Task A",
      }));
    });

    it("creates schedule when integrations are missing or throw errors without failing the request", async () => {
      vi.mocked(scheduleRepository.create).mockResolvedValueOnce(99);
      vi.mocked(userRepository.findById).mockResolvedValueOnce({
        id: 7,
        username: "user",
        telegram_chat_id: null,
        google_refresh_token: null,
      } as unknown as UserRecord);

      const response = await request(app)
        .post("/schedules")
        .set("Authorization", "Bearer token")
        .send(input);

      expect(response.status).toBe(201);
      expect(notificationService.sendNotification).not.toHaveBeenCalled();
      expect(googleCalendarService.createEvent).not.toHaveBeenCalled();
    });
  });

  describe("PUT /schedules/:id", () => {
    const input = { judul: "Task Updated", prioritas: "Medium" as const, status: "Sedang Berjalan" as const, deadline: "2026-06-26T10:00:00.000Z" };

    it("updates schedule successfully and returns 200", async () => {
      vi.mocked(scheduleRepository.update).mockResolvedValueOnce(true);

      const response = await request(app)
        .put("/schedules/123")
        .set("Authorization", "Bearer token")
        .send(input);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Jadwal berhasil diperbarui.",
      });
      expect(scheduleRepository.update).toHaveBeenCalledWith(123, 7, input);
    });

    it("returns 404 AppError if schedule is not found", async () => {
      vi.mocked(scheduleRepository.update).mockResolvedValueOnce(false);

      const response = await request(app)
        .put("/schedules/123")
        .set("Authorization", "Bearer token")
        .send(input);

      expect(response.status).toBe(404);
      const body = response.body as Record<string, unknown>;
      expect(body.message).toBe("Jadwal tidak ditemukan.");
    });

    it("returns 422 if schedule id is invalid", async () => {
      const response = await request(app)
        .put("/schedules/invalid-id")
        .set("Authorization", "Bearer token")
        .send(input);

      expect(response.status).toBe(422);
    });
  });

  describe("DELETE /schedules/:id", () => {
    it("deletes schedule successfully and returns 200", async () => {
      vi.mocked(scheduleRepository.delete).mockResolvedValueOnce(true);

      const response = await request(app)
        .delete("/schedules/123")
        .set("Authorization", "Bearer token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Jadwal berhasil dihapus.",
      });
      expect(scheduleRepository.delete).toHaveBeenCalledWith(123, 7);
    });

    it("returns 404 AppError if schedule is not found", async () => {
      vi.mocked(scheduleRepository.delete).mockResolvedValueOnce(false);

      const response = await request(app)
        .delete("/schedules/123")
        .set("Authorization", "Bearer token");

      expect(response.status).toBe(404);
      const body = response.body as Record<string, unknown>;
      expect(body.message).toBe("Jadwal tidak ditemukan.");
    });
  });
});
