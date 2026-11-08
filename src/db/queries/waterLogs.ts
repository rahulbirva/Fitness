import { getDatabase } from '../index';

export async function getWaterForDate(date: string): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ glasses: number }>(
    'SELECT glasses FROM water_logs WHERE date = ?',
    [date]
  );
  return row?.glasses ?? 0;
}

export async function setWaterForDate(date: string, glasses: number): Promise<void> {
  const db = await getDatabase();
  const count = Math.max(0, glasses);
  await db.runAsync(
    `INSERT INTO water_logs (date, glasses) VALUES (?, ?)
     ON CONFLICT(date) DO UPDATE SET glasses = excluded.glasses`,
    [date, count]
  );
}
