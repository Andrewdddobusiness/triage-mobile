import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import Animated from "react-native-reanimated";

interface OnboardingStepProps {
  label: string;
  description: string;
  animatedStyles: any;
  children: React.ReactNode;
  formError?: string;
}

export const OnboardingStep: React.FC<OnboardingStepProps> = ({
  label,
  description,
  animatedStyles,
  children,
  formError,
}) => {
  return (
    <Animated.View style={[animatedStyles]} className="flex-1 w-full mt-10 gap-y-6 px-4">
      <View className="gap-y-1 px-2">
        <Text className="text-2xl font-extrabold text-orange-500">{label}</Text>
        <Text className="text-orange-500 text-base">{description}</Text>
      </View>
      <View className="px-2">{children}</View>
      {formError ? <Text className="text-orange-500 text-sm text-center mt-2">{formError}</Text> : null}
    </Animated.View>
  );
};
