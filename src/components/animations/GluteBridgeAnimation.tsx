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

export function GluteBridgeAnimation({ width = 240, height = 150 }: { width?: number; height?: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, []);

  const animatedHipsStyle = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [0, -28]);
    return {
      transform: [{ translateY }],
    };
  });

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={width} height={height} style={{ position: 'absolute' }}>
        {/* Floor */}
        <Line x1={20} y1={120} x2={width - 20} y2={120} stroke={Colors.borderStrong} strokeWidth={2} />
        {/* Head and shoulders resting on floor */}
        <Circle cx={50} cy={110} r={12} stroke={Colors.text} strokeWidth={3} fill={Colors.background} />
        <Circle cx={70} cy={118} r={5} fill={Colors.text} />
        {/* Feet on floor */}
        <Circle cx={180} cy={118} r={5} fill={Colors.text} />
      </Svg>

      <Animated.View style={[{ width, height }, animatedHipsStyle]}>
        <Svg width={width} height={height}>
          {/* Torso from shoulders (70, 118) to hips (130, 115) */}
          <Line x1={70} y1={118} x2={130} y2={112} stroke={Colors.accent} strokeWidth={4} strokeLinecap="round" />
          {/* Thighs from hips (130, 112) to knees (160, 85) */}
          <Line x1={130} y1={112} x2={160} y2={88} stroke={Colors.text} strokeWidth={3.5} strokeLinecap="round" />
          {/* Calves from knees (160, 88) down to feet (180, 118) */}
          <Line x1={160} y1={88} x2={180} y2={118} stroke={Colors.text} strokeWidth={3.5} strokeLinecap="round" />
        </Svg>
      </Animated.View>
    </View>
  );
}
