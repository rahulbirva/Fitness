import { getDatabase } from '../index';

export interface BodyMetric {
  id: number;
  date: string;
  weight_kg: number | null;
  waist_cm: number | null;
  photo_path: string | null;
  steps: number | null;
  sleep_hours: number | null;
  notes: string | null;
}

export async function upsertBodyMetrics(
  date: string,
  updates: Partial<Omit<BodyMetric, 'id' | 'date'>>
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO body_metrics (date, weight_kg, waist_cm, photo_path, steps, sleep_hours, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET
       weight_kg = COALESCE(excluded.weight_kg, weight_kg),
       waist_cm = COALESCE(excluded.waist_cm, waist_cm),
       photo_path = COALESCE(excluded.photo_path, photo_path),
       steps = COALESCE(excluded.steps, steps),
       sleep_hours = COALESCE(excluded.sleep_hours, sleep_hours),
       notes = COALESCE(excluded.notes, notes)`,
    [
      date,
      updates.weight_kg ?? null,
      updates.waist_cm ?? null,
      updates.photo_path ?? null,
      updates.steps ?? null,
      updates.sleep_hours ?? null,
      updates.notes ?? null,
    ]
  );
}

export async function getBodyMetrics(limit = 30): Promise<BodyMetric[]> {
  const db = await getDatabase();
  return db.getAllAsync<BodyMetric>(
    'SELECT * FROM body_metrics ORDER BY date DESC LIMIT ?',
    [limit]
  );
}

export async function getMetricForDate(date: string): Promise<BodyMetric | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<BodyMetric>(
    'SELECT * FROM body_metrics WHERE date = ?',
    [date]
  );
  return row ?? null;
}
