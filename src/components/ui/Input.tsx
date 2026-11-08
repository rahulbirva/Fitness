import React from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '../../constants/theme';
import { Typography } from './Typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  unit?: string;
  containerStyle?: ViewStyle | (ViewStyle | undefined | null)[];
  inputStyle?: TextStyle;
}

export function Input({
  label,
  error,
  unit,
  containerStyle,
  inputStyle,
  style,
  ...rest
}: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Typography variant="captionBold" style={styles.label}>
          {label.toUpperCase()}
        </Typography>
      ) : null}

      <View style={[styles.inputRow, error ? styles.inputRowError : null]}>
        <TextInput
          style={[styles.input, inputStyle, style]}
          placeholderTextColor={Colors.textMuted}
          selectionColor={Colors.accent}
          {...rest}
        />
        {unit ? (
          <Typography variant="monoMedium" color={Colors.textMuted} style={styles.unit}>
            {unit}
          </Typography>
        ) : null}
      </View>

      {error ? (
        <Typography variant="caption" color={Colors.error} style={styles.errorText}>
          {error}
        </Typography>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm + 2,
  },
  label: {
    marginBottom: 4,
    letterSpacing: 0.6,
    fontSize: FontSize.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    minHeight: 48,
    paddingHorizontal: Spacing.sm + 4,
  },
  inputRowError: {
    borderColor: Colors.error,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.md,
    color: Colors.text,
    paddingVertical: Spacing.sm,
  },
  unit: {
    marginLeft: Spacing.xs,
    textTransform: 'uppercase',
  },
  errorText: {
    marginTop: 4,
  },
});
