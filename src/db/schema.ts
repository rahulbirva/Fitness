export const CREATE_TABLES_SQL = `
  CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    age INTEGER NOT NULL DEFAULT 27,
    height_cm REAL NOT NULL DEFAULT 174,
    weight_kg REAL NOT NULL DEFAULT 74,
    sex TEXT NOT NULL DEFAULT 'male',
    goal TEXT NOT NULL DEFAULT 'fat_loss',
    wedding_date TEXT NOT NULL DEFAULT '',
    program_start_date TEXT NOT NULL DEFAULT '',
    ai_provider TEXT NOT NULL DEFAULT 'gemini',
    ai_model TEXT NOT NULL DEFAULT 'gemini-1.5-flash',
    reminder_time TEXT NOT NULL DEFAULT '17:30',
    water_reminder_enabled INTEGER NOT NULL DEFAULT 1,
    units TEXT NOT NULL DEFAULT 'metric',
    fast_food_eaten_this_week INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS workout_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    day_number INTEGER NOT NULL,
    completed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS set_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_log_id INTEGER NOT NULL,
    exercise_id TEXT NOT NULL,
    set_number INTEGER NOT NULL,
    reps_target TEXT NOT NULL,
    reps_done INTEGER,
    weight_kg REAL,
    completed_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(workout_log_id) REFERENCES workout_logs(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS meal_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    slot TEXT NOT NULL,
    meal_id TEXT NOT NULL,
    meal_name TEXT NOT NULL,
    calories INTEGER NOT NULL DEFAULT 0,
    protein_g REAL NOT NULL DEFAULT 0,
    completed INTEGER NOT NULL DEFAULT 0,
    UNIQUE(date, slot)
  );

  CREATE TABLE IF NOT EXISTS water_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    glasses INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS body_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    weight_kg REAL,
    waist_cm REAL,
    photo_path TEXT,
    steps INTEGER,
    sleep_hours REAL,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;
