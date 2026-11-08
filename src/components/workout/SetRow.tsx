import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { Typography } from '../ui/Typography';

interface SetRowProps {
  setNumber: number;
  repsTarget: string;
  weightNote?: string;
  completed: boolean;
  onToggle: () => void;
}

export function SetRow({
  setNumber,
  repsTarget,
  weightNote,
  completed,
  onToggle,
}: SetRowProps) {
  return (
    <TouchableOpacity
      style={[styles.row, completed && styles.rowCompleted]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={[styles.badge, completed && styles.badgeCompleted]}>
        <Typography
          variant="monoMedium"
          color={completed ? Colors.textInverse : Colors.text}
        >
          {String(setNumber).padStart(2, '0')}
        </Typography>
      </View>

      <View style={styles.info}>
        <Typography
          variant="bodyBold"
          color={completed ? Colors.textMuted : Colors.text}
          style={completed ? styles.textStrikethrough : undefined}
        >
          {repsTarget}
        </Typography>
        {weightNote ? (
          <Typography variant="caption" color={Colors.textMuted}>
            {weightNote}
          </Typography>
        ) : null}
      </View>

      <View style={[styles.checkBtn, completed && styles.checkBtnCompleted]}>
        {completed ? (
          <Svg width={14} height={14} viewBox="0 0 16 16" fill="none">
            <Path
              d="M3.5 8.5L6.5 11.5L12.5 4.5"
              stroke={Colors.textInverse}
              strokeWidth={2.5}
              strokeLinecap="square"
            />
          </Svg>
        ) : (
          <Typography variant="captionBold" color={Colors.textMuted}>
            SET {setNumber}
          </Typography>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    minHeight: 48,
    backgroundColor: Colors.background,
  },
  rowCompleted: {
    backgroundColor: Colors.surface,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm + 4,
  },
  badgeCompleted: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  info: {
    flex: 1,
  },
  textStrikethrough: {
    textDecorationLine: 'line-through',
  },
  checkBtn: {
    minWidth: 54,
    height: 32,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
    backgroundColor: Colors.background,
  },
  checkBtnCompleted: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
});
