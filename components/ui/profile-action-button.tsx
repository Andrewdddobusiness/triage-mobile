import React from "react";
import { Pressable, View } from "react-native";
import { Text } from "./text";
import { ChevronRight } from "lucide-react-native";

interface ProfileActionButtonProps {
  label: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  variant?: "default" | "destructive";
}

export function ProfileActionButton({ label, onPress, icon, variant = "default" }: ProfileActionButtonProps) {
  return (
    <Pressable onPress={onPress}>
      <View className="flex-row items-center justify-between p-4 bg-white">
        <View className="flex-row items-center gap-3">
          {icon}
          <Text className={variant === "destructive" ? "text-base text-destructive" : "text-base"}>{label}</Text>
        </View>
        <ChevronRight size={20} color={variant === "destructive" ? "#ef4444" : "#64748b"} />
      </View>
    </Pressable>
  );
}
