import React from "react";
import { View, ScrollView, Switch, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Phone, Bot, PhoneIncoming, PhoneMissed, PhoneOutgoing } from "lucide-react-native";

// Mock data - in real app this would come from your backend
const MOCK_CALLS = [
  {
    id: "1",
    type: "incoming",
    number: "+61 400 123 456",
    name: "John Smith",
    timestamp: "2024-03-20T10:30:00",
    duration: "5:23",
    answeredByBot: true,
  },
  {
    id: "2",
    type: "missed",
    number: "+61 400 789 012",
    name: "Sarah Wilson",
    timestamp: "2024-03-20T09:15:00",
    duration: null,
    answeredByBot: false,
  },
  {
    id: "3",
    type: "outgoing",
    number: "+61 400 345 678",
    name: "Mike Brown",
    timestamp: "2024-03-19T16:45:00",
    duration: "2:15",
    answeredByBot: false,
  },
];

export default function CallsScreen() {
  const insets = useSafeAreaInsets();
  const [botEnabled, setBotEnabled] = React.useState(true);

  const getCallIcon = (type: string, size: number, color: string) => {
    switch (type) {
      case "incoming":
        return <PhoneIncoming size={size} color={color} />;
      case "outgoing":
        return <PhoneOutgoing size={size} color={color} />;
      case "missed":
        return <PhoneMissed size={size} color="#ef4444" />;
      default:
        return <Phone size={size} color={color} />;
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <View className="flex-1 bg-background">
      {/* Bot Toggle Section */}
      <View className="bg-white p-4 flex-row items-center justify-between border-b border-gray-200">
        <View className="flex-row items-center">
          <Bot size={24} color="#0a7ea4" />
          <View className="ml-3">
            <Text className="font-semibold text-base">Auto-Answer Bot</Text>
            <Text className="text-sm text-gray-500">Let AI handle your incoming calls</Text>
          </View>
        </View>
        <Switch value={botEnabled} onValueChange={setBotEnabled} trackColor={{ false: "#767577", true: "#0a7ea4" }} />
      </View>

      {/* Calls List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: insets.bottom,
        }}
      >
        {MOCK_CALLS.map((call) => (
          <Pressable
            key={call.id}
            className="bg-white p-4 border-b border-gray-100 flex-row items-center"
            onPress={() => console.log(`Call pressed: ${call.id}`)}
          >
            <View className="mr-3">{getCallIcon(call.type, 24, "#64748b")}</View>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="font-semibold">{call.name}</Text>
                {call.answeredByBot && (
                  <View className="ml-2 bg-blue-100 px-2 py-0.5 rounded-full">
                    <Text className="text-xs text-blue-800">Bot</Text>
                  </View>
                )}
              </View>
              <Text className="text-gray-500">{call.number}</Text>
              <View className="flex-row items-center mt-1">
                <Text className="text-xs text-gray-400">{formatDate(call.timestamp)}</Text>
                {call.duration && <Text className="text-xs text-gray-400 ml-2">• {call.duration}</Text>}
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
