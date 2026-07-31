/*
# Create notification settings table

1. New Tables
- `notification_settings`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to authenticated user, references auth.users, cascade delete)
  - `remind_enabled` (boolean, default true) — master toggle for the daily "haven't logged" reminder
  - `remind_hour` (int, default 22) — hour of day (0-23) to fire the reminder
  - `remind_minute` (int, default 0) — minute (0-59) to fire the reminder
  - `daily_limit_enabled` (boolean, default false) — master toggle for daily spending limit alert
  - `daily_limit_amount` (bigint, default 500000) — spending threshold in IDR; 0 disables
  - `daily_limit_notify` (boolean, default true) — whether to push a notification when limit exceeded
  - `last_reminded_date` (date, nullable) — last date a reminder was sent (prevents duplicate reminders same day)
  - `last_limit_alert_date` (date, nullable) — last date a limit-exceeded alert was sent
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `notification_settings`.
- Owner-scoped CRUD: each authenticated user can only access their own settings row.

3. Notes
- One row per user. The app upserts on first access so a row always exists when settings are opened.
- `remind_hour` / `remind_minute` together define the exact time (e.g. 22:00) the reminder fires.
- The frontend uses a local timer + the Notification API (browser push) to check at the set time whether the user has logged any transaction that day. If not, a browser notification is shown. This avoids needing a server-side scheduler while still working when the app tab is open.
- The daily spending limit is checked locally: the app sums today's `out` transactions and compares against `daily_limit_amount`. If exceeded and `daily_limit_notify` is on, a browser notification fires (once per day, tracked by `last_limit_alert_date`).
*/
CREATE TABLE IF NOT EXISTS notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  remind_enabled boolean NOT NULL DEFAULT true,
  remind_hour int NOT NULL DEFAULT 22 CHECK (remind_hour >= 0 AND remind_hour <= 23),
  remind_minute int NOT NULL DEFAULT 0 CHECK (remind_minute >= 0 AND remind_minute <= 59),
  daily_limit_enabled boolean NOT NULL DEFAULT false,
  daily_limit_amount bigint NOT NULL DEFAULT 500000 CHECK (daily_limit_amount >= 0),
  daily_limit_notify boolean NOT NULL DEFAULT true,
  last_reminded_date date,
  last_limit_alert_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notif_settings" ON notification_settings;
CREATE POLICY "select_own_notif_settings"
  ON notification_settings FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notif_settings" ON notification_settings;
CREATE POLICY "insert_own_notif_settings"
  ON notification_settings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notif_settings" ON notification_settings;
CREATE POLICY "update_own_notif_settings"
  ON notification_settings FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notif_settings" ON notification_settings;
CREATE POLICY "delete_own_notif_settings"
  ON notification_settings FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
