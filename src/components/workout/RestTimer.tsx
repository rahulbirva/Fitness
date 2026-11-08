import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Vibration, TouchableOpacity } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { Typography } from '../ui/Typography';
import { formatDuration } from '../../utils/date';

interface RestTimerProps {
  durationSeconds: number;
  onComplete: () => void;
  onDismiss: () => void;
}

export function RestTimer({ durationSeconds, onComplete, onDismiss }: RestTimerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(durationSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setSecondsRemaining(durationSeconds);

    intervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          try {
            // Vibrate pattern: wait 0ms, vibrate 300ms, pause 100ms, vibrate 300ms
            Vibration.vibrate([0, 300, 100, 300]);
          } catch {
            // vibration fallback
          }
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [durationSeconds]);

  const fraction = durationSeconds > 0 ? secondsRemaining / durationSeconds : 0;
  const progressPercent = `${Math.max(0, Math.min(100, fraction * 100))}%`;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Typography variant="captionBold" color={Colors.accent} style={styles.badge}>
          REST INTERVAL
        </Typography>
        <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Typography variant="captionBold" color={Colors.textMuted}>
            SKIP
          </Typography>
        </TouchableOpacity>
      </View>

      <Typography variant="monoLarge" color={Colors.accent} style={styles.timerNumber}>
        {formatDuration(secondsRemaining)}
      </Typography>

      {/* Flat progress bar */}
      <View style={styles.track}>
        <View style={[styles.bar, { width: progressPercent as any }]} />
      </View>

      <Typography variant="caption" color={Colors.textMuted} style={styles.caption}>
        Catch your breath, hydrate, and prepare for the next set.
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  badge: {
    letterSpacing: 0.8,
  },
  timerNumber: {
    textAlign: 'center',
    marginVertical: Spacing.xs,
    fontSize: 40,
    lineHeight: 46,
  },
  track: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.none,
    overflow: 'hidden',
    marginVertical: Spacing.xs,
  },
  bar: {
    height: '100%',
    backgroundColor: Colors.accent,
  },
  caption: {
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
