import React from "react";
import { View, Image } from "react-native";
import { Text } from "~/components/ui/text";

export function SlideTwo() {
  return (
    <View className="items-center justify-center w-full px-4">
      <Text className="text-white text-2xl font-semibold text-center mb-2">Never miss a message</Text>
      <Text className="text-white text-base text-center opacity-80">
        All customer inquiries — calls, texts, and voicemails — in one clean, organized inbox.
      </Text>
      <Image source={require("~/assets/images/welcome/slide2.png")} className="w-96 h-[400px]" resizeMode="center" />
    </View>
  );
}
