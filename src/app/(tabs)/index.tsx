import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';
import { ExerciseCard } from '../../components/workout/ExerciseCard';
import { WaterTracker } from '../../components/diet/WaterTracker';
import { getProfile, Profile } from '../../db/queries/profile';
import {
  getOrCreateWorkoutLog,
  getSetLogsForWorkout,
  logSet,
  removeSetLog,
  markWorkoutCompleted,
  WorkoutLog,
  SetLog,
} from '../../db/queries/workoutLogs';
import { getMealLogsForDate, toggleMealCompleted, MealLog } from '../../db/queries/mealLogs';
import { getWaterForDate, setWaterForDate } from '../../db/queries/waterLogs';
import { getMetricForDate, upsertBodyMetrics, BodyMetric } from '../../db/queries/bodyMetrics';
import { getWorkoutForDate } from '../../utils/schedule';
import { todayDateString, formatDate } from '../../utils/date';
import { WorkoutDay } from '../../constants/workoutPlan';

export default function TodayScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workout, setWorkout] = useState<WorkoutDay | null>(null);
  const [workoutLog, setWorkoutLog] = useState<WorkoutLog | null>(null);
  const [completedSetsMap, setCompletedSetsMap] = useState<Record<string, Set<number>>>({});
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [stepsInput, setStepsInput] = useState('');
  const [sleepInput, setSleepInput] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isWorkoutDone, setIsWorkoutDone] = useState(false);

  const todayStr = todayDateString();

  const loadTodayData = useCallback(async () => {
    try {
      const p = await getProfile();
      setProfile(p);

      if (p?.program_start_date) {
        const w = getWorkoutForDate(p.program_start_date, todayStr);
        setWorkout(w);

        if (w) {
          const log = await getOrCreateWorkoutLog(todayStr, w.dayNumber);
          setWorkoutLog(log);
          setIsWorkoutDone(Boolean(log.completed_at));

          const sets = await getSetLogsForWorkout(log.id);
          const map: Record<string, Set<number>> = {};
          for (const s of sets) {
            if (!map[s.exercise_id]) {
              map[s.exercise_id] = new Set();
            }
            map[s.exercise_id].add(s.set_number);
          }
          setCompletedSetsMap(map);
        }
      }

      // Meals
      const meals = await getMealLogsForDate(todayStr);
      setMealLogs(meals);

      // Water
      const water = await getWaterForDate(todayStr);
      setWaterGlasses(water);

      // Body metrics (steps & sleep)
      const metric = await getMetricForDate(todayStr);
      if (metric) {
        if (metric.steps !== null) setStepsInput(String(metric.steps));
        if (metric.sleep_hours !== null) setSleepInput(String(metric.sleep_hours));
      }
    } catch (err) {
      console.error('Error loading today data:', err);
    }
  }, [todayStr]);

  useFocusEffect(
    useCallback(() => {
      loadTodayData();
    }, [loadTodayData])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadTodayData();
    setIsRefreshing(false);
  };

  const handleSetToggle = async (exerciseId: string, setNumber: number) => {
    if (!workoutLog) return;

    const currentSets = completedSetsMap[exerciseId] ?? new Set<number>();
    const isCompleted = currentSets.has(setNumber);

    const updated = new Set(currentSets);
    if (isCompleted) {
      updated.delete(setNumber);
      await removeSetLog(workoutLog.id, exerciseId, setNumber);
    } else {
      updated.add(setNumber);
      const ex = workout?.exercises.find((e) => e.exerciseId === exerciseId);
      await logSet(workoutLog.id, exerciseId, setNumber, ex?.reps || '10');
    }

    setCompletedSetsMap((prev) => ({
      ...prev,
      [exerciseId]: updated,
    }));
  };

  const handleToggleWorkoutComplete = async () => {
    if (!workoutLog) return;
    const nextState = !isWorkoutDone;
    await markWorkoutCompleted(workoutLog.id, nextState);
    setIsWorkoutDone(nextState);
  };

  const handleMealToggle = async (slot: string, currentCompleted: boolean) => {
    await toggleMealCompleted(todayStr, slot, !currentCompleted);
    const updated = await getMealLogsForDate(todayStr);
    setMealLogs(updated);
  };

  const handleWaterAdd = async () => {
    const next = waterGlasses + 1;
    setWaterGlasses(next);
    await setWaterForDate(todayStr, next);
  };

  const handleWaterRemove = async () => {
    if (waterGlasses <= 0) return;
    const next = waterGlasses - 1;
    setWaterGlasses(next);
    await setWaterForDate(todayStr, next);
  };

  const handleStepsSave = async () => {
    const val = parseInt(stepsInput.trim(), 10);
    if (!isNaN(val)) {
      await upsertBodyMetrics(todayStr, { steps: val });
    }
  };

  const handleSleepSave = async () => {
    const val = parseFloat(sleepInput.trim());
    if (!isNaN(val)) {
      await upsertBodyMetrics(todayStr, { sleep_hours: val });
    }
  };

  // Compute total sets vs done sets
  const totalWorkoutSets = workout?.exercises.reduce((acc, ex) => acc + ex.sets, 0) ?? 0;
  const doneWorkoutSets = Object.values(completedSetsMap).reduce(
    (acc, set) => acc + set.size,
    0
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.accent}
          />
        }
      >
        {/* Header Section */}
        <View style={styles.topHeader}>
          <View>
            <Typography variant="captionBold" color={Colors.accent} style={styles.dateLabel}>
              {formatDate(todayStr).toUpperCase()}
            </Typography>
            <Typography variant="h1" style={styles.mainTitle}>
              {workout ? `DAY ${workout.dayNumber}` : 'TODAY'}
            </Typography>
          </View>

          {workout ? (
            <View style={styles.headerRight}>
              <Typography variant="monoLarge" color={Colors.accent}>
                {doneWorkoutSets}/{totalWorkoutSets}
              </Typography>
              <Typography variant="caption" color={Colors.textMuted}>
                SETS TICKED
              </Typography>
            </View>
          ) : null}
        </View>

        {/* Workout Routine Card */}
        {workout ? (
          <View style={styles.workoutContainer}>
            <View style={styles.workoutBanner}>
              <View style={styles.bannerLeft}>
                <Typography variant="h3">{workout.title}</Typography>
                <Typography variant="caption" color={Colors.textMuted} style={styles.bannerNotes}>
                  {workout.notes}
                </Typography>
              </View>

              <View style={styles.timeBadge}>
                <Typography variant="monoMedium" color={Colors.accent}>
                  {workout.durationMinutes} MIN
                </Typography>
              </View>
            </View>

            {/* Warmup notice */}
            <View style={styles.routineNotice}>
              <Typography variant="captionBold" color={Colors.text}>
                WARMUP (5 MIN):{' '}
                <Typography variant="caption" color={Colors.text}>
                  {workout.warmup}
                </Typography>
              </Typography>
            </View>

            {/* Exercise Checklist */}
            <View style={styles.exercisesList}>
              {workout.exercises.map((ex) => (
                <ExerciseCard
                  key={ex.exerciseId}
                  workoutExercise={ex}
                  completedSets={completedSetsMap[ex.exerciseId] ?? new Set()}
                  onSetToggle={(setNum) => handleSetToggle(ex.exerciseId, setNum)}
                />
              ))}
            </View>

            {/* Cooldown notice */}
            <View style={[styles.routineNotice, { marginTop: Spacing.xs }]}>
              <Typography variant="captionBold" color={Colors.text}>
                COOLDOWN (5 MIN):{' '}
                <Typography variant="caption" color={Colors.text}>
                  {workout.cooldown}
                </Typography>
              </Typography>
            </View>

            {/* Finish Workout Button */}
            <Button
              label={isWorkoutDone ? 'WORKOUT COMPLETED (DONE)' : 'MARK WORKOUT AS COMPLETED'}
              onPress={handleToggleWorkoutComplete}
              variant={isWorkoutDone ? 'secondary' : 'primary'}
              style={styles.finishBtn}
            />
          </View>
        ) : (
          <View style={styles.noProgramBox}>
            <Typography variant="bodyBold">Program Not Active</Typography>
            <Typography variant="caption" color={Colors.textMuted} style={{ marginTop: 4 }}>
              Set your program start date in Settings to begin your 30-day journey.
            </Typography>
          </View>
        )}

        {/* Section Divider */}
        <View style={styles.divider} />

        {/* Meals Checklist Section */}
        <View style={styles.section}>
          <Typography variant="captionBold" color={Colors.textMuted} style={styles.sectionHeader}>
            MEAL CHECKLIST
          </Typography>

          {(['breakfast', 'lunch', 'snack', 'dinner'] as const).map((slot) => {
            const currentLog = mealLogs.find((m) => m.slot === slot);
            const isCompleted = currentLog ? currentLog.completed === 1 : false;

            return (
              <Checkbox
                key={slot}
                checked={isCompleted}
                onToggle={() => handleMealToggle(slot, isCompleted)}
                label={slot.toUpperCase()}
                sublabel={
                  currentLog?.meal_name
                    ? `${currentLog.meal_name} (${currentLog.calories} kcal, ${currentLog.protein_g}g P)`
                    : 'Choose in Diet tab'
                }
              />
            );
          })}
        </View>

        {/* Water Counter Tracker */}
        <WaterTracker
          glasses={waterGlasses}
          targetGlasses={14}
          onAdd={handleWaterAdd}
          onRemove={handleWaterRemove}
        />

        {/* Daily Metrics: Steps and Sleep */}
        <View style={styles.section}>
          <Typography variant="captionBold" color={Colors.textMuted} style={styles.sectionHeader}>
            DAILY HEALTH TARGETS
          </Typography>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Input
                label="STEPS TODAY"
                value={stepsInput}
                onChangeText={setStepsInput}
                onBlur={handleStepsSave}
                keyboardType="number-pad"
                placeholder="8000"
                unit="STEPS"
              />
              <Typography variant="caption" color={Colors.textMuted}>
                Target: 8,000 - 10,000
              </Typography>
            </View>

            <View style={{ width: Spacing.md }} />

            <View style={styles.metricItem}>
              <Input
                label="SLEEP LAST NIGHT"
                value={sleepInput}
                onChangeText={setSleepInput}
                onBlur={handleSleepSave}
                keyboardType="decimal-pad"
                placeholder="7.5"
                unit="HRS"
              />
              <Typography variant="caption" color={Colors.textMuted}>
                Target: 7.0 - 8.0 hours
              </Typography>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  container: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl + 24,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  dateLabel: {
    letterSpacing: 1,
    marginBottom: 2,
  },
  mainTitle: {
    letterSpacing: -0.5,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  workoutContainer: {
    marginBottom: Spacing.md,
  },
  workoutBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
  },
  bannerLeft: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  bannerNotes: {
    marginTop: 4,
    lineHeight: 18,
  },
  timeBadge: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: BorderRadius.sm,
  },
  routineNotice: {
    backgroundColor: Colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  exercisesList: {
    marginTop: Spacing.xs,
  },
  finishBtn: {
    marginTop: Spacing.sm,
  },
  noProgramBox: {
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  metricsRow: {
    flexDirection: 'row',
  },
  metricItem: {
    flex: 1,
  },
});
