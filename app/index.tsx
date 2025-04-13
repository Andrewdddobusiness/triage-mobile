import React, { useEffect } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import { Stack, router } from "expo-router";
import { useCustomerInquiries } from "./stores/customerInquiries";
import { Calendar, DollarSign } from "lucide-react-native";

export default function InboxScreen() {
  const { inquiries, fetchInquiries, isLoading } = useCustomerInquiries();

  useEffect(() => {
    fetchInquiries();
  }, []);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "Not specified";
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      new: { bg: "bg-blue-100", text: "text-blue-800" },
      contacted: { bg: "bg-yellow-100", text: "text-yellow-800" },
      scheduled: { bg: "bg-purple-100", text: "text-purple-800" },
      completed: { bg: "bg-green-100", text: "text-green-800" },
      cancelled: { bg: "bg-red-100", text: "text-red-800" },
    };
    return colors[status] || { bg: "bg-gray-100", text: "text-gray-800" };
  };

  const renderItem = ({ item }: { item: any }) => {
    const statusColors = getStatusColor(item.status);

    return (
      <Pressable
        onPress={() => {
          router.push(`/request/${item.id}`);
        }}
        className="bg-white mb-2 p-4 mx-4 rounded-lg shadow-sm"
      >
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-lg font-semibold flex-1 mr-2">{item.name}</Text>
          <View className={`px-2 py-1 rounded ${statusColors.bg}`}>
            <Text className={`${statusColors.text} text-sm capitalize`}>{item.status}</Text>
          </View>
        </View>

        <View className="flex-row items-center mb-2">
          <Calendar size={16} color="#64748b" className="mr-1" />
          <Text className="text-gray-600 text-sm">Inquiry: {formatDate(item.inquiry_date)}</Text>
        </View>

        {item.budget && (
          <View className="flex-row items-center mb-2">
            <DollarSign size={16} color="#64748b" className="mr-1" />
            <Text className="text-gray-600 text-sm">Budget: {formatCurrency(item.budget)}</Text>
          </View>
        )}

        {item.job_description && (
          <Text numberOfLines={2} className="text-gray-600 text-sm">
            {item.job_description}
          </Text>
        )}
      </Pressable>
    );
  };

  if (isLoading && inquiries.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Inbox",
        }}
      />
      <FlatList
        data={inquiries}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 16 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchInquiries} />}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center p-4">
            <Text className="text-gray-500 text-lg">No inquiries found</Text>
          </View>
        }
      />
    </>
  );
}
