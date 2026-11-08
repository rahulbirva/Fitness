import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { Colors } from '../../constants/theme';

interface AnimationProps {
  width?: number;
  height?: number;
}

export function PushupAnimation({ width = 240, height = 150 }: AnimationProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, []);

  const animatedBodyStyle = useAnimatedStyle(() => {
    // Torso pivots down from feet
    const translateY = interpolate(progress.value, [0, 1], [0, 24]);
    return {
      transform: [{ translateY }],
    };
  });

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={width} height={height} style={{ position: 'absolute' }}>
        {/* Floor baseline */}
        <Line x1={20} y1={120} x2={width - 20} y2={120} stroke={Colors.borderStrong} strokeWidth={2} />
        {/* Fixed feet anchor */}
        <Circle cx={45} cy={116} r={5} fill={Colors.text} />
        {/* Fixed hands anchor on floor */}
        <Circle cx={165} cy={118} r={5} fill={Colors.text} />
      </Svg>

      <Animated.View style={[{ width, height }, animatedBodyStyle]}>
        <Svg width={width} height={height}>
          {/* Head */}
          <Circle cx={195} cy={68} r={12} stroke={Colors.text} strokeWidth={3} fill={Colors.background} />
          {/* Torso & hips line */}
          <Line x1={45} y1={116} x2={185} y2={74} stroke={Colors.text} strokeWidth={4} strokeLinecap="round" />
          {/* Arm from shoulder down to hands */}
          <Line x1={175} y1={76} x2={165} y2={118} stroke={Colors.text} strokeWidth={3.5} strokeLinecap="round" />
        </Svg>
      </Animated.View>
    </View>
  );
}
