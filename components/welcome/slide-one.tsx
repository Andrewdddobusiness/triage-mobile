import React from "react";
import { View, Image } from "react-native";
import { Text } from "~/components/ui/text";

export function SlideOne() {
  return (
    <View className="items-center justify-center w-full px-4">
      {/* <Image source={require("~/assets/images/ai-secretary.png")} className="w-52 h-52 mb-6" resizeMode="contain" /> */}
      <Text className="text-white text-2xl font-semibold text-center mb-2">Let AI answer your calls</Text>
      <Text className="text-white text-base text-center opacity-80">
        When you're unavailable, our smart AI assistant captures every inquiry and turns missed calls into booked jobs.
      </Text>
      <Image source={require("~/assets/images/welcome/slide1.png")} className="w-96 h-96" resizeMode="center" />
    </View>
  );
}
