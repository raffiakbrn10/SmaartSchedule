import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { pool } from "../config/database";
import { logger } from "../config/logger";

const migrationUrl1 = new URL("../../migrations/001_notification_delivery.sql", import.meta.url);
const sql1 = await readFile(fileURLToPath(migrationUrl1), "utf8");
await pool.query(sql1);
logger.info("Database migration 001_notification_delivery applied");

const migrationUrl2 = new URL("../../migrations/002_add_display_name.sql", import.meta.url);
const sql2 = await readFile(fileURLToPath(migrationUrl2), "utf8");
await pool.query(sql2);
logger.info("Database migration 002_add_display_name applied");

await pool.end();



