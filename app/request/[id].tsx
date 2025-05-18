// /app/request/[id].ts - Updated with Hardcoded Call Button Functionality

import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Clipboard, Alert } from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MapPin, ArrowLeft, Copy, Check } from "lucide-react-native";
import { useCustomerInquiries } from "../../stores/customerInquiries";

import Icon6 from "@expo/vector-icons/FontAwesome6";
import IconM from "@expo/vector-icons/MaterialCommunityIcons";
import IconEn from "@expo/vector-icons/Entypo";

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams();
  const { selectedInquiry, selectInquiry, inquiries, isLoading } = useCustomerInquiries();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const inquiry = inquiries.find((inq) => inq.id === id);
    if (inquiry) {
      selectInquiry(inquiry);
    }
  }, [id, inquiries]);

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copiedField) {
      const timer = setTimeout(() => {
        setCopiedField(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedField]);

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

  const handleCall = () => {
    router.push(`/request/${id}/call`);
  };

  const copyToClipboard = (text: string, field: string) => {
    Clipboard.setString(text);
    setCopiedField(field);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Request",
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
              <Text className="text-3xl font-semibold">{selectedInquiry.name}</Text>
              <View className="bg-blue-100 px-2 py-1 rounded-full">
                <Text className="text-blue-800 text-base capitalize">{selectedInquiry.status}</Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between mt-3">
              <View className="flex-row items-center flex-1">
                <Icon6 name="phone" size={18} color={"#fe885a"} />
                <Text className="text-gray-600 ml-2 text-lg">{selectedInquiry.phone}</Text>
              </View>
              <Pressable onPress={() => copyToClipboard(selectedInquiry.phone, "Phone number")} className="p-2">
                {copiedField === "Phone number" ? (
                  <Check size={18} color="#22c55e" />
                ) : (
                  <Copy size={18} color="#64748b" />
                )}
              </Pressable>
            </View>

            {selectedInquiry.email && (
              <View className="flex-row items-center justify-between mt-1">
                <View className="flex-row items-center flex-1">
                  <IconM name="email" size={20} color="#fe885a" />
                  <Text className="text-gray-600 ml-2 text-lg">{selectedInquiry.email}</Text>
                </View>
                <Pressable
                  onPress={() => (selectedInquiry.email ? copyToClipboard(selectedInquiry.email, "Email") : null)}
                  className="p-2"
                >
                  {copiedField === "Email" ? <Check size={18} color="#22c55e" /> : <Copy size={18} color="#64748b" />}
                </Pressable>
              </View>
            )}
            {selectedInquiry.location && (
              <View className="flex-row items-center justify-between mt-1">
                <View className="flex-row items-center flex-1">
                  <Icon6 name="map" size={18} color="#fe885a" />
                  <Text className="text-gray-600 ml-2 text-lg">{selectedInquiry.location}</Text>
                </View>
                <Pressable
                  onPress={() =>
                    selectedInquiry.location ? copyToClipboard(selectedInquiry.location, "Address") : null
                  }
                  className="p-2"
                >
                  {copiedField === "Address" ? <Check size={18} color="#22c55e" /> : <Copy size={18} color="#64748b" />}
                </Pressable>
              </View>
            )}
          </View>

          {/* Project Details Section */}
          <View className="bg-white p-4 mb-2">
            <Text className="text-xl font-semibold mb-3">Details</Text>

            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Icon6 name="calendar-days" size={18} color="#fe885a" />
                <Text className="text-gray-600 ml-2 text-lg">Called On:</Text>
              </View>
              <Text className="text-gray-600 text-lg">{formatDate(selectedInquiry.inquiry_date)}</Text>
            </View>

            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Icon6 name="clock" size={18} color="#fe885a" />
                <Text className="text-gray-600 ml-2 text-lg">Preferred Service Date:</Text>
              </View>
              <Text className="text-gray-600 text-lg">{formatDate(selectedInquiry.preferred_service_date)}</Text>
            </View>

            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Icon6 name="dollar-sign" size={18} color="#fe885a" />
                <Text className="text-gray-600 ml-2 text-lg">Budget:</Text>
              </View>
              <Text className="text-gray-600 text-lg">{formatCurrency(selectedInquiry.budget)}</Text>
            </View>
          </View>

          {/* Project Details Section */}
          <View className="bg-white p-4 mb-2">
            <Text className="text-xl font-semibold mb-3">Description</Text>

            <Text className="text-gray-600 text-lg">
              {selectedInquiry.job_description || "No description provided"}
            </Text>
          </View>

          {/* Recording Section (if available) */}
          {selectedInquiry.call_sid && (
            <View className="bg-white p-4 mb-2">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-xl font-semibold">Call Recording</Text>
                <Icon6 name="robot" size={18} color={"#fe885a"} />
              </View>
              <Text className="text-gray-600 text-lg">Call recording available</Text>
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
                <IconEn name="message" size={24} color={"white"} />
                <Text className="text-white font-medium ml-2 text-lg">Message Customer</Text>
              </Pressable>
              <Pressable
                onPress={handleCall}
                className="flex-1 py-3 px-4 rounded-full flex-row items-center justify-center bg-green-500 group-pressed:bg-green-600"
              >
                <Icon6 name="phone" size={18} color={"white"} />
                <Text className="text-white font-medium ml-2 text-lg">Call Customer</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </>
  );
}
