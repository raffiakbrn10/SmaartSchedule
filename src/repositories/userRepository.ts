import { db } from "../config/database.js";

export interface UserRecord {
  id: number;
  username: string;
  password: string;
  google_refresh_token: string | null;
  telegram_chat_id: string | null;
}

export const userRepository = {
  async findByUsername(username: string): Promise<UserRecord | null> {
    const [rows] = await db.execute<UserRecord[]>("SELECT id, username, password, google_refresh_token, telegram_chat_id FROM users WHERE username = $1 LIMIT 1", [username]);
    return rows[0] ?? null;
  },
  async findById(id: number): Promise<UserRecord | null> {
    const [rows] = await db.execute<UserRecord[]>("SELECT id, username, password, google_refresh_token, telegram_chat_id FROM users WHERE id = $1 LIMIT 1", [id]);
    return rows[0] ?? null;
  },
  async create(username: string, password: string): Promise<number> {
    const [rows] = await db.execute<{ id: number }[]>("INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id", [username, password]);
    const firstRow = rows[0];
    if (!firstRow) throw new Error("Gagal membuat pengguna.");
    return firstRow.id;
  },
  async updateTelegramChatId(id: number, chatId: string): Promise<boolean> {
    const [rows] = await db.execute<{ id: number }[]>("UPDATE users SET telegram_chat_id = $1 WHERE id = $2 RETURNING id", [chatId, id]);
    return rows.length > 0;
  },
  async updateGoogleRefreshToken(id: number, refreshToken: string): Promise<boolean> {
    const [rows] = await db.execute<{ id: number }[]>("UPDATE users SET google_refresh_token = $1 WHERE id = $2 RETURNING id", [refreshToken, id]);
    return rows.length > 0;
  },
};
