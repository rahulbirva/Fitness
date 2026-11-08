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

export function LungeAnimation({ width = 200, height = 180 }: { width?: number; height?: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [0, 28]);
    return {
      transform: [{ translateY }],
    };
  });

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={width} height={height} style={{ position: 'absolute' }}>
        {/* Floor */}
        <Line x1={20} y1={160} x2={width - 20} y2={160} stroke={Colors.borderStrong} strokeWidth={2} />
        {/* Front foot */}
        <Circle cx={120} cy={158} r={5} fill={Colors.text} />
        {/* Back ball of foot */}
        <Circle cx={55} cy={158} r={4.5} fill={Colors.text} />
      </Svg>

      <Animated.View style={[{ width, height }, animatedStyle]}>
        <Svg width={width} height={height}>
          {/* Head */}
          <Circle cx={100} cy={38} r={12} stroke={Colors.text} strokeWidth={3} fill={Colors.background} />
          {/* Torso straight upright */}
          <Line x1={100} y1={50} x2={100} y2={100} stroke={Colors.text} strokeWidth={4} strokeLinecap="round" />
          {/* Hands on hips */}
          <Line x1={100} y1={65} x2={86} y2={85} stroke={Colors.text} strokeWidth={3} strokeLinecap="round" />
          <Line x1={100} y1={65} x2={114} y2={85} stroke={Colors.text} strokeWidth={3} strokeLinecap="round" />
          {/* Front leg to front foot */}
          <Line x1={100} y1={100} x2={120} y2={124} stroke={Colors.text} strokeWidth={3.5} strokeLinecap="round" />
          <Line x1={120} y1={124} x2={120} y2={158} stroke={Colors.text} strokeWidth={3.5} strokeLinecap="round" />
          {/* Rear leg to back foot */}
          <Line x1={100} y1={100} x2={72} y2={132} stroke={Colors.text} strokeWidth={3.5} strokeLinecap="round" />
          <Line x1={72} y1={132} x2={55} y2={158} stroke={Colors.text} strokeWidth={3.5} strokeLinecap="round" />
        </Svg>
      </Animated.View>
    </View>
  );
}
