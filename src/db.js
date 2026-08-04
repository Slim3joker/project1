const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'garmin-health.db'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS raw_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  received_at TEXT NOT NULL DEFAULT (datetime('now')),
  summary_type TEXT NOT NULL,
  payload TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS dailies (
  calendar_date TEXT PRIMARY KEY,
  steps INTEGER,
  distance_m REAL,
  active_kcal INTEGER,
  resting_hr INTEGER,
  avg_stress INTEGER,
  max_stress INTEGER,
  body_battery_charged INTEGER,
  body_battery_drained INTEGER,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sleep (
  calendar_date TEXT PRIMARY KEY,
  start_time_s INTEGER,
  duration_sec INTEGER,
  deep_sec INTEGER,
  light_sec INTEGER,
  rem_sec INTEGER,
  awake_sec INTEGER,
  sleep_score INTEGER,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS hrv (
  calendar_date TEXT PRIMARY KEY,
  last_night_avg REAL,
  last_night_high REAL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS body_battery (
  ts_s INTEGER PRIMARY KEY,
  calendar_date TEXT NOT NULL,
  value INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_bb_date ON body_battery(calendar_date);

CREATE TABLE IF NOT EXISTS stress_series (
  ts_s INTEGER PRIMARY KEY,
  calendar_date TEXT NOT NULL,
  value INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_stress_date ON stress_series(calendar_date);

CREATE TABLE IF NOT EXISTS user_metrics (
  calendar_date TEXT PRIMARY KEY,
  vo2max REAL,
  fitness_age REAL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS oauth_tokens (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  access_token TEXT,
  refresh_token TEXT,
  expires_at_s INTEGER,
  garmin_user_id TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS oauth_state (
  state TEXT PRIMARY KEY,
  code_verifier TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

module.exports = db;
