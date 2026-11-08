import {
  getWorkoutForDate,
  getTodayDayNumber,
  getWeekForDay,
  getWorkoutTypeLabel,
  generateSchedule,
} from '../src/utils/schedule';
import { WORKOUT_PLAN } from '../src/constants/workoutPlan';

describe('schedule utilities', () => {
  const startDate = '2025-05-01';

  it('WORKOUT_PLAN contains exactly 30 days', () => {
    expect(WORKOUT_PLAN).toHaveLength(30);
    expect(WORKOUT_PLAN[0].dayNumber).toBe(1);
    expect(WORKOUT_PLAN[29].dayNumber).toBe(30);
  });

  it('returns day 1 workout on start date', () => {
    const workout = getWorkoutForDate(startDate, '2025-05-01');
    expect(workout).not.toBeNull();
    expect(workout?.dayNumber).toBe(1);
    expect(workout?.type).toBe('upper');
  });

  it('returns day 15 workout two weeks after start date', () => {
    const workout = getWorkoutForDate(startDate, '2025-05-15');
    expect(workout).not.toBeNull();
    expect(workout?.dayNumber).toBe(15);
  });

  it('returns day 30 workout on the 30th day', () => {
    const workout = getWorkoutForDate(startDate, '2025-05-30');
    expect(workout).not.toBeNull();
    expect(workout?.dayNumber).toBe(30);
  });

  it('returns null before start date or after day 30', () => {
    expect(getWorkoutForDate(startDate, '2025-04-30')).toBeNull();
    expect(getWorkoutForDate(startDate, '2025-05-31')).toBeNull();
  });

  it('computes today day number correctly', () => {
    const dayNum = getTodayDayNumber(startDate, '2025-05-05');
    expect(dayNum).toBe(5);
  });

  it('calculates week number correctly', () => {
    expect(getWeekForDay(1)).toBe(1);
    expect(getWeekForDay(7)).toBe(1);
    expect(getWeekForDay(8)).toBe(2);
    expect(getWeekForDay(14)).toBe(2);
    expect(getWeekForDay(15)).toBe(3);
    expect(getWeekForDay(28)).toBe(4);
    expect(getWeekForDay(29)).toBe(5);
    expect(getWeekForDay(30)).toBe(5);
  });

  it('returns readable labels for workout types', () => {
    expect(getWorkoutTypeLabel('upper')).toBe('Upper Body Strength');
    expect(getWorkoutTypeLabel('lower_core')).toBe('Lower Body & Core');
    expect(getWorkoutTypeLabel('cardio_abs')).toBe('Cardio & Abs Conditioning');
    expect(getWorkoutTypeLabel('rest')).toBe('Active Recovery & Walk');
  });

  it('generates full 30-day schedule array', () => {
    const schedule = generateSchedule(startDate, '2025-05-10');
    expect(schedule).toHaveLength(30);
    expect(schedule[0].isPast).toBe(true);
    expect(schedule[9].isToday).toBe(true); // day 10
    expect(schedule[10].isFuture).toBe(true);
  });
});
