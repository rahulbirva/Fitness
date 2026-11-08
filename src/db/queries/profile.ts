import { getDatabase } from '../index';

export interface Profile {
  id: number;
  name: string;
  age: number;
  height_cm: number;
  weight_kg: number;
  sex: 'male' | 'female';
  goal: 'fat_loss' | 'maintain' | 'muscle_gain';
  wedding_date: string;
  program_start_date: string;
  ai_provider: 'gemini' | 'claude' | 'grok';
  ai_model: string;
  reminder_time: string;
  water_reminder_enabled: number;
  units: 'metric' | 'imperial';
  fast_food_eaten_this_week: number;
  updated_at: string;
}

export async function getProfile(): Promise<Profile | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<Profile>('SELECT * FROM profiles WHERE id = 1');
  return row ?? null;
}

export async function updateProfile(updates: Partial<Omit<Profile, 'id' | 'updated_at'>>): Promise<void> {
  const db = await getDatabase();
  const fields = Object.keys(updates);
  if (fields.length === 0) return;

  const setClauses = fields.map((f) => `${f} = ?`).join(', ');
  const values: (string | number | null)[] = fields.map((f) => {
    const val = (updates as Record<string, unknown>)[f];
    if (typeof val === 'string' || typeof val === 'number') return val;
    if (val === null || val === undefined) return null;
    return String(val);
  });
  values.push(new Date().toISOString());

  await db.runAsync(
    `UPDATE profiles SET ${setClauses}, updated_at = ? WHERE id = 1`,
    values
  );
}

export async function toggleFastFoodEaten(eaten: boolean): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE profiles SET fast_food_eaten_this_week = ?, updated_at = datetime('now') WHERE id = 1`,
    [eaten ? 1 : 0]
  );
}
