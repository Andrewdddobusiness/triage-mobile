import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "~/components/ui/text";
import { useRouter } from "expo-router";

export default function SummaryScreen() {
  const router = useRouter();

  // Get data from global state or context
  const data = {
    assistantName: "Kai",
    greeting: "Hi! This is Kai, how can I help you today?",
    phoneNumber: "+61 412 345 678",
  };

  const handleFinish = async () => {
    try {
      // API calls to:
      // 1. Create Vapi assistant
      // 2. Save to service_provider_assistants table
      // 3. Link Twilio number
      router.replace("./assignPhoneNumber");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View className="flex-1 bg-orange-50 pt-20 px-4">
      <Text className="text-3xl font-extrabold text-orange-500 mb-4">Ready to Go!</Text>
      <Text className="text-lg text-orange-500 mb-8">Here's a summary of your AI secretary setup.</Text>

      <View className="gap-y-4">
        <View className="border border-orange-200 bg-orange-50 rounded-xl p-4">
          <Text className="font-bold text-orange-500 mb-1">Assistant Name</Text>
          <Text className="text-orange-900">{data.assistantName}</Text>
        </View>

        {/* <View className="border border-orange-200 bg-orange-50 rounded-xl p-4">
          <Text className="font-bold text-orange-500 mb-1">Greeting Message</Text>
          <Text className="text-orange-900">{data.greeting}</Text>
        </View> */}

        <View className="border border-orange-200 bg-orange-50 rounded-xl p-4">
          <Text className="font-bold text-orange-500 mb-1">Phone Number</Text>
          <Text className="text-orange-900">{data.phoneNumber}</Text>
        </View>
      </View>

      {/* Bottom Button */}
      <View className="absolute bottom-8 left-0 right-0 px-4">
        <TouchableOpacity onPress={handleFinish} className="w-full bg-orange-500 py-4 rounded-full items-center">
          <Text className="text-white text-base font-semibold">Finish Setup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
