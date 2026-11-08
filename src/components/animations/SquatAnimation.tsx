import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { Colors } from '../../constants/theme';

export function SquatAnimation({ width = 200, height = 180 }: { width?: number; height?: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [0, 36]);
    return {
      transform: [{ translateY }],
    };
  });

  const cx = width / 2;

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={width} height={height} style={{ position: 'absolute' }}>
        {/* Floor */}
        <Line x1={20} y1={160} x2={width - 20} y2={160} stroke={Colors.borderStrong} strokeWidth={2} />
        {/* Feet on floor */}
        <Circle cx={cx - 24} cy={158} r={5} fill={Colors.text} />
        <Circle cx={cx + 24} cy={158} r={5} fill={Colors.text} />
      </Svg>

      <Animated.View style={[{ width, height }, animatedStyle]}>
        <Svg width={width} height={height}>
          {/* Head */}
          <Circle cx={cx} cy={38} r={12} stroke={Colors.text} strokeWidth={3} fill={Colors.background} />
          {/* Torso */}
          <Line x1={cx} y1={50} x2={cx} y2={102} stroke={Colors.text} strokeWidth={4} strokeLinecap="round" />
          {/* Arms extended out for counter balance */}
          <Line x1={cx} y1={64} x2={cx + 36} y2={64} stroke={Colors.text} strokeWidth={3} strokeLinecap="round" />
          {/* Left leg */}
          <Line x1={cx} y1={102} x2={cx - 24} y2={124} stroke={Colors.text} strokeWidth={3.5} strokeLinecap="round" />
          <Line x1={cx - 24} y1={124} x2={cx - 24} y2={158} stroke={Colors.text} strokeWidth={3.5} strokeLinecap="round" />
          {/* Right leg */}
          <Line x1={cx} y1={102} x2={cx + 24} y2={124} stroke={Colors.text} strokeWidth={3.5} strokeLinecap="round" />
          <Line x1={cx + 24} y1={124} x2={cx + 24} y2={158} stroke={Colors.text} strokeWidth={3.5} strokeLinecap="round" />
        </Svg>
      </Animated.View>
    </View>
  );
}
