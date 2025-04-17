import { useEffect, useState } from "react";
import { Alert, Pressable, Text } from "react-native";
import { useTwilio } from "~/lib/hooks/useTwilio";

export default function CallButton() {
  const { makeCall } = useTwilio("user");

  return (
    <Pressable onPress={() => makeCall("+61400123456")}>
      <Text>Call Customer</Text>
    </Pressable>
  );
}
