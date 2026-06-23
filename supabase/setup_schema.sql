-- =========================================================================================
-- SmaartSchedule - Initial Database Schema
-- =========================================================================================
-- Copy and paste this script into the Supabase SQL Editor to set up your project tables.
-- Our backend automatically syncs Supabase Auth users to the `users` table via API routes.
-- =========================================================================================

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(191) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  google_refresh_token TEXT NULL,
  telegram_chat_id VARCHAR(64) NULL
);

CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  judul VARCHAR(255) NOT NULL,
  prioritas VARCHAR(32) NOT NULL DEFAULT 'Rendah',
  status VARCHAR(32) NOT NULL DEFAULT 'Belum Selesai',
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  reminder_level INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS notification_deliveries (
  id SERIAL PRIMARY KEY,
  dedupe_key VARCHAR(191) NOT NULL UNIQUE,
  event_type VARCHAR(64) NOT NULL,
  chat_id VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'processing',
  attempts INT NOT NULL DEFAULT 1,
  error_message VARCHAR(500) NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notification_deliveries_status_updated ON notification_deliveries (status, updated_at);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Abaikan error log ini jika trigger sudah pernah dibuat sebelumnya
DROP TRIGGER IF EXISTS update_notification_deliveries_updated_at ON notification_deliveries;

CREATE TRIGGER update_notification_deliveries_updated_at
    BEFORE UPDATE ON notification_deliveries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
