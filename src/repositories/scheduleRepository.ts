import type { PoolClient } from "pg";
import { db } from "../config/database.js";
import type { ScheduleInput } from "../schemas/schedule.js";

export interface ScheduleRecord {
  id: number;
  user_id: number;
  judul: string;
  prioritas: "Rendah" | "Medium" | "Tinggi";
  status: "Belum Selesai" | "Sedang Berjalan" | "Selesai";
  deadline: Date;
  reminder_level: number;
}

export interface ReminderRecord extends ScheduleRecord { telegram_chat_id: string }

export const scheduleRepository = {
  async findByUserId(userId: number): Promise<ScheduleRecord[]> {
    const [rows] = await db.execute<ScheduleRecord[]>("SELECT id, user_id, judul, prioritas, status, deadline, COALESCE(reminder_level, 0) reminder_level FROM schedules WHERE user_id = $1 ORDER BY deadline ASC", [userId]);
    return rows;
  },
  async create(userId: number, input: ScheduleInput): Promise<number> {
    const [rows] = await db.execute<{ id: number }[]>("INSERT INTO schedules (user_id, judul, prioritas, status, deadline) VALUES ($1, $2, $3, $4, $5) RETURNING id", [userId, input.judul, input.prioritas, input.status, new Date(input.deadline)]);
    const firstRow = rows[0];
    if (!firstRow) throw new Error("Gagal membuat jadwal.");
    return firstRow.id;
  },
  async update(id: number, userId: number, input: ScheduleInput): Promise<boolean> {
    const [rows] = await db.execute<{ id: number }[]>("UPDATE schedules SET judul = $1, prioritas = $2, status = $3, deadline = $4 WHERE id = $5 AND user_id = $6 RETURNING id", [input.judul, input.prioritas, input.status, new Date(input.deadline), id, userId]);
    return rows.length > 0;
  },
  async delete(id: number, userId: number): Promise<boolean> {
    const [rows] = await db.execute<{ id: number }[]>("DELETE FROM schedules WHERE id = $1 AND user_id = $2 RETURNING id", [id, userId]);
    return rows.length > 0;
  },
  async findDueReminders(connection: PoolClient): Promise<ReminderRecord[]> {
    const res = await connection.query<ReminderRecord>(`SELECT s.id, s.user_id, s.judul, s.prioritas, s.status, s.deadline, COALESCE(s.reminder_level, 0) reminder_level, u.telegram_chat_id
      FROM schedules s JOIN users u ON s.user_id = u.id
      WHERE s.status <> 'Selesai' AND u.telegram_chat_id IS NOT NULL AND s.deadline > NOW() AND s.deadline <= NOW() + INTERVAL '3 days'`);
    return res.rows;
  },
  async markReminderLevel(connection: PoolClient, id: number, level: number): Promise<void> {
    await connection.query("UPDATE schedules SET reminder_level = $1 WHERE id = $2 AND COALESCE(reminder_level, 0) < $3", [level, id, level]);
  },
};
