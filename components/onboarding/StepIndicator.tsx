import React from "react";
import { View, Dimensions } from "react-native";

interface StepIndicatorProps {
  steps: number;
  currentStep: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  const { width } = Dimensions.get("window");

  return (
    <View className="flex-row justify-center gap-x-2 mt-10">
      {Array.from({ length: steps }).map((_, i) => (
        <View
          key={i}
          className={`h-1 rounded-full ${i <= currentStep ? "bg-orange-500" : "bg-orange-200"}`}
          style={{ width: width / (steps + 2) }}
        />
      ))}
    </View>
  );
};
