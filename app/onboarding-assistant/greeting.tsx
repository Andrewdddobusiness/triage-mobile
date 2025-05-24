import React from "react";
import { View, TextInput, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from "react-native";
import { Text } from "~/components/ui/text";
import { useRouter } from "expo-router";

export default function CustomizeGreetingScreen() {
  const router = useRouter();
  const [greeting, setGreeting] = React.useState("");

  // Replace this with actual selected preset from context or state
  const selectedPreset = { name: "Kai" };

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    if (!greeting.trim()) {
      // You could add validation or fallback logic here
      return alert("Please enter a greeting or continue with the default.");
    }
    router.push("./confirmation");
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-orange-50 pt-8">
      <ScrollView className="flex-1 pt-20 px-4">
        <Text className="text-3xl font-extrabold text-orange-500 mb-4">Customize Greeting</Text>
        <Text className="text-lg text-orange-500 mb-6">How should your assistant greet callers?</Text>

        <TextInput
          value={greeting}
          onChangeText={setGreeting}
          placeholder={`Hi! This is ${selectedPreset.name}, how can I help you today?`}
          className="bg-white p-4 rounded-lg mb-16 text-base"
          multiline
        />
      </ScrollView>

      {/* Bottom Buttons */}
      <View className="absolute bottom-8 left-0 right-0 px-4 py-4 bg-orange-50 border-t border-orange-200 flex-row justify-between">
        <TouchableOpacity onPress={handleBack} className="px-6 py-3 bg-gray-200 rounded-full">
          <Text className="text-gray-700 font-semibold">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleContinue} className="px-6 py-3 bg-orange-500 rounded-full">
          <Text className="text-white font-semibold">Continue</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
