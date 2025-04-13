import React from "react";
import { View, Image, Pressable } from "react-native";
import { Text } from "./text";

interface TravelCardProps {
  title: string;
  description: string;
  imageUrl: string;
  username: string;
  profileImage: string;
  onPress?: () => void;
}

export function TravelCard({ title, description, imageUrl, username, profileImage, onPress }: TravelCardProps) {
  return (
    <Pressable onPress={onPress}>
      <View className="bg-white rounded-lg overflow-hidden">
        <Image source={{ uri: imageUrl }} className="w-full aspect-square" resizeMode="cover" />
        <View className="p-3">
          <Text className="font-semibold mb-1" numberOfLines={1}>
            {title}
          </Text>
          <Text className="text-xs text-muted-foreground mb-2" numberOfLines={2}>
            {description}
          </Text>

          {/* User info */}
          <View className="flex-row items-center gap-2">
            <Image source={{ uri: profileImage }} className="w-5 h-5 rounded-full" />
            <Text className="text-xs text-muted-foreground">{username}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
