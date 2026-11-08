import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { Typography } from '../ui/Typography';

interface WaterTrackerProps {
  glasses: number;
  targetGlasses?: number;
  onAdd: () => void;
  onRemove: () => void;
}

export function WaterTracker({
  glasses,
  targetGlasses = 14,
  onAdd,
  onRemove,
}: WaterTrackerProps) {
  const currentLiters = ((glasses * 250) / 1000).toFixed(2);
  const targetLiters = ((targetGlasses * 250) / 1000).toFixed(1);
  const percent = Math.min(100, Math.round((glasses / targetGlasses) * 100));

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Typography variant="bodyBold">DAILY WATER INTAKE</Typography>
          <Typography variant="caption" color={Colors.textMuted}>
            Target 3.5 L for optimal fat oxidation & hydration
          </Typography>
        </View>

        <Typography variant="monoLarge" color={Colors.accent}>
          {currentLiters} <Typography variant="monoMedium" color={Colors.textMuted}>/ {targetLiters} L</Typography>
        </Typography>
      </View>

      {/* Progress Bar */}
      <View style={styles.track}>
        <View style={[styles.bar, { width: `${percent}%` }]} />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={onRemove}
          disabled={glasses <= 0}
          style={[styles.btn, glasses <= 0 && styles.btnDisabled]}
          activeOpacity={0.7}
        >
          <Typography variant="bodyBold" color={Colors.accent}>
            - 250 ML
          </Typography>
        </TouchableOpacity>

        <Typography variant="monoMedium" color={Colors.textMuted} style={styles.glassLabel}>
          {glasses} of {targetGlasses} glasses ({percent}%)
        </Typography>

        <TouchableOpacity
          onPress={onAdd}
          style={[styles.btn, styles.btnAdd]}
          activeOpacity={0.7}
        >
          <Typography variant="bodyBold" color={Colors.textInverse}>
            + 250 ML
          </Typography>
        </TouchableOpacity>
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
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  track: {
    height: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.none,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  bar: {
    height: '100%',
    backgroundColor: Colors.accent,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  btn: {
    minWidth: 90,
    minHeight: 44,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  btnAdd: {
    backgroundColor: Colors.accent,
  },
  btnDisabled: {
    opacity: 0.35,
    borderColor: Colors.border,
  },
  glassLabel: {
    textAlign: 'center',
  },
});
