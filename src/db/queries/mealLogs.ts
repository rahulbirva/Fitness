import { getDatabase } from '../index';

export interface MealLog {
  id: number;
  date: string;
  slot: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  meal_id: string;
  meal_name: string;
  calories: number;
  protein_g: number;
  completed: number;
}

export async function getMealLogsForDate(date: string): Promise<MealLog[]> {
  const db = await getDatabase();
  return db.getAllAsync<MealLog>(
    'SELECT * FROM meal_logs WHERE date = ? ORDER BY slot ASC',
    [date]
  );
}

export async function upsertMealLog(
  date: string,
  slot: 'breakfast' | 'lunch' | 'snack' | 'dinner',
  mealId: string,
  mealName: string,
  calories: number,
  proteinG: number,
  completed: boolean
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO meal_logs (date, slot, meal_id, meal_name, calories, protein_g, completed)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(date, slot) DO UPDATE SET
       meal_id = excluded.meal_id,
       meal_name = excluded.meal_name,
       calories = excluded.calories,
       protein_g = excluded.protein_g,
       completed = excluded.completed`,
    [date, slot, mealId, mealName, calories, proteinG, completed ? 1 : 0]
  );
}

export async function toggleMealCompleted(date: string, slot: string, completed: boolean): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE meal_logs SET completed = ? WHERE date = ? AND slot = ?',
    [completed ? 1 : 0, date, slot]
  );
}
