import React from 'react';
import { Text, TextStyle, StyleSheet, TextProps } from 'react-native';
import { Colors, FontFamily, FontSize } from '../../constants/theme';

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body'
  | 'bodyMedium'
  | 'bodyBold'
  | 'caption'
  | 'captionBold'
  | 'mono'
  | 'monoMedium'
  | 'monoBold'
  | 'monoLarge';

interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  style?: TextStyle | (TextStyle | undefined | null)[];
  children: React.ReactNode;
}

export function Typography({
  variant = 'body',
  color,
  style,
  children,
  ...rest
}: TypographyProps) {
  const variantStyle = styles[variant];
  return (
    <Text
      style={[
        variantStyle,
        color ? { color } : null,
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  h1: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.xxxl,
    color: Colors.text,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.xxl,
    color: Colors.text,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.xl,
    color: Colors.text,
    lineHeight: 26,
  },
  h4: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.lg,
    color: Colors.text,
    lineHeight: 22,
  },
  body: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 21,
  },
  bodyMedium: {
    fontFamily: FontFamily.sansMedium,
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 21,
  },
  bodyBold: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 21,
  },
  caption: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    lineHeight: 17,
  },
  captionBold: {
    fontFamily: FontFamily.sansBold,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    lineHeight: 17,
  },
  mono: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 20,
  },
  monoMedium: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.sm,
    color: Colors.text,
    lineHeight: 18,
  },
  monoBold: {
    fontFamily: FontFamily.monoBold,
    fontSize: FontSize.lg,
    color: Colors.text,
    lineHeight: 22,
  },
  monoLarge: {
    fontFamily: FontFamily.monoBold,
    fontSize: FontSize.xxxl,
    color: Colors.text,
    lineHeight: 38,
  },
});
