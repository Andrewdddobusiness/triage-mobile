import React from "react";
import { View, Text, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Send, ArrowLeft } from "lucide-react-native";

// Mock data - in real app this would come from your backend
const MOCK_MESSAGES = [
  {
    id: "1",
    text: "Hi, I'm the AI assistant. I spoke with John about their kitchen renovation project.",
    sender: "bot",
    timestamp: "2024-03-20T10:30:00",
  },
  {
    id: "2",
    text: "They're looking for a complete remodel with modern appliances. Budget is flexible around $25,000.",
    sender: "bot",
    timestamp: "2024-03-20T10:31:00",
  },
];

export default function MessagesScreen() {
  const { id } = useLocalSearchParams();
  const [messages, setMessages] = React.useState(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = React.useState("");
  const scrollViewRef = React.useRef<ScrollView>(null);

  const handleSend = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        {
          id: Date.now().toString(),
          text: newMessage.trim(),
          sender: "tradie",
          timestamp: new Date().toISOString(),
        },
      ]);
      setNewMessage("");

      // Scroll to bottom after message is sent
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "John Smith",
          headerBackVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="mr-4">
              <ArrowLeft size={24} color="#000" />
            </Pressable>
          ),
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView ref={scrollViewRef} className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
          {messages.map((message) => (
            <View
              key={message.id}
              className={`mb-4 max-w-[80%] ${message.sender === "tradie" ? "self-end" : "self-start"}`}
            >
              <View className={`rounded-2xl p-3 ${message.sender === "tradie" ? "bg-blue-500" : "bg-gray-200"}`}>
                <Text className={message.sender === "tradie" ? "text-white" : "text-gray-800"}>{message.text}</Text>
              </View>
              <Text className="text-xs text-gray-500 mt-1">{formatDate(message.timestamp)}</Text>
            </View>
          ))}
        </ScrollView>

        <View className="p-4 border-t border-gray-200 bg-white">
          <View className="flex-row items-center">
            <TextInput
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-2"
              placeholder="Type a message..."
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={500}
            />
            <Pressable
              onPress={handleSend}
              disabled={!newMessage.trim()}
              className={`p-2 rounded-full ${newMessage.trim() ? "bg-blue-500" : "bg-gray-300"}`}
            >
              <Send size={20} color="white" />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
