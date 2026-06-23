import { describe, expect, it, vi, beforeEach } from "vitest";
import { db } from "../src/config/database.js";
import { scheduleRepository, type ScheduleRecord, type ReminderRecord } from "../src/repositories/scheduleRepository.js";
import type { PoolClient } from "pg";

vi.mock("../src/config/database.js", () => ({
  db: {
    execute: vi.fn(),
  },
}));

describe("scheduleRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockInput = { judul: "Test Task", prioritas: "Tinggi" as const, status: "Belum Selesai" as const, deadline: "2026-06-25T10:00:00.000Z" };

  it("findByUserId returns schedules array", async () => {
    const mockSchedules: ScheduleRecord[] = [{ id: 1, user_id: 2, judul: "Title", prioritas: "Tinggi", status: "Belum Selesai", deadline: new Date(), reminder_level: 0 } as ScheduleRecord];
    vi.mocked(db.execute).mockResolvedValueOnce([mockSchedules, []]);

    const result = await scheduleRepository.findByUserId(2);
    expect(result).toEqual(mockSchedules);
    expect(db.execute).toHaveBeenCalledWith(expect.stringContaining("SELECT"), [2]);
  });

  it("create inserts schedule and returns insertId", async () => {
    vi.mocked(db.execute).mockResolvedValueOnce([[{ id: 55 }], []]);

    const insertId = await scheduleRepository.create(2, mockInput);
    expect(insertId).toBe(55);
    expect(db.execute).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO schedules"), [2, mockInput.judul, mockInput.prioritas, mockInput.status, expect.any(Date)]);
  });

  it("update updates schedule and returns success boolean", async () => {
    vi.mocked(db.execute).mockResolvedValueOnce([[{ id: 1 }], []]);

    const success = await scheduleRepository.update(1, 2, mockInput);
    expect(success).toBe(true);
    expect(db.execute).toHaveBeenCalledWith(expect.stringContaining("UPDATE schedules SET"), [mockInput.judul, mockInput.prioritas, mockInput.status, expect.any(Date), 1, 2]);

    vi.mocked(db.execute).mockResolvedValueOnce([[], []]);
    const fail = await scheduleRepository.update(1, 2, mockInput);
    expect(fail).toBe(false);
  });

  it("delete removes schedule and returns success boolean", async () => {
    vi.mocked(db.execute).mockResolvedValueOnce([[{ id: 1 }], []]);

    const success = await scheduleRepository.delete(1, 2);
    expect(success).toBe(true);
    expect(db.execute).toHaveBeenCalledWith(expect.stringContaining("DELETE FROM schedules"), [1, 2]);

    vi.mocked(db.execute).mockResolvedValueOnce([[], []]);
    const fail = await scheduleRepository.delete(1, 2);
    expect(fail).toBe(false);
  });

  it("findDueReminders queries connection and returns reminder records", async () => {
    const mockReminder = [{ id: 1, judul: "Task", telegram_chat_id: "123" } as unknown as ReminderRecord];
    const mockConnection = {
      query: vi.fn().mockResolvedValueOnce({ rows: mockReminder }),
    } as unknown as PoolClient;

    const result = await scheduleRepository.findDueReminders(mockConnection);
    expect(result).toEqual(mockReminder);
  });

  it("markReminderLevel executes connection and updates reminder level", async () => {
    const mockConnection = {
      query: vi.fn().mockResolvedValueOnce({}),
    } as unknown as PoolClient;

    await scheduleRepository.markReminderLevel(mockConnection, 1, 3);
    expect(mockConnection.query).toHaveBeenCalledWith(expect.stringContaining("UPDATE schedules SET reminder_level"), [3, 1, 3]);
  });
});
