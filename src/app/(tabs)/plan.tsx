import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { Typography } from '../../components/ui/Typography';
import { getProfile, Profile } from '../../db/queries/profile';
import { getCompletedDates } from '../../db/queries/workoutLogs';
import { WORKOUT_PLAN, WorkoutDay } from '../../constants/workoutPlan';
import { generateSchedule, getWorkoutTypeLabel, DaySchedule } from '../../utils/schedule';
import { formatDate } from '../../utils/date';

export default function PlanScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [completedDatesSet, setCompletedDatesSet] = useState<Set<string>>(new Set());
  const [selectedDayNum, setSelectedDayNum] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadPlanData = useCallback(async () => {
    try {
      const p = await getProfile();
      setProfile(p);

      const completed = await getCompletedDates();
      setCompletedDatesSet(new Set(completed));
    } catch (err) {
      console.error('Error loading plan:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPlanData();
    }, [loadPlanData])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadPlanData();
    setIsRefreshing(false);
  };

  const startDate = profile?.program_start_date || new Date().toISOString().split('T')[0];
  const schedule: DaySchedule[] = generateSchedule(startDate);

  // Group schedule into weeks (Week 1 to 5)
  const weeks: DaySchedule[][] = [];
  for (let i = 0; i < schedule.length; i += 7) {
    weeks.push(schedule.slice(i, i + 7));
  }

  const selectedDayInfo = selectedDayNum
    ? WORKOUT_PLAN.find((d) => d.dayNumber === selectedDayNum)
    : null;

  const totalCompleted = schedule.filter((d) => completedDatesSet.has(d.dateString)).length;
  const completionPercent = Math.round((totalCompleted / 30) * 100);

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
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="captionBold" color={Colors.accent} style={styles.subtitle}>
            PROGRESSIVE 30-DAY OVERLOAD CALENDAR
          </Typography>
          <Typography variant="h1">The 30-Day Plan</Typography>

          {/* Metric bar */}
          <View style={styles.statsBar}>
            <View style={styles.statBox}>
              <Typography variant="monoLarge" color={Colors.accent}>
                {totalCompleted}/30
              </Typography>
              <Typography variant="caption" color={Colors.textMuted}>
                DAYS COMPLETED
              </Typography>
            </View>

            <View style={styles.statBox}>
              <Typography variant="monoLarge" color={Colors.accent}>
                {completionPercent}%
              </Typography>
              <Typography variant="caption" color={Colors.textMuted}>
                PROGRAM PROGRESS
              </Typography>
            </View>
          </View>
        </View>

        {/* Selected Day Inspection Modal/Panel */}
        {selectedDayInfo ? (
          <View style={styles.inspectPanel}>
            <View style={styles.inspectHeader}>
              <View>
                <Typography variant="captionBold" color={Colors.accent}>
                  DAY {selectedDayInfo.dayNumber} • WEEK {selectedDayInfo.week} • {selectedDayInfo.dayOfWeek.toUpperCase()}
                </Typography>
                <Typography variant="h3">{selectedDayInfo.title}</Typography>
              </View>

              <TouchableOpacity
                onPress={() => setSelectedDayNum(null)}
                style={styles.closeBtn}
              >
                <Typography variant="captionBold" color={Colors.accent}>
                  CLOSE
                </Typography>
              </TouchableOpacity>
            </View>

            <Typography variant="caption" color={Colors.textMuted} style={styles.inspectNotes}>
              {selectedDayInfo.notes}
            </Typography>

            <View style={styles.exerciseRows}>
              {selectedDayInfo.exercises.map((ex, i) => (
                <View key={i} style={styles.planExRow}>
                  <Typography variant="bodyBold" style={{ flex: 1 }}>
                    {ex.name}
                  </Typography>
                  <Typography variant="monoMedium" color={Colors.accent}>
                    {ex.sets} x {ex.reps}
                  </Typography>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* 30 Day Weeks Calendar */}
        {weeks.map((weekDays, wIdx) => {
          const weekNum = wIdx + 1;
          return (
            <View key={weekNum} style={styles.weekCard}>
              <View style={styles.weekHeader}>
                <Typography variant="captionBold" color={Colors.accent}>
                  WEEK {weekNum}
                </Typography>
                <Typography variant="caption" color={Colors.textMuted}>
                  {weekNum === 1
                    ? 'Baseline conditioning (3 sets)'
                    : weekNum === 2
                    ? 'Volume increase (+2 reps)'
                    : weekNum === 3
                    ? 'Intensity overload (4 sets + weight)'
                    : weekNum === 4
                    ? 'Peak hypertrophy (max density)'
                    : 'Final wedding taper days'}
                </Typography>
              </View>

              <View style={styles.daysGrid}>
                {weekDays.map((day) => {
                  const isCompleted = completedDatesSet.has(day.dateString);
                  const isSelected = selectedDayNum === day.dayNumber;
                  const isToday = day.isToday;

                  return (
                    <TouchableOpacity
                      key={day.dayNumber}
                      style={[
                        styles.dayCell,
                        isCompleted && styles.dayCellCompleted,
                        isToday && styles.dayCellToday,
                        isSelected && styles.dayCellSelected,
                      ]}
                      onPress={() => setSelectedDayNum(day.dayNumber)}
                      activeOpacity={0.7}
                    >
                      <Typography
                        variant="caption"
                        color={isCompleted ? Colors.textInverse : Colors.textMuted}
                        style={styles.dayOfWeek}
                      >
                        {day.workout.dayOfWeek.toUpperCase()}
                      </Typography>

                      <Typography
                        variant="monoBold"
                        color={isCompleted ? Colors.textInverse : Colors.text}
                        style={styles.dayNum}
                      >
                        {String(day.dayNumber).padStart(2, '0')}
                      </Typography>

                      <Typography
                        variant="caption"
                        color={isCompleted ? Colors.surface : Colors.textMuted}
                        style={styles.dayTypeShort}
                        numberOfLines={1}
                      >
                        {day.workout.type === 'upper'
                          ? 'UPPER'
                          : day.workout.type === 'lower_core'
                          ? 'LOWER'
                          : day.workout.type === 'cardio_abs'
                          ? 'CARDIO'
                          : 'REST'}
                      </Typography>

                      {isCompleted ? (
                        <View style={styles.filledBadge}>
                          <Typography variant="captionBold" color={Colors.textInverse} style={{ fontSize: 8 }}>
                            DONE
                          </Typography>
                        </View>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
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
  header: {
    marginBottom: Spacing.md,
  },
  subtitle: {
    letterSpacing: 1,
    marginBottom: 2,
  },
  statsBar: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  statBox: {
    flex: 1,
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
  },
  inspectPanel: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  inspectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  closeBtn: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: BorderRadius.sm,
  },
  inspectNotes: {
    marginBottom: Spacing.sm,
  },
  exerciseRows: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs,
  },
  planExRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  weekCard: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm + 4,
    marginBottom: Spacing.md,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  dayCell: {
    width: '13.3%',
    minWidth: 44,
    aspectRatio: 0.8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  dayCellCompleted: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  dayCellToday: {
    borderColor: Colors.accent,
    borderWidth: 2,
  },
  dayCellSelected: {
    backgroundColor: Colors.surface,
    borderColor: Colors.accent,
  },
  dayOfWeek: {
    fontSize: 8,
    letterSpacing: 0.5,
  },
  dayNum: {
    fontSize: 13,
    lineHeight: 16,
    marginVertical: 1,
  },
  dayTypeShort: {
    fontSize: 7,
    letterSpacing: 0.2,
  },
  filledBadge: {
    marginTop: 1,
  },
});
