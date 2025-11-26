import React, { useState } from "react";
import { View, Dimensions, Animated } from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { useRouter } from "expo-router";
import { palette } from "~/lib/theme";

export default function WelcomeScreen() {
  const router = useRouter();
  const { width } = Dimensions.get("window");
  const [nextScale] = useState(new Animated.Value(1));

  return (
    <View className="flex-1 px-4 justify-center items-center" style={{ backgroundColor: palette.surfaceMuted }}>
      {/* <Image
        source={require("~/assets/images/ai-secretary-avatar.png")}
        className="w-48 h-48 mb-8"
        resizeMode="contain"
      /> */}
      <Text className="text-3xl font-extrabold text-center mb-4" style={{ color: palette.primary }}>
        Want your own AI assistant to handle calls for you?
      </Text>
      <Text className="text-lg text-center mb-8" style={{ color: palette.textMuted }}>
        Let's set up your personal AI assistant to manage your incoming calls.
      </Text>

      <Animated.View style={{ transform: [{ scale: nextScale }], width: width - 48 }}>
        <Button onPress={() => router.push("./presets")}>Get Started</Button>
      </Animated.View>
    </View>
  );
}
