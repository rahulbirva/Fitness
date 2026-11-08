import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { Typography } from './Typography';

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label?: string;
  sublabel?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Checkbox({
  checked,
  onToggle,
  label,
  sublabel,
  disabled = false,
  style,
}: CheckboxProps) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      disabled={disabled}
      style={[styles.container, disabled && styles.disabled, style]}
      activeOpacity={0.7}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked ? (
          <Svg width={14} height={14} viewBox="0 0 16 16" fill="none">
            <Path
              d="M3.5 8.5L6.5 11.5L12.5 4.5"
              stroke={Colors.textInverse}
              strokeWidth={2.5}
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
          </Svg>
        ) : null}
      </View>

      {label ? (
        <View style={styles.textContainer}>
          <Typography
            variant="bodyMedium"
            color={checked ? Colors.textMuted : Colors.text}
            style={checked ? styles.textCompleted : undefined}
          >
            {label}
          </Typography>
          {sublabel ? (
            <Typography variant="caption" color={Colors.textMuted}>
              {sublabel}
            </Typography>
          ) : null}
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingVertical: Spacing.xs,
  },
  box: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm + 4,
  },
  boxChecked: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  textCompleted: {
    textDecorationLine: 'line-through',
  },
  disabled: {
    opacity: 0.5,
  },
});
