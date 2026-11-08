export const Colors = {
  background: '#EFE9DD',
  surface: '#E5DED0',
  surfaceHighlight: '#DCD4C4',
  accent: '#2D5016',
  accentLight: '#436E25',
  text: '#1A1A1A',
  textMuted: '#6B6B6B',
  textInverse: '#EFE9DD',
  border: '#C8BFA8',
  borderStrong: '#A99F87',
  success: '#2D5016',
  error: '#8B2000',
  warning: '#996300',
  tint: '#2D5016',
} as const;

export const FontFamily = {
  sans: 'IBMPlexSans_400Regular',
  sansMedium: 'IBMPlexSans_500Medium',
  sansBold: 'IBMPlexSans_700Bold',
  mono: 'IBMPlexMono_400Regular',
  monoBold: 'IBMPlexMono_700Bold',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  none: 0,
  sm: 2,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
} as const;
