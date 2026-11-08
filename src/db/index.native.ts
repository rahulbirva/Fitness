import * as SQLite from 'expo-sqlite';
import { AppDatabase } from './types';
import { CREATE_TABLES_SQL } from './schema';
import { todayDateString } from '../utils/date';
import { getWebDatabase, resetWebDatabase } from './webDriver';

export * from './types';

let dbInstance: AppDatabase | null = null;

export async function getDatabase(): Promise<AppDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    const openWithTimeout = Promise.race([
      SQLite.openDatabaseAsync('weddingfit.db'),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('SQLite open timeout')), 3000)
      ),
    ]);

    const db = await openWithTimeout;
    await db.execAsync(CREATE_TABLES_SQL);

    // Check if profile exists
    const existingProfile = await db.getFirstAsync<{ id: number }>('SELECT id FROM profiles WHERE id = 1');
    if (!existingProfile) {
      const today = todayDateString();
      const wedding = new Date();
      wedding.setDate(wedding.getDate() + 30);
      const yyyy = wedding.getFullYear();
      const mm = String(wedding.getMonth() + 1).padStart(2, '0');
      const dd = String(wedding.getDate()).padStart(2, '0');
      const weddingDate = `${yyyy}-${mm}-${dd}`;

      await db.runAsync(
        `INSERT INTO profiles (
          id, name, age, height_cm, weight_kg, sex, goal,
          wedding_date, program_start_date, ai_provider, ai_model,
          reminder_time, water_reminder_enabled, units
        ) VALUES (1, 'Groom/Bride', 27, 174, 74, 'male', 'fat_loss', ?, ?, 'gemini', 'gemini-1.5-flash', '17:30', 1, 'metric')`,
        [weddingDate, today]
      );

      await db.runAsync(
        `INSERT OR IGNORE INTO body_metrics (date, weight_kg, waist_cm, steps, sleep_hours)
         VALUES (?, 74.0, 86.0, 4200, 7.5)`,
        [today]
      );

      await db.runAsync(
        `INSERT INTO chat_messages (session_id, role, content)
         VALUES ('main', 'assistant', 'Namaste! I am your 30-day wedding fitness & Indian diet coach. Day 1 starts today with your Upper Body session. Keep your water bottle handy and aim for 3.5 L. How are you feeling today?')`
      );

      await db.runAsync(
        `INSERT OR IGNORE INTO meal_logs (date, slot, meal_id, meal_name, calories, protein_g, completed)
         VALUES 
         (?, 'breakfast', 'b_eggs', '3 Boiled Eggs & Whole Wheat Toast', 270, 21, 0),
         (?, 'lunch', 'l_dal_roti_sabzi', 'Yellow Tadka Dal, 2 Phulkas & Green Sabzi', 460, 20, 0),
         (?, 'snack', 's_curd', 'Fresh Curd (Dahi) with Roasted Jeera', 130, 11, 0),
         (?, 'dinner', 'd_paneer_sabzi_roti', 'Paneer Shimla Mirch with Exactly 1 Phulka Roti', 360, 21, 0)`,
        [today, today, today, today]
      );
    }

    dbInstance = db as unknown as AppDatabase;
    return dbInstance;
  } catch (err) {
    console.warn('Native SQLite fallback to Web database:', err);
    dbInstance = getWebDatabase() as unknown as AppDatabase;
    return dbInstance;
  }
}

export async function resetDatabase(): Promise<void> {
  if (dbInstance) {
    try {
      await dbInstance.closeAsync();
    } catch {
      // ignore
    }
    dbInstance = null;
  }
  try {
    await SQLite.deleteDatabaseAsync('weddingfit.db');
  } catch {
    resetWebDatabase();
  }
}
