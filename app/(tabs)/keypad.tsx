import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Phone, X, Hash } from "lucide-react-native";

export default function KeypadScreen() {
  const insets = useSafeAreaInsets();
  const [number, setNumber] = React.useState("");

  const handlePress = (digit: string) => {
    if (number.length < 15) {
      setNumber((prev) => prev + digit);
    }
  };

  const handleDelete = () => {
    setNumber((prev) => prev.slice(0, -1));
  };

  const handleCall = () => {
    console.log(`Calling ${number}`);
    // Implement actual call functionality
  };

  const renderKey = (digit: string | number, letters?: string) => (
    <Pressable className="w-24 h-24 items-center justify-center" onPress={() => handlePress(digit.toString())}>
      <Text className="text-3xl text-gray-800">{digit}</Text>
      {letters && <Text className="text-xs text-gray-500 mt-1">{letters}</Text>}
    </Pressable>
  );

  return (
    <View className="flex-1 bg-background" style={{ paddingBottom: insets.bottom }}>
      {/* Number Display */}
      <View className="h-32 justify-end items-center px-6 py-4">
        <Text className="text-4xl text-gray-800">{number || "Enter a number"}</Text>
      </View>

      {/* Keypad */}
      <View className="px-6 py-4">
        <View className="flex-row justify-around mb-4">
          {renderKey(1, "     ")}
          {renderKey(2, "ABC")}
          {renderKey(3, "DEF")}
        </View>
        <View className="flex-row justify-around mb-4">
          {renderKey(4, "GHI")}
          {renderKey(5, "JKL")}
          {renderKey(6, "MNO")}
        </View>
        <View className="flex-row justify-around mb-4">
          {renderKey(7, "PQRS")}
          {renderKey(8, "TUV")}
          {renderKey(9, "WXYZ")}
        </View>
        <View className="flex-row justify-around mb-4">
          {renderKey("*")}
          {renderKey(0, "+")}
          {renderKey("#")}
        </View>

        {/* Call Button Row */}
        <View className="flex-row justify-around mt-4">
          <Pressable className="w-24 h-24 items-center justify-center" onPress={handleDelete}>
            <X size={28} color="#64748b" />
          </Pressable>
          <Pressable
            className="w-24 h-24 items-center justify-center bg-green-500 rounded-full"
            onPress={handleCall}
            disabled={!number}
          >
            <Phone size={28} color="white" />
          </Pressable>
          <View className="w-24 h-24" />
        </View>
      </View>
    </View>
  );
}
