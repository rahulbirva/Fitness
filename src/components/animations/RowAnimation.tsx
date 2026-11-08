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

export function RowAnimation({ width = 220, height = 160 }: { width?: number; height?: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1700, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, []);

  const animatedRowStyle = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [0, -26]);
    return {
      transform: [{ translateY }],
    };
  });

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={width} height={height} style={{ position: 'absolute' }}>
        {/* Floor */}
        <Line x1={20} y1={140} x2={width - 20} y2={140} stroke={Colors.borderStrong} strokeWidth={2} />
        {/* Bench */}
        <Rect x={110} y={90} width={70} height={10} fill={Colors.borderStrong} rx={1} />
        <Line x1={120} y1={100} x2={120} y2={140} stroke={Colors.borderStrong} strokeWidth={3} />
        <Line x1={170} y1={100} x2={170} y2={140} stroke={Colors.borderStrong} strokeWidth={3} />
        {/* Head */}
        <Circle cx={155} cy={60} r={11} stroke={Colors.text} strokeWidth={3} fill={Colors.background} />
        {/* Torso hinged horizontally */}
        <Line x1={80} y1={75} x2={145} y2={70} stroke={Colors.text} strokeWidth={4} strokeLinecap="round" />
        {/* Left leg supporting */}
        <Line x1={80} y1={75} x2={60} y2={140} stroke={Colors.text} strokeWidth={3.5} strokeLinecap="round" />
        {/* Bench support arm */}
        <Line x1={135} y1={72} x2={135} y2={90} stroke={Colors.text} strokeWidth={3} strokeLinecap="round" />
      </Svg>

      <Animated.View style={[{ width, height }, animatedRowStyle]}>
        <Svg width={width} height={height}>
          {/* Rowing arm from shoulder (115, 72) pulling dumbbell upward to hip */}
          <Line x1={115} y1={72} x2={105} y2={110} stroke={Colors.accent} strokeWidth={3.5} strokeLinecap="round" />
          <Circle cx={105} cy={110} r={4} fill={Colors.text} />
          <Rect x={98} y={108} width={14} height={5} fill={Colors.text} rx={1} />
        </Svg>
      </Animated.View>
    </View>
  );
}
