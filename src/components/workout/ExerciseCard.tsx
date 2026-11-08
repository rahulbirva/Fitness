import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { Typography } from '../ui/Typography';
import { SetRow } from './SetRow';
import { RestTimer } from './RestTimer';
import { ExerciseAnimation } from '../animations/ExerciseAnimation';
import { WorkoutExercise } from '../../constants/workoutPlan';
import { EXERCISES } from '../../constants/exercises';

interface ExerciseCardProps {
  workoutExercise: WorkoutExercise;
  completedSets: Set<number>;
  onSetToggle: (setNumber: number) => void;
}

export function ExerciseCard({
  workoutExercise,
  completedSets,
  onSetToggle,
}: ExerciseCardProps) {
  const [showAnimation, setShowAnimation] = useState(false);
  const [activeTimerSeconds, setActiveTimerSeconds] = useState<number | null>(null);

  const exerciseDetail = EXERCISES.find((e) => e.id === workoutExercise.exerciseId);
  const totalSets = workoutExercise.sets;
  const doneCount = completedSets.size;
  const isAllDone = doneCount >= totalSets;

  const handleToggleSet = (setNum: number) => {
    const wasCompleted = completedSets.has(setNum);
    onSetToggle(setNum);

    if (!wasCompleted && setNum < totalSets && workoutExercise.restSeconds > 0) {
      // Trigger rest timer after completing a set
      setActiveTimerSeconds(workoutExercise.restSeconds);
    }
  };

  return (
    <View style={[styles.card, isAllDone && styles.cardAllDone]}>
      {/* Header bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Typography variant="bodyBold" style={styles.title}>
            {workoutExercise.name}
          </Typography>
          {exerciseDetail?.targetMuscles ? (
            <Typography variant="caption" color={Colors.textMuted}>
              {exerciseDetail.targetMuscles.slice(0, 3).join(', ')}
            </Typography>
          ) : null}
        </View>

        <View style={styles.headerRight}>
          <Typography
            variant="monoBold"
            color={isAllDone ? Colors.accent : Colors.text}
            style={styles.setCounter}
          >
            {doneCount}/{totalSets} SETS
          </Typography>

          <TouchableOpacity
            onPress={() => setShowAnimation((prev) => !prev)}
            style={[styles.formBtn, showAnimation && styles.formBtnActive]}
            activeOpacity={0.7}
          >
            <Typography
              variant="captionBold"
              color={showAnimation ? Colors.textInverse : Colors.accent}
            >
              {showAnimation ? 'HIDE FORM' : 'SEE FORM'}
            </Typography>
          </TouchableOpacity>
        </View>
      </View>

      {/* Animated Stick Figure Form Loop */}
      {showAnimation ? (
        <View style={styles.animationContainer}>
          <Typography variant="captionBold" color={Colors.textMuted} style={styles.animTitle}>
            STICK-FIGURE FORM LOOP
          </Typography>
          <ExerciseAnimation
            exerciseId={workoutExercise.exerciseId}
            width={240}
            height={150}
          />
        </View>
      ) : null}

      {/* Rest Timer */}
      {activeTimerSeconds !== null ? (
        <RestTimer
          durationSeconds={activeTimerSeconds}
          onComplete={() => setActiveTimerSeconds(null)}
          onDismiss={() => setActiveTimerSeconds(null)}
        />
      ) : null}

      {/* Set Rows */}
      <View style={styles.setsList}>
        {Array.from({ length: totalSets }, (_, i) => i + 1).map((setNum) => (
          <SetRow
            key={setNum}
            setNumber={setNum}
            repsTarget={workoutExercise.reps}
            weightNote={workoutExercise.weightNote}
            completed={completedSets.has(setNum)}
            onToggle={() => handleToggleSet(setNum)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  cardAllDone: {
    borderColor: Colors.accent,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.sm + 4,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: 16,
    lineHeight: 20,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  setCounter: {
    fontSize: 12,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  formBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: BorderRadius.sm,
  },
  formBtnActive: {
    backgroundColor: Colors.accent,
  },
  animationContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  animTitle: {
    fontSize: 10,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  setsList: {
    paddingVertical: 0,
  },
});
