import { getDatabase } from '../index';

export interface WorkoutLog {
  id: number;
  date: string;
  day_number: number;
  completed_at: string | null;
}

export interface SetLog {
  id: number;
  workout_log_id: number;
  exercise_id: string;
  set_number: number;
  reps_target: string;
  reps_done: number | null;
  weight_kg: number | null;
  completed_at: string;
}

export async function getOrCreateWorkoutLog(date: string, dayNumber: number): Promise<WorkoutLog> {
  const db = await getDatabase();
  let log = await db.getFirstAsync<WorkoutLog>(
    'SELECT * FROM workout_logs WHERE date = ?',
    [date]
  );

  if (!log) {
    await db.runAsync(
      'INSERT INTO workout_logs (date, day_number) VALUES (?, ?)',
      [date, dayNumber]
    );
    log = await db.getFirstAsync<WorkoutLog>(
      'SELECT * FROM workout_logs WHERE date = ?',
      [date]
    );
  }

  return log!;
}

export async function getSetLogsForWorkout(workoutLogId: number): Promise<SetLog[]> {
  const db = await getDatabase();
  return db.getAllAsync<SetLog>(
    'SELECT * FROM set_logs WHERE workout_log_id = ? ORDER BY exercise_id, set_number',
    [workoutLogId]
  );
}

export async function logSet(
  workoutLogId: number,
  exerciseId: string,
  setNumber: number,
  repsTarget: string,
  repsDone?: number,
  weightKg?: number
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO set_logs (workout_log_id, exercise_id, set_number, reps_target, reps_done, weight_kg, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
    [workoutLogId, exerciseId, setNumber, repsTarget, repsDone ?? null, weightKg ?? null]
  );
}

export async function removeSetLog(
  workoutLogId: number,
  exerciseId: string,
  setNumber: number
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'DELETE FROM set_logs WHERE workout_log_id = ? AND exercise_id = ? AND set_number = ?',
    [workoutLogId, exerciseId, setNumber]
  );
}

export async function markWorkoutCompleted(workoutLogId: number, completed: boolean): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE workout_logs SET completed_at = ? WHERE id = ?',
    [completed ? new Date().toISOString() : null, workoutLogId]
  );
}

export async function getCompletedDates(): Promise<string[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ date: string }>(
    'SELECT date FROM workout_logs WHERE completed_at IS NOT NULL ORDER BY date ASC'
  );
  return rows.map((r) => r.date);
}

export async function getLast7DaysLogs(): Promise<{ date: string; day_number: number; completed: boolean }[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ date: string; day_number: number; completed_at: string | null }>(
    `SELECT date, day_number, completed_at 
     FROM workout_logs 
     WHERE date >= date('now', '-7 days')
     ORDER BY date DESC`
  );
  return rows.map((r) => ({
    date: r.date,
    day_number: r.day_number,
    completed: Boolean(r.completed_at),
  }));
}
