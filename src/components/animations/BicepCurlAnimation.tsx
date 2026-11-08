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

export function BicepCurlAnimation({ width = 180, height = 180 }: { width?: number; height?: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, []);

  const animatedForearmStyle = useAnimatedStyle(() => {
    const rotate = interpolate(progress.value, [0, 1], [0, -100]);
    return {
      transform: [
        { translateX: 105 },
        { translateY: 95 },
        { rotate: `${rotate}deg` },
        { translateX: -105 },
        { translateY: -95 },
      ],
    };
  });

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={width} height={height} style={{ position: 'absolute' }}>
        {/* Floor */}
        <Line x1={20} y1={165} x2={width - 20} y2={165} stroke={Colors.borderStrong} strokeWidth={2} />
        {/* Head */}
        <Circle cx={85} cy={35} r={12} stroke={Colors.text} strokeWidth={3} fill={Colors.background} />
        {/* Torso */}
        <Line x1={85} y1={47} x2={85} y2={110} stroke={Colors.text} strokeWidth={4} strokeLinecap="round" />
        {/* Legs */}
        <Line x1={85} y1={110} x2={70} y2={165} stroke={Colors.text} strokeWidth={3.5} strokeLinecap="round" />
        <Line x1={85} y1={110} x2={100} y2={165} stroke={Colors.text} strokeWidth={3.5} strokeLinecap="round" />
        {/* Pinned upper arm from shoulder to elbow */}
        <Line x1={85} y1={62} x2={105} y2={95} stroke={Colors.text} strokeWidth={3.5} strokeLinecap="round" />
      </Svg>

      <Animated.View style={[{ width, height }, animatedForearmStyle]}>
        <Svg width={width} height={height}>
          {/* Forearm from elbow (105, 95) down to wrist (105, 135) */}
          <Line x1={105} y1={95} x2={105} y2={135} stroke={Colors.accent} strokeWidth={3.5} strokeLinecap="round" />
          {/* Dumbbell in hand */}
          <Circle cx={105} cy={135} r={4} fill={Colors.text} />
          <Rect x={98} y={133} width={14} height={4} fill={Colors.text} rx={1} />
        </Svg>
      </Animated.View>
    </View>
  );
}
