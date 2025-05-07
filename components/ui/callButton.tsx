import { useEffect, useState } from "react";
import { Alert, Pressable, Text } from "react-native";
import { useTwilio } from "~/lib/hooks/useTwilio";

export default function CallButton() {
  const { makeCall } = useTwilio("user");

  return (
    <Pressable
      onPress={() => makeCall("+61400123456")}
      style={({ pressed }) => [
        {
          padding: 16,
          borderRadius: 8,
          backgroundColor: pressed ? "#ff6961" : "#4CAF50", // red-ish when pressed, green when idle
        },
      ]}
    >
      <Text style={{ color: "white", fontWeight: "bold", textAlign: "center" }}>Call Customer</Text>
    </Pressable>
  );
}
