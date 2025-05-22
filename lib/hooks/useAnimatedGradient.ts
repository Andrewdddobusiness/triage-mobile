import { useSharedValue, useAnimatedStyle, interpolateColor } from "react-native-reanimated";

export const useAnimatedGradient = (gradientColors: string[][]) => {
  const transition = useSharedValue(1);
  const colorTransition = useSharedValue(0);

  // Animated style for content opacity and transform
  const animatedStyles = useAnimatedStyle(() => ({
    opacity: transition.value,
    transform: [
      {
        translateX: 0,
      },
    ],
  }));

  // Animated background style
  const animatedBackgroundStyle = useAnimatedStyle(() => {
    // Interpolate between the current step colors and the next step colors
    const backgroundColor1 = interpolateColor(
      colorTransition.value,
      [0, 1, 2, 3, 4, 5],
      [
        gradientColors[0][0],
        gradientColors[1][0],
        gradientColors[2][0],
        gradientColors[3][0],
        gradientColors[4][0],
        gradientColors[5][0],
      ]
    );

    const backgroundColor2 = interpolateColor(
      colorTransition.value,
      [0, 1, 2, 3, 4, 5],
      [
        gradientColors[0][1],
        gradientColors[1][1],
        gradientColors[2][1],
        gradientColors[3][1],
        gradientColors[4][1],
        gradientColors[5][1],
      ]
    );

    const backgroundColor3 = interpolateColor(
      colorTransition.value,
      [0, 1, 2, 3, 4, 5],
      [
        gradientColors[0][2],
        gradientColors[1][2],
        gradientColors[2][2],
        gradientColors[3][2],
        gradientColors[4][2],
        gradientColors[5][2],
      ]
    );

    return {
      backgroundColor: backgroundColor1,
      // Return the colors in the expected format
      backgroundColors: [backgroundColor1, backgroundColor2, backgroundColor3] as readonly [string, string, string],
    };
  });

  return {
    transition,
    colorTransition,
    animatedStyles,
    animatedBackgroundStyle,
  };
};
