/**
 * High-reliability web storage driver for expo-sqlite compatibility on web browsers.
 * Replaces worker-based wa-sqlite on Web so Metro web preview runs immediately without hanging.
 */
import { todayDateString } from '../utils/date';

interface DBState {
  profiles: any[];
  workout_logs: any[];
  set_logs: any[];
  meal_logs: any[];
  water_logs: any[];
  body_metrics: any[];
  chat_messages: any[];
}

const STORAGE_KEY = 'wedding_fit_web_db_v1';

function getInitialState(): DBState {
  const today = todayDateString();
  const wedding = new Date();
  wedding.setDate(wedding.getDate() + 30);
  const yyyy = wedding.getFullYear();
  const mm = String(wedding.getMonth() + 1).padStart(2, '0');
  const dd = String(wedding.getDate()).padStart(2, '0');
  const weddingDate = `${yyyy}-${mm}-${dd}`;

  return {
    profiles: [
      {
        id: 1,
        name: 'Groom/Bride',
        age: 27,
        height_cm: 174,
        weight_kg: 74,
        sex: 'male',
        goal: 'fat_loss',
        wedding_date: weddingDate,
        program_start_date: today,
        ai_provider: 'gemini',
        ai_model: 'gemini-1.5-flash',
        reminder_time: '17:30',
        water_reminder_enabled: 1,
        units: 'metric',
        fast_food_eaten_this_week: 0,
        updated_at: new Date().toISOString(),
      },
    ],
    workout_logs: [],
    set_logs: [],
    meal_logs: [
      { id: 1, date: today, slot: 'breakfast', meal_id: 'b_eggs', meal_name: '3 Boiled Eggs & Whole Wheat Toast', calories: 270, protein_g: 21, completed: 0 },
      { id: 2, date: today, slot: 'lunch', meal_id: 'l_dal_roti_sabzi', meal_name: 'Yellow Tadka Dal, 2 Phulkas & Green Sabzi', calories: 460, protein_g: 20, completed: 0 },
      { id: 3, date: today, slot: 'snack', meal_id: 's_curd', meal_name: 'Fresh Curd (Dahi) with Roasted Jeera', calories: 130, protein_g: 11, completed: 0 },
      { id: 4, date: today, slot: 'dinner', meal_id: 'd_paneer_sabzi_roti', meal_name: 'Paneer Shimla Mirch with Exactly 1 Phulka Roti', calories: 360, protein_g: 21, completed: 0 },
    ],
    water_logs: [{ id: 1, date: today, glasses: 4 }],
    body_metrics: [
      { id: 1, date: today, weight_kg: 74.0, waist_cm: 86.0, photo_path: null, steps: 4200, sleep_hours: 7.5, notes: '' },
    ],
    chat_messages: [
      {
        id: 1,
        session_id: 'main',
        role: 'assistant',
        content: 'Namaste! I am your 30-day wedding fitness & Indian diet coach. Day 1 starts today with your Upper Body session. Keep your water bottle handy and aim for 3.5 L. How are you feeling today?',
        created_at: new Date().toISOString(),
      },
    ],
  };
}

class WebSQLiteDatabase {
  private state: DBState;

  constructor() {
    this.state = this.load();
  }

  private load(): DBState {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(STORAGE_KEY);
        if (item) {
          return JSON.parse(item);
        }
      }
    } catch {
      // ignore
    }
    const initial = getInitialState();
    this.save(initial);
    return initial;
  }

  private save(data: DBState): void {
    this.state = data;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    } catch {
      // ignore
    }
  }

  async execAsync(sql: string): Promise<void> {
    // schema creation handled in initialState
  }

  async closeAsync(): Promise<void> {}

  async getFirstAsync<T>(sql: string, params: any[] = []): Promise<T | null> {
    const all = await this.getAllAsync<T>(sql, params);
    return all[0] ?? null;
  }

  async getAllAsync<T>(sql: string, params: any[] = []): Promise<T[]> {
    const query = sql.trim().toLowerCase();

    // 1. Profiles
    if (query.includes('from profiles')) {
      return (this.state.profiles as unknown) as T[];
    }

    // 2. Workout logs
    if (query.includes('from workout_logs')) {
      if (query.includes('completed_at is not null')) {
        return (this.state.workout_logs
          .filter((w) => Boolean(w.completed_at))
          .map((w) => ({ date: w.date })) as unknown) as T[];
      }
      if (query.includes("where date >= date('now', '-7 days')") || query.includes('where date >=')) {
        return (this.state.workout_logs.slice(-7) as unknown) as T[];
      }
      if (query.includes('where date = ?')) {
        const date = params[0];
        return (this.state.workout_logs.filter((w) => w.date === date) as unknown) as T[];
      }
      return (this.state.workout_logs as unknown) as T[];
    }

    // 3. Set logs
    if (query.includes('from set_logs')) {
      if (query.includes('where workout_log_id = ?')) {
        const logId = params[0];
        return (this.state.set_logs.filter((s) => s.workout_log_id === logId) as unknown) as T[];
      }
      return (this.state.set_logs as unknown) as T[];
    }

    // 4. Meal logs
    if (query.includes('from meal_logs')) {
      if (query.includes('where date = ?')) {
        const date = params[0];
        return (this.state.meal_logs.filter((m) => m.date === date) as unknown) as T[];
      }
      return (this.state.meal_logs as unknown) as T[];
    }

    // 5. Water logs
    if (query.includes('from water_logs')) {
      if (query.includes('where date = ?')) {
        const date = params[0];
        const row = this.state.water_logs.find((w) => w.date === date);
        return row ? (([row] as unknown) as T[]) : [];
      }
      return (this.state.water_logs as unknown) as T[];
    }

    // 6. Body metrics
    if (query.includes('from body_metrics')) {
      if (query.includes('where date = ?')) {
        const date = params[0];
        const row = this.state.body_metrics.find((b) => b.date === date);
        return row ? (([row] as unknown) as T[]) : [];
      }
      return (this.state.body_metrics.slice(-30).reverse() as unknown) as T[];
    }

    // 7. Chat messages
    if (query.includes('from chat_messages')) {
      if (query.includes('where session_id = ?')) {
        const sessionId = params[0];
        return (this.state.chat_messages.filter((c) => c.session_id === sessionId) as unknown) as T[];
      }
      return (this.state.chat_messages as unknown) as T[];
    }

    return [];
  }

  async runAsync(sql: string, params: any[] = []): Promise<any> {
    const query = sql.trim().toLowerCase();

    // UPDATE profiles
    if (query.startsWith('update profiles')) {
      const p = this.state.profiles[0] || {};
      if (query.includes('fast_food_eaten_this_week = ?')) {
        p.fast_food_eaten_this_week = params[0];
      } else {
        // Dynamic update from settings
        // sql is: UPDATE profiles SET field1 = ?, field2 = ..., updated_at = ? WHERE id = 1
        const fieldsMatch = sql.match(/SET\s+(.+)\s+WHERE/i);
        if (fieldsMatch) {
          const fieldNames = fieldsMatch[1].split(',').map((f) => f.split('=')[0].trim());
          fieldNames.forEach((name, i) => {
            if (name !== 'updated_at') {
              p[name] = params[i];
            }
          });
        }
      }
      p.updated_at = new Date().toISOString();
      this.state.profiles = [p];
      this.save(this.state);
      return { changes: 1 };
    }

    // WORKOUT LOGS
    if (query.startsWith('insert into workout_logs')) {
      const date = params[0];
      const day_number = params[1];
      const existing = this.state.workout_logs.find((w) => w.date === date);
      if (!existing) {
        this.state.workout_logs.push({
          id: this.state.workout_logs.length + 1,
          date,
          day_number,
          completed_at: null,
        });
        this.save(this.state);
      }
      return { changes: 1 };
    }

    if (query.startsWith('update workout_logs set completed_at = ?')) {
      const completed_at = params[0];
      const id = params[1];
      const row = this.state.workout_logs.find((w) => w.id === id);
      if (row) {
        row.completed_at = completed_at;
        this.save(this.state);
      }
      return { changes: 1 };
    }

    // SET LOGS
    if (query.startsWith('insert into set_logs') || query.startsWith('insert or replace into set_logs')) {
      const [workout_log_id, exercise_id, set_number, reps_target, reps_done, weight_kg] = params;
      const filtered = this.state.set_logs.filter(
        (s) => !(s.workout_log_id === workout_log_id && s.exercise_id === exercise_id && s.set_number === set_number)
      );
      filtered.push({
        id: this.state.set_logs.length + 1,
        workout_log_id,
        exercise_id,
        set_number,
        reps_target,
        reps_done,
        weight_kg,
        completed_at: new Date().toISOString(),
      });
      this.state.set_logs = filtered;
      this.save(this.state);
      return { changes: 1 };
    }

    if (query.startsWith('delete from set_logs')) {
      const [workout_log_id, exercise_id, set_number] = params;
      this.state.set_logs = this.state.set_logs.filter(
        (s) => !(s.workout_log_id === workout_log_id && s.exercise_id === exercise_id && s.set_number === set_number)
      );
      this.save(this.state);
      return { changes: 1 };
    }

    // MEAL LOGS
    if (query.startsWith('insert into meal_logs')) {
      const [date, slot, meal_id, meal_name, calories, protein_g, completed] = params;
      const filtered = this.state.meal_logs.filter((m) => !(m.date === date && m.slot === slot));
      filtered.push({
        id: this.state.meal_logs.length + 1,
        date,
        slot,
        meal_id,
        meal_name,
        calories: Number(calories) || 0,
        protein_g: Number(protein_g) || 0,
        completed: completed ? 1 : 0,
      });
      this.state.meal_logs = filtered;
      this.save(this.state);
      return { changes: 1 };
    }

    if (query.startsWith('update meal_logs set completed = ?')) {
      const [completed, date, slot] = params;
      const row = this.state.meal_logs.find((m) => m.date === date && m.slot === slot);
      if (row) {
        row.completed = completed;
        this.save(this.state);
      }
      return { changes: 1 };
    }

    // WATER LOGS
    if (query.startsWith('insert into water_logs')) {
      const [date, glasses] = params;
      const filtered = this.state.water_logs.filter((w) => w.date !== date);
      filtered.push({
        id: this.state.water_logs.length + 1,
        date,
        glasses: Number(glasses) || 0,
      });
      this.state.water_logs = filtered;
      this.save(this.state);
      return { changes: 1 };
    }

    // BODY METRICS
    if (query.startsWith('insert into body_metrics') || query.startsWith('insert or ignore into body_metrics')) {
      const [date, weight_kg, waist_cm, photo_path, steps, sleep_hours, notes] = params;
      const existing = this.state.body_metrics.find((b) => b.date === date);
      if (existing) {
        if (weight_kg !== undefined && weight_kg !== null) existing.weight_kg = weight_kg;
        if (waist_cm !== undefined && waist_cm !== null) existing.waist_cm = waist_cm;
        if (photo_path !== undefined && photo_path !== null) existing.photo_path = photo_path;
        if (steps !== undefined && steps !== null) existing.steps = steps;
        if (sleep_hours !== undefined && sleep_hours !== null) existing.sleep_hours = sleep_hours;
        if (notes !== undefined && notes !== null) existing.notes = notes;
      } else {
        this.state.body_metrics.push({
          id: this.state.body_metrics.length + 1,
          date,
          weight_kg: weight_kg ?? null,
          waist_cm: waist_cm ?? null,
          photo_path: photo_path ?? null,
          steps: steps ?? null,
          sleep_hours: sleep_hours ?? null,
          notes: notes ?? null,
        });
      }
      this.save(this.state);
      return { changes: 1 };
    }

    // CHAT MESSAGES
    if (query.startsWith('insert into chat_messages')) {
      const [session_id, role, content] = params;
      this.state.chat_messages.push({
        id: this.state.chat_messages.length + 1,
        session_id,
        role,
        content,
        created_at: new Date().toISOString(),
      });
      this.save(this.state);
      return { changes: 1 };
    }

    if (query.startsWith('delete from chat_messages')) {
      const sessionId = params[0];
      this.state.chat_messages = this.state.chat_messages.filter((c) => c.session_id !== sessionId);
      this.save(this.state);
      return { changes: 1 };
    }

    return { changes: 0 };
  }

  reset(): void {
    const initial = getInitialState();
    this.save(initial);
  }
}

let webDbInstance: WebSQLiteDatabase | null = null;

export function getWebDatabase(): WebSQLiteDatabase {
  if (!webDbInstance) {
    webDbInstance = new WebSQLiteDatabase();
  }
  return webDbInstance;
}

export function resetWebDatabase(): void {
  if (webDbInstance) {
    webDbInstance.reset();
  } else {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }
}
