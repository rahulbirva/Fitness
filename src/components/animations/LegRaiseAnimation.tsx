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

export function LegRaiseAnimation({ width = 240, height = 150 }: { width?: number; height?: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1900, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, []);

  const animatedLegsStyle = useAnimatedStyle(() => {
    // Legs rotate from flat (0 deg) to vertical (-75 deg) pivoting at hip (125, 116)
    const rotate = interpolate(progress.value, [0, 1], [0, -75]);
    return {
      transform: [
        { translateX: 125 },
        { translateY: 116 },
        { rotate: `${rotate}deg` },
        { translateX: -125 },
        { translateY: -116 },
      ],
    };
  });

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={width} height={height} style={{ position: 'absolute' }}>
        {/* Floor */}
        <Line x1={20} y1={120} x2={width - 20} y2={120} stroke={Colors.borderStrong} strokeWidth={2} />
        {/* Head */}
        <Circle cx={45} cy={110} r={12} stroke={Colors.text} strokeWidth={3} fill={Colors.background} />
        {/* Flat torso & back pressed into floor */}
        <Line x1={55} y1={116} x2={125} y2={116} stroke={Colors.text} strokeWidth={4} strokeLinecap="round" />
      </Svg>

      <Animated.View style={[{ width, height }, animatedLegsStyle]}>
        <Svg width={width} height={height}>
          {/* Extended straight legs from hips (125, 116) to feet (205, 116) */}
          <Line x1={125} y1={116} x2={205} y2={116} stroke={Colors.accent} strokeWidth={4} strokeLinecap="round" />
          <Circle cx={205} cy={116} r={4.5} fill={Colors.text} />
        </Svg>
      </Animated.View>
    </View>
  );
}
