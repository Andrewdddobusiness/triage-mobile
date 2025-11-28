import React from "react";
import { TouchableOpacity, View, Platform } from "react-native";
import { Text } from "./text";
import { ChevronRight } from "lucide-react-native";
import { palette, radii, shadows } from "~/lib/theme";
import { haptics } from "~/lib/utils/haptics";

interface ProfileActionButtonProps {
  label: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  variant?: "default" | "destructive";
}

export function ProfileActionButton({ label, onPress, icon, variant = "default" }: ProfileActionButtonProps) {
  const activeBg = "rgba(254, 136, 90, 0.24)";
  const activeBorder = "rgba(254, 136, 90, 0.5)";

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => haptics.impact()}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        backgroundColor: palette.surface,
        padding: 16,
        borderRadius: radii.card,
        borderWidth: 1,
        borderColor: palette.border,
        ...shadows.card,
      }}
      // Provide manual highlight color on iOS via overlay
      className={Platform.OS === "ios" ? "ios-pressable" : undefined}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          {icon}
          <Text className={variant === "destructive" ? "text-[#ef4444]" : "text-[#111827]"}>{label}</Text>
        </View>
        <ChevronRight size={20} color={variant === "destructive" ? palette.danger : "#9ca3af"} />
      </View>
    </TouchableOpacity>
  );
}
