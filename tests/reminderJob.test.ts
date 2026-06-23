import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { getReminderThreshold, runReminderCycle, startReminderJob } from "../src/jobs/reminderJob.js";
import { db } from "../src/config/database.js";
import { scheduleRepository, type ReminderRecord } from "../src/repositories/scheduleRepository.js";
import { notificationService } from "../src/services/telegram/notificationService.js";
import { env } from "../src/config/env.js";
import type { PoolClient } from "pg";

vi.mock("../src/config/database.js", () => ({
  db: {
    getClient: vi.fn(),
  },
}));

vi.mock("../src/repositories/scheduleRepository.js", () => ({
  scheduleRepository: {
    findDueReminders: vi.fn(),
    markReminderLevel: vi.fn(),
  },
}));

vi.mock("../src/services/telegram/notificationService.js", () => ({
  notificationService: {
    sendNotification: vi.fn(),
  },
}));

describe("deadline reminder thresholds", () => {
  it.each([[72, 1], [48, 2], [24, 3], [3, 4], [2, 5], [1, 6]] as const)("maps %s hours to level %s", (hours, level) => { expect(getReminderThreshold(hours)?.level).toBe(level); });
  it("ignores deadlines outside the three-day window", () => { expect(getReminderThreshold(73)).toBeNull(); });
});

describe("runReminderCycle", () => {
  let mockConnection: PoolClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockConnection = {
      query: vi.fn(),
      release: vi.fn(),
    } as unknown as PoolClient;
    vi.mocked(db.getClient).mockResolvedValue(mockConnection);
  });

  it("does nothing if lock cannot be acquired", async () => {
    vi.mocked(mockConnection.query).mockResolvedValueOnce({ rows: [{ acquired: false }] } as any);

    await runReminderCycle();

    expect(mockConnection.query).toHaveBeenCalledWith("SELECT pg_try_advisory_lock(84710271) AS acquired");
    expect(scheduleRepository.findDueReminders).not.toHaveBeenCalled();
    expect(mockConnection.release).toHaveBeenCalledOnce();
  });

  it("processes schedules and updates reminder level if notification is successful", async () => {
    vi.mocked(mockConnection.query).mockResolvedValueOnce({ rows: [{ acquired: true }] } as any);
    vi.mocked(mockConnection.query).mockResolvedValueOnce({ rows: [] } as any);

    const now = new Date("2026-06-23T12:00:00.000Z");
    const deadline = new Date("2026-06-23T14:30:00.000Z");

    const mockSchedule = {
      id: 10,
      judul: "Task A",
      deadline,
      reminder_level: 2,
      telegram_chat_id: "chat-id-123",
    } as unknown as ReminderRecord;

    vi.mocked(scheduleRepository.findDueReminders).mockResolvedValueOnce([mockSchedule]);
    vi.mocked(notificationService.sendNotification).mockResolvedValueOnce({ ok: true, status: "delivered", attempts: 1 });

    await runReminderCycle(now);

    expect(scheduleRepository.findDueReminders).toHaveBeenCalledWith(mockConnection);
    expect(notificationService.sendNotification).toHaveBeenCalledWith(expect.objectContaining({
      type: "deadline-reminder",
      chatId: "chat-id-123",
      title: "Task A",
      timeRemaining: "kurang dari 3 jam",
    }));
    expect(scheduleRepository.markReminderLevel).toHaveBeenCalledWith(mockConnection, 10, 4);
    expect(mockConnection.query).toHaveBeenCalledWith("SELECT pg_advisory_unlock(84710271)");
    expect(mockConnection.release).toHaveBeenCalledOnce();
  });

  it("does not update reminder level if notification send fails", async () => {
    vi.mocked(mockConnection.query).mockResolvedValueOnce({ rows: [{ acquired: true }] } as any);
    vi.mocked(mockConnection.query).mockResolvedValueOnce({ rows: [] } as any);

    const now = new Date("2026-06-23T12:00:00.000Z");
    const deadline = new Date("2026-06-23T14:30:00.000Z");

    const mockSchedule = {
      id: 10,
      judul: "Task A",
      deadline,
      reminder_level: 2,
      telegram_chat_id: "chat-id-123",
    } as unknown as ReminderRecord;

    vi.mocked(scheduleRepository.findDueReminders).mockResolvedValueOnce([mockSchedule]);
    vi.mocked(notificationService.sendNotification).mockResolvedValueOnce({ ok: false, status: "failed", attempts: 1 });

    await runReminderCycle(now);

    expect(scheduleRepository.markReminderLevel).not.toHaveBeenCalled();
  });

  it("handles lock release errors gracefully", async () => {
    vi.mocked(mockConnection.query).mockResolvedValueOnce({ rows: [{ acquired: true }] } as any);
    vi.mocked(mockConnection.query).mockRejectedValueOnce(new Error("Release failed"));

    vi.mocked(scheduleRepository.findDueReminders).mockResolvedValueOnce([]);

    await runReminderCycle();

    expect(mockConnection.release).toHaveBeenCalledOnce();
  });
});

describe("startReminderJob", () => {
  const originalReminderJob = env.REMINDER_JOB_ENABLED;

  afterEach(() => {
    env.REMINDER_JOB_ENABLED = originalReminderJob;
  });

  it("returns null if reminder job is disabled", () => {
    env.REMINDER_JOB_ENABLED = false;
    expect(startReminderJob()).toBeNull();
  });

  it("starts the cron job if enabled", () => {
    env.REMINDER_JOB_ENABLED = true;
    const task = startReminderJob();
    expect(task).toBeDefined();
    expect(task).not.toBeNull();
    if (task) {
      void task.stop();
    }
  });
});
