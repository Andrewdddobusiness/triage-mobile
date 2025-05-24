import React from "react";
import { View } from "react-native";
import { Text } from "./text";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Octicons } from "@expo/vector-icons";

interface HeaderProps {
  title: string;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
}

export function Header({ title, onSearchPress, onNotificationPress }: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-4 py-6">
        {/* Left - Search */}
        {/* <Pressable onPress={onSearchPress}>
          <Search size={24} color="#64748b" />
        </Pressable> */}

        {/* Center - Title */}
        <View className="absolute left-0 right-0 flex-row justify-center ">
          <Text className="text-xl font-bold text-[#fe885a]">{title}</Text>
        </View>

        {/* Right - Notifications */}
        {/* <Pressable onPress={onNotificationPress}>
          <Octicons name="bell-fill" size={24} color="#fe885a" />
        </Pressable> */}
      </View>
    </View>
  );
}
