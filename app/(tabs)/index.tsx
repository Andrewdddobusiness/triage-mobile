import React from "react";
import { View, ScrollView, Text, Pressable, Image, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Bot, Clock, Wrench, DollarSign, Phone, MessageSquare } from "lucide-react-native";
import { router } from "expo-router";

// Mock data - in real app this would come from your backend
const MOCK_REQUESTS = [
  {
    id: "1",
    customerName: "John Smith",
    phoneNumber: "+61 400 123 456",
    callTime: "2024-03-20T10:30:00",
    projectSummary: "Kitchen renovation project. Customer is looking for a complete remodel with modern appliances.",
    budget: "$25,000",
    timeline: "Flexible",
    location: "Melbourne, VIC",
    status: "New",
    projectType: "Kitchen Renovation",
    botTranscript: "Bot collected requirements and budget details. Customer prefers communication via phone.",
    unread: true,
  },
  {
    id: "2",
    customerName: "Sarah Wilson",
    phoneNumber: "+61 400 789 012",
    callTime: "2024-03-20T09:15:00",
    projectSummary: "Bathroom remodeling with focus on accessibility features for elderly parents.",
    budget: "$15,000",
    timeline: "Within 2 months",
    location: "Sydney, NSW",
    status: "New",
    projectType: "Bathroom Remodel",
    botTranscript: "Customer needs urgent consultation. Specified accessibility requirements.",
    unread: true,
  },
  {
    id: "3",
    customerName: "Mike Brown",
    phoneNumber: "+61 400 345 678",
    callTime: "2024-03-19T16:45:00",
    projectSummary: "Deck extension and outdoor kitchen installation.",
    budget: "$20,000",
    timeline: "3-4 weeks",
    location: "Brisbane, QLD",
    status: "New",
    projectType: "Outdoor Construction",
    botTranscript: "Customer wants to discuss material options and timeline flexibility.",
    unread: false,
  },
];

export default function InboxScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate a refresh - in real app, fetch new requests
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) {
      return "Just now";
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleRequestPress = (requestId: string) => {
    router.push({
      pathname: "/request/[id]",
      params: { id: requestId },
    });
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingBottom: insets.bottom,
      }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View className="p-4 bg-blue-50 border-b border-blue-100">
        <Text className="text-blue-800 font-medium">AI Bot-Handled Requests</Text>
        <Text className="text-blue-600 text-sm mt-1">
          These are new project requests captured by your AI assistant when you were unavailable
        </Text>
      </View>

      {MOCK_REQUESTS.map((request) => (
        <Pressable
          key={request.id}
          className="bg-white p-4 border-b border-gray-100"
          onPress={() => handleRequestPress(request.id)}
        >
          <View className="flex-row items-start">
            <View className="relative">
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
                <Bot size={24} color="#0a7ea4" />
              </View>
              {request.unread && <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />}
            </View>

            <View className="flex-1 ml-3">
              <View className="flex-row items-center justify-between">
                <Text className="font-semibold text-base">{request.customerName}</Text>
                <Text className="text-xs text-gray-500">{formatDate(request.callTime)}</Text>
              </View>

              <View className="flex-row items-center mt-1">
                <Phone size={12} color="#64748b" />
                <Text className="text-xs text-gray-600 ml-1">{request.phoneNumber}</Text>
              </View>

              <Text className="text-gray-600 text-sm mt-2" numberOfLines={2}>
                {request.projectSummary}
              </Text>

              <View className="flex-row mt-2 space-x-4">
                <View className="flex-row items-center">
                  <Wrench size={14} color="#64748b" />
                  <Text className="ml-1 text-xs text-gray-600">{request.projectType}</Text>
                </View>
                <View className="flex-row items-center">
                  <DollarSign size={14} color="#64748b" />
                  <Text className="ml-1 text-xs text-gray-600">{request.budget}</Text>
                </View>
                <View className="flex-row items-center">
                  <Clock size={14} color="#64748b" />
                  <Text className="ml-1 text-xs text-gray-600">{request.timeline}</Text>
                </View>
              </View>
            </View>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}
