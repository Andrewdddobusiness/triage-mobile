import React, { useState } from "react";
import { View, Image, Dimensions, Animated, TouchableOpacity } from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function WelcomeScreen() {
  const router = useRouter();
  const { width } = Dimensions.get("window");
  const [nextScale] = useState(new Animated.Value(1));

  return (
    <View className="flex-1 bg-orange-50 px-4 justify-center items-center">
      {/* <Image
        source={require("~/assets/images/ai-secretary-avatar.png")}
        className="w-48 h-48 mb-8"
        resizeMode="contain"
      /> */}
      <Text className="text-3xl font-extrabold text-orange-500 text-center mb-4">
        Want your own AI assistant to handle calls for you?
      </Text>
      <Text className="text-lg text-orange-500 text-center mb-8">
        Let's set up your personal AI assistant to manage your incoming calls.
      </Text>

      <Animated.View style={{ transform: [{ scale: nextScale }] }}>
        <LinearGradient
          colors={["#fe885a", "#ffb351"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 9999,
            padding: 2,
            width: width - 48,
            alignSelf: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => router.push("./presets")}
            activeOpacity={0.8}
            style={{
              borderRadius: 9999,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 16,
              width: "100%",
            }}
          >
            <Text className="text-white font-semibold text-center">Get Started</Text>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}
