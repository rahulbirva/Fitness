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

export function CrunchAnimation({ width = 240, height = 150 }: { width?: number; height?: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, []);

  const animatedUpperBodyStyle = useAnimatedStyle(() => {
    // Curl upper spine up and toward knees
    const rotate = interpolate(progress.value, [0, 1], [0, -18]);
    const translateY = interpolate(progress.value, [0, 1], [0, -10]);
    return {
      transform: [{ rotate: `${rotate}deg` }, { translateY }],
    };
  });

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={width} height={height} style={{ position: 'absolute' }}>
        {/* Floor */}
        <Line x1={20} y1={120} x2={width - 20} y2={120} stroke={Colors.borderStrong} strokeWidth={2} />
        {/* Feet on floor */}
        <Circle cx={190} cy={118} r={5} fill={Colors.text} />
        {/* Lower body (knees bent) */}
        <Line x1={120} y1={118} x2={165} y2={75} stroke={Colors.text} strokeWidth={3.5} strokeLinecap="round" />
        <Line x1={165} y1={75} x2={190} y2={118} stroke={Colors.text} strokeWidth={3.5} strokeLinecap="round" />
      </Svg>

      <Animated.View style={[{ width, height }, animatedUpperBodyStyle]}>
        <Svg width={width} height={height}>
          {/* Head with hands at temples */}
          <Circle cx={55} cy={95} r={12} stroke={Colors.text} strokeWidth={3} fill={Colors.background} />
          {/* Upper torso curling up from hips (at x: 120, y: 118) */}
          <Line x1={120} y1={118} x2={65} y2={100} stroke={Colors.accent} strokeWidth={4} strokeLinecap="round" />
          {/* Arms at temples */}
          <Line x1={75} y1={100} x2={55} y2={95} stroke={Colors.text} strokeWidth={3} strokeLinecap="round" />
        </Svg>
      </Animated.View>
    </View>
  );
}
