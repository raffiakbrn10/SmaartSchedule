import type { PoolClient } from "pg";
import cron, { type ScheduledTask } from "node-cron";
import { db } from "../config/database.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { scheduleRepository } from "../repositories/scheduleRepository.js";
import { notificationService } from "../services/telegram/notificationService.js";
import { errorMessage } from "../utils/errors.js";

export function getReminderThreshold(hours: number): { level: number; label: string } | null {
  if (hours <= 1) return { level: 6, label: "kurang dari 1 jam" };
  if (hours <= 2) return { level: 5, label: "kurang dari 2 jam" };
  if (hours <= 3) return { level: 4, label: "kurang dari 3 jam" };
  if (hours <= 24) return { level: 3, label: "kurang dari 1 hari" };
  if (hours <= 48) return { level: 2, label: "kurang dari 2 hari" };
  if (hours <= 72) return { level: 1, label: "kurang dari 3 hari" };
  return null;
}

export async function runReminderCycle(now = new Date()): Promise<void> {
  const connection = await db.getClient();
  try {
    const lockRes = await connection.query<{ acquired: boolean }>("SELECT pg_try_advisory_lock(84710271) AS acquired");
    if (lockRes.rows[0]?.acquired !== true) return;
    for (const schedule of await scheduleRepository.findDueReminders(connection)) {
      const target = getReminderThreshold((schedule.deadline.getTime() - now.getTime()) / 3_600_000);
      if (!target || target.level <= schedule.reminder_level) continue;
      const result = await notificationService.sendNotification({ type: "deadline-reminder", dedupeKey: `schedule-reminder:${schedule.id}:${target.level}`, chatId: schedule.telegram_chat_id, title: schedule.judul, deadline: schedule.deadline, timeRemaining: target.label });
      if (result.ok) await scheduleRepository.markReminderLevel(connection, schedule.id, target.level);
    }
  } finally {
    try { await connection.query("SELECT pg_advisory_unlock(84710271)"); } catch (error) { logger.warn({ error: errorMessage(error) }, "Reminder lock release failed"); }
    connection.release();
  }
}

export function startReminderJob(): ScheduledTask | null {
  if (!env.REMINDER_JOB_ENABLED) return null;
  const task = cron.schedule("* * * * *", () => { void runReminderCycle().catch((error: unknown) => logger.error({ error: errorMessage(error) }, "Reminder cycle failed")); });
  logger.info("Deadline reminder job started");
  return task;
}
