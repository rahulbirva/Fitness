import { WORKOUT_PLAN, WorkoutDay, WorkoutType } from '../constants/workoutPlan';

export interface DaySchedule {
  dayNumber: number;
  date: Date;
  dateString: string;
  workout: WorkoutDay;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
}

/**
 * Normalizes a date to start of day (midnight) in local time
 */
function normalizeDate(d: Date | string): Date {
  const date = typeof d === 'string' ? new Date(d) : new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Given a program start date and a target date, returns the matching WorkoutDay (1 to 30),
 * or null if targetDate is outside the 30-day program range.
 */
export function getWorkoutForDate(startDate: Date | string, targetDate: Date | string): WorkoutDay | null {
  const start = normalizeDate(startDate);
  const target = normalizeDate(targetDate);

  const diffMs = target.getTime() - start.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0 || diffDays >= 30) {
    return null;
  }

  const dayNumber = diffDays + 1;
  return WORKOUT_PLAN.find((d) => d.dayNumber === dayNumber) ?? null;
}

/**
 * Returns the day number (1 to 30) for today relative to program start date,
 * or null if today is before start or after 30 days.
 */
export function getTodayDayNumber(startDate: Date | string, currentDate: Date | string = new Date()): number | null {
  const workout = getWorkoutForDate(startDate, currentDate);
  return workout ? workout.dayNumber : null;
}

/**
 * Returns week number (1 to 5) for dayNumber (1 to 30)
 */
export function getWeekForDay(dayNumber: number): number {
  if (dayNumber < 1) return 1;
  return Math.ceil(dayNumber / 7);
}

/**
 * Human readable label for workout types
 */
export function getWorkoutTypeLabel(type: WorkoutType): string {
  switch (type) {
    case 'upper':
      return 'Upper Body Strength';
    case 'lower_core':
      return 'Lower Body & Core';
    case 'cardio_abs':
      return 'Cardio & Abs Conditioning';
    case 'rest':
      return 'Active Recovery & Walk';
  }
}

/**
 * Generates the full 30-day schedule array from a program start date
 */
export function generateSchedule(startDate: Date | string, referenceDate: Date | string = new Date()): DaySchedule[] {
  const start = normalizeDate(startDate);
  const ref = normalizeDate(referenceDate);
  const refTime = ref.getTime();

  return WORKOUT_PLAN.map((workout) => {
    const dayDate = new Date(start);
    dayDate.setDate(start.getDate() + (workout.dayNumber - 1));
    dayDate.setHours(0, 0, 0, 0);

    const dayTime = dayDate.getTime();
    const isToday = dayTime === refTime;
    const isPast = dayTime < refTime;
    const isFuture = dayTime > refTime;

    const yyyy = dayDate.getFullYear();
    const mm = String(dayDate.getMonth() + 1).padStart(2, '0');
    const dd = String(dayDate.getDate()).padStart(2, '0');
    const dateString = `${yyyy}-${mm}-${dd}`;

    return {
      dayNumber: workout.dayNumber,
      date: dayDate,
      dateString,
      workout,
      isToday,
      isPast,
      isFuture,
    };
  });
}
