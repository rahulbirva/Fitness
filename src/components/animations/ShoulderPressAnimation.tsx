import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { Colors } from '../../constants/theme';

export function ShoulderPressAnimation({ width = 200, height = 180 }: { width?: number; height?: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1700, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, []);

  const animatedArmsStyle = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [0, -32]);
    return {
      transform: [{ translateY }],
    };
  });

  const cx = width / 2;

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={width} height={height} style={{ position: 'absolute' }}>
        {/* Floor */}
        <Line x1={20} y1={165} x2={width - 20} y2={165} stroke={Colors.borderStrong} strokeWidth={2} />
        {/* Head */}
        <Circle cx={cx} cy={45} r={12} stroke={Colors.text} strokeWidth={3} fill={Colors.background} />
        {/* Torso */}
        <Line x1={cx} y1={57} x2={cx} y2={115} stroke={Colors.text} strokeWidth={4} strokeLinecap="round" />
        {/* Legs */}
        <Line x1={cx} y1={115} x2={cx - 20} y2={165} stroke={Colors.text} strokeWidth={3.5} strokeLinecap="round" />
        <Line x1={cx} y1={115} x2={cx + 20} y2={165} stroke={Colors.text} strokeWidth={3.5} strokeLinecap="round" />
      </Svg>

      <Animated.View style={[{ width, height }, animatedArmsStyle]}>
        <Svg width={width} height={height}>
          {/* Left arm overhead */}
          <Line x1={cx - 10} y1={70} x2={cx - 30} y2={50} stroke={Colors.accent} strokeWidth={3.5} strokeLinecap="round" />
          <Rect x={cx - 38} y={46} width={16} height={6} fill={Colors.text} rx={1} />

          {/* Right arm overhead */}
          <Line x1={cx + 10} y1={70} x2={cx + 30} y2={50} stroke={Colors.accent} strokeWidth={3.5} strokeLinecap="round" />
          <Rect x={cx + 22} y={46} width={16} height={6} fill={Colors.text} rx={1} />
        </Svg>
      </Animated.View>
    </View>
  );
}
