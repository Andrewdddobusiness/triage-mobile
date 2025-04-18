import React, { useEffect } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator, RefreshControl, Platform } from "react-native";
import { router } from "expo-router";
import { useCustomerInquiries } from "~/app/stores/customerInquiries";
import { CalendarIcon, BudgetIcon, InquiryIcon } from "~/components/ui/icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function InboxScreen() {
  const { inquiries, fetchInquiries, isLoading } = useCustomerInquiries();
  const insets = useSafeAreaInsets();

  // Calculate bottom padding to account for tab bar and safe area
  const bottomPadding = Platform.select({
    ios: 85 + insets.bottom, // Tab bar height (85) + safe area
    android: 60, // Android tab bar height
    default: 60,
  });

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
          <View className="flex-row items-center">
            <InquiryIcon size={24} color="#0369a1" bgColor="#f0f9ff" />
            <Text className="text-lg font-semibold ml-2">{item.name}</Text>
          </View>
          <View className={`px-2 py-1 rounded ${statusColors.bg}`}>
            <Text className={`${statusColors.text} text-sm capitalize`}>{item.status}</Text>
          </View>
        </View>

        <View className="flex-row items-center mb-2">
          <CalendarIcon size={16} color="#64748b" />
          <Text className="text-gray-600 text-sm ml-1">Inquiry: {formatDate(item.inquiry_date)}</Text>
        </View>

        {item.budget && (
          <View className="flex-row items-center mb-2">
            <BudgetIcon size={16} color="#64748b" />
            <Text className="text-gray-600 text-sm ml-1">Budget: {formatCurrency(item.budget)}</Text>
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
    <FlatList
      data={inquiries}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{
        paddingVertical: 16,
        paddingBottom: bottomPadding,
      }}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchInquiries} />}
      ListEmptyComponent={
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-gray-500 text-lg">No inquiries found</Text>
        </View>
      }
    />
  );
}
