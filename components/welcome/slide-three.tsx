import React from "react";
import { View, Image } from "react-native";
import { Text } from "~/components/ui/text";

export function SlideThree() {
  return (
    <View className="items-center justify-center w-full">
      <Text className="text-white text-2xl font-semibold text-center mb-2">Focus on your best leads</Text>
      <Text className="text-white text-base text-center opacity-80">
        Quickly follow up on high-value inquiries. We highlight the ones that matter most.
      </Text>
      <Image source={require("~/assets/images/welcome/slide3.png")} className="w-full h-96" resizeMode="contain" />
    </View>
  );
}
