import React, { useEffect } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bot, Phone, MapPin, Calendar, Clock, Wrench, DollarSign, ArrowLeft, MessageSquare } from "lucide-react-native";
import { useCustomerInquiries } from "../stores/customerInquiries";

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams();
  const { selectedInquiry, selectInquiry, inquiries, isLoading } = useCustomerInquiries();

  useEffect(() => {
    // Find and select the inquiry when the component mounts
    const inquiry = inquiries.find((inq) => inq.id === id);
    if (inquiry) {
      selectInquiry(inquiry);
    }
  }, [id, inquiries]);

  if (isLoading || !selectedInquiry) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "Not specified";
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Not specified";
    return new Date(date).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Request Details",
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="mr-4">
              <ArrowLeft size={24} color="#000" />
            </Pressable>
          ),
        }}
      />
      <View className="flex-1 bg-gray-50">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingBottom: 100,
          }}
        >
          {/* Customer Info Section */}
          <View className="bg-white p-4 mb-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-semibold">{selectedInquiry.name}</Text>
              <View className="bg-blue-100 px-2 py-1 rounded">
                <Text className="text-blue-800 text-sm capitalize">{selectedInquiry.status}</Text>
              </View>
            </View>

            <View className="flex-row items-center mt-2">
              <Phone size={16} color="#64748b" />
              <Text className="text-gray-600 ml-2">{selectedInquiry.phone}</Text>
            </View>

            {selectedInquiry.email && (
              <View className="flex-row items-center mt-2">
                <MapPin size={16} color="#64748b" />
                <Text className="text-gray-600 ml-2">{selectedInquiry.email}</Text>
              </View>
            )}
          </View>

          {/* Project Details Section */}
          <View className="bg-white p-4 mb-2">
            <Text className="text-lg font-semibold mb-3">Project Details</Text>

            <View className="flex-row items-center mb-2">
              <Calendar size={16} color="#64748b" />
              <Text className="text-gray-600 ml-2">Inquiry Date: {formatDate(selectedInquiry.inquiry_date)}</Text>
            </View>

            <View className="flex-row items-center mb-2">
              <DollarSign size={16} color="#64748b" />
              <Text className="text-gray-600 ml-2">Budget: {formatCurrency(selectedInquiry.budget)}</Text>
            </View>

            <View className="flex-row items-center mb-3">
              <Clock size={16} color="#64748b" />
              <Text className="text-gray-600 ml-2">
                Preferred Date: {formatDate(selectedInquiry.preferred_service_date)}
              </Text>
            </View>

            <Text className="text-gray-600">{selectedInquiry.job_description || "No description provided"}</Text>
          </View>

          {/* Recording Section (if available) */}
          {selectedInquiry.call_sid && (
            <View className="bg-white p-4 mb-2">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-semibold">Call Recording</Text>
                <Bot size={20} color="#0a7ea4" />
              </View>
              <Text className="text-gray-600">Call recording available</Text>
            </View>
          )}
        </ScrollView>

        {/* Fixed Bottom Actions */}
        <SafeAreaView edges={["bottom"]} className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200">
          <View className="p-2">
            <View className="flex-row">
              <Pressable
                className="flex-1 bg-blue-500 py-3 px-4 rounded-full mr-2 flex-row items-center justify-center"
                onPress={() => router.push(`/request/${id}/messages`)}
              >
                <MessageSquare size={20} color="white" />
                <Text className="text-white font-medium ml-2">Message Customer</Text>
              </Pressable>
              <Pressable
                className="flex-1 bg-green-500 py-3 px-4 rounded-full flex-row items-center justify-center"
                onPress={() => console.log("Call customer")}
              >
                <Phone size={20} color="white" />
                <Text className="text-white font-medium ml-2">Call Customer</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </>
  );
}
