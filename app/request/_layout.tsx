import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function RequestLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: "white",
        },
        contentStyle: {
          backgroundColor: "#f8fafc", // light gray background
        },
      }}
    />
  );
}
