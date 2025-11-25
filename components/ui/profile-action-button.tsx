import React from "react";
import { Pressable, View } from "react-native";
import { Text } from "./text";
import { ChevronRight } from "lucide-react-native";
import { palette, radii, shadows } from "~/lib/theme";

interface ProfileActionButtonProps {
  label: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  variant?: "default" | "destructive";
}

export function ProfileActionButton({ label, onPress, icon, variant = "default" }: ProfileActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          backgroundColor: palette.surface,
          padding: 16,
          borderRadius: radii.card,
          borderWidth: 1,
          borderColor: palette.border,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        shadows.card,
      ]}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          {icon}
          <Text className={variant === "destructive" ? "text-[#ef4444]" : "text-[#111827]"}>{label}</Text>
        </View>
        <ChevronRight size={20} color={variant === "destructive" ? palette.danger : "#9ca3af"} />
      </View>
    </Pressable>
  );
}
