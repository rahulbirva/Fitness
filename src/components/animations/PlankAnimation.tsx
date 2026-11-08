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

export function PlankAnimation({ width = 240, height = 130 }: { width?: number; height?: number }) {
  const breathe = useSharedValue(0);

  useEffect(() => {
    breathe.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, []);

  const animatedCoreStyle = useAnimatedStyle(() => {
    const translateY = interpolate(breathe.value, [0, 1], [0, -4]);
    return {
      transform: [{ translateY }],
    };
  });

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={width} height={height} style={{ position: 'absolute' }}>
        {/* Floor */}
        <Line x1={20} y1={105} x2={width - 20} y2={105} stroke={Colors.borderStrong} strokeWidth={2} />
        {/* Toes on floor */}
        <Circle cx={40} cy={102} r={5} fill={Colors.text} />
        {/* Forearm on floor */}
        <Line x1={150} y1={103} x2={180} y2={103} stroke={Colors.text} strokeWidth={4} strokeLinecap="round" />
        {/* Upper arm straight up to shoulder */}
        <Line x1={150} y1={103} x2={150} y2={74} stroke={Colors.text} strokeWidth={3.5} strokeLinecap="round" />
      </Svg>

      <Animated.View style={[{ width, height }, animatedCoreStyle]}>
        <Svg width={width} height={height}>
          {/* Head */}
          <Circle cx={190} cy={66} r={11} stroke={Colors.text} strokeWidth={3} fill={Colors.background} />
          {/* Rigid plank spine from shoulder to heels */}
          <Line x1={150} y1={74} x2={40} y2={102} stroke={Colors.accent} strokeWidth={4} strokeLinecap="round" />
        </Svg>
      </Animated.View>
    </View>
  );
}
