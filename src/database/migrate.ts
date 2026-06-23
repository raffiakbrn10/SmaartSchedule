import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { pool } from "../config/database.js";
import { logger } from "../config/logger.js";

const migrationUrl = new URL("../../migrations/001_notification_delivery.sql", import.meta.url);
const sql = await readFile(fileURLToPath(migrationUrl), "utf8");
await pool.query(sql);
logger.info("Database migration 001_notification_delivery applied");
await pool.end();
