import React from "react";
import { View, ActivityIndicator } from "react-native";
import { Text } from "./text";
import { Search, Bell } from "lucide-react-native";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Skeleton } from "./skeleton";

interface HeaderProps {
  title: string;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
}

export function Header({ title, onSearchPress, onNotificationPress }: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-4 py-3">
        {/* Left - Search */}
        <Pressable onPress={onSearchPress}>
          <Search size={24} color="#64748b" />
        </Pressable>

        {/* Center - Title */}
        <View className="absolute left-0 right-0 flex-row justify-center">
          <Text className="text-lg font-semibold">{title}</Text>
        </View>

        {/* Right - Notifications */}
        <Pressable onPress={onNotificationPress}>
          <Bell size={24} color="#64748b" />
        </Pressable>
      </View>
    </View>
  );
}
