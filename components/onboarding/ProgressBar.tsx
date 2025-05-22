import React from "react";
import { View, Dimensions } from "react-native";

interface ProgressBarProps {
  steps: { label: string; field: string }[];
  currentStep: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ steps, currentStep }) => {
  const { width } = Dimensions.get("window");

  return (
    <View className="flex-row justify-center gap-x-2 mt-10">
      {steps.map((_, i) => (
        <View
          key={i}
          className={`h-1 rounded-full ${i <= currentStep ? "bg-orange-500" : "bg-orange-200"}`}
          style={{ width: width / (steps.length + 2) }}
        />
      ))}
    </View>
  );
};
