import React from "react";
import { View, ScrollView, Pressable, Alert, Linking } from "react-native";
import { Text } from "~/components/ui/text";
import { useSession } from "~/lib/auth/ctx";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Settings,
  Crown,
  RefreshCw,
  Calendar,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from "lucide-react-native";
import { router } from "expo-router";

export default function SubscriptionScreen() {
  const { hasActiveSubscription, subscriptionData, subscriptionLoading, checkSubscription, openCustomerPortal } =
    useSession();
  const insets = useSafeAreaInsets();

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600";
      case "trialing":
        return "text-blue-600";
      case "canceled":
        return "text-red-600";
      case "past_due":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle size={20} color="#16a34a" />;
      case "trialing":
        return <Calendar size={20} color="#2563eb" />;
      case "canceled":
        return <XCircle size={20} color="#dc2626" />;
      case "past_due":
        return <AlertCircle size={20} color="#ca8a04" />;
      default:
        return <AlertCircle size={20} color="#6b7280" />;
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} color="#495057" />
          </Pressable>
          <Text className="text-xl font-semibold text-[#495057]">Subscription</Text>
        </View>
      </View>

      {/* Loading State */}
      {subscriptionLoading && (
        <View className="mt-4 mx-4 bg-white rounded-xl p-6 shadow-sm">
          <View className="items-center">
            <RefreshCw size={24} color="#adb5bd" className="animate-spin" />
            <Text className="text-gray-500 mt-2">Loading subscription details...</Text>
          </View>
        </View>
      )}

      {/* Active Subscription Card */}
      {hasActiveSubscription && !subscriptionLoading && (
        <View className="mt-4 mx-4 bg-white rounded-xl p-6 shadow-sm">
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 rounded-full bg-orange-100 items-center justify-center mr-3">
              <Crown size={24} color="#fe885a" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-[#495057]">Pro Plan</Text>
              <View className="flex-row items-center mt-1">
                {getStatusIcon(subscriptionData?.status)}
                <Text className={`ml-1 font-medium capitalize ${getStatusColor(subscriptionData?.status)}`}>
                  {subscriptionData?.status || "Active"}
                </Text>
              </View>
            </View>
          </View>

          {/* Subscription Details */}
          <View className="space-y-3">
            {subscriptionData?.current_period_end && (
              <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                <Text className="text-gray-600">Next billing date</Text>
                <Text className="font-medium text-[#495057]">{formatDate(subscriptionData.current_period_end)}</Text>
              </View>
            )}

            {subscriptionData?.plan_name && (
              <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                <Text className="text-gray-600">Plan</Text>
                <Text className="font-medium text-[#495057]">{subscriptionData.plan_name}</Text>
              </View>
            )}

            {subscriptionData?.billing_cycle && (
              <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                <Text className="text-gray-600">Billing cycle</Text>
                <Text className="font-medium text-[#495057] capitalize">{subscriptionData.billing_cycle}</Text>
              </View>
            )}

            {subscriptionData?.cancel_at_period_end && (
              <View className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <View className="flex-row items-center">
                  <AlertCircle size={16} color="#ca8a04" />
                  <Text className="ml-2 text-yellow-800 font-medium">Cancellation Scheduled</Text>
                </View>
                <Text className="text-yellow-700 mt-1 text-sm">
                  Your subscription will end on {formatDate(subscriptionData.current_period_end)}
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View className="mt-6 space-y-3">
            <Pressable
              onPress={openCustomerPortal}
              className="bg-[#fe885a] rounded-lg py-3 px-4 flex-row items-center justify-center"
            >
              <Settings size={18} color="white" />
              <Text className="text-white font-medium ml-2">Manage Subscription</Text>
            </Pressable>

            <Pressable
              onPress={checkSubscription}
              className="border border-gray-300 rounded-lg mt-3 py-3 px-4 flex-row items-center justify-center"
            >
              <RefreshCw size={18} color="#6b7280" />
              <Text className="text-gray-700 font-medium ml-2">Refresh Status</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* No Subscription Card */}
      {!hasActiveSubscription && !subscriptionLoading && (
        <View className="mt-4 mx-4 bg-white rounded-xl p-6 shadow-sm">
          <View className="items-center">
            <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
              <Crown size={32} color="#adb5bd" />
            </View>
            <Text className="text-xl font-semibold text-[#495057] mb-2">No Active Plan</Text>
            <Text className="text-gray-500 text-center mb-6 leading-6">
              Subscribe to Pro to unlock AI-powered call handling, advanced analytics, and premium features.
            </Text>

            {/* Features List */}
            <View className="w-full mb-6">
              <Text className="font-semibold text-[#495057] mb-3">Pro Plan includes:</Text>
              <View className="space-y-2">
                {[
                  "AI-powered call handling",
                  "Advanced analytics & insights",
                  "Priority customer support",
                  "Custom integrations",
                ].map((feature, index) => (
                  <View key={index} className="flex-row items-center">
                    <CheckCircle size={16} color="#16a34a" />
                    <Text className="ml-2 text-gray-600">{feature}</Text>
                  </View>
                ))}
              </View>
            </View>

            <Pressable
              onPress={() => router.push("/onboarding-assistant/payment")}
              className="bg-[#fe885a] rounded-lg py-4 px-8 w-full"
            >
              <Text className="text-white font-semibold text-center text-lg">Get Pro Plan</Text>
            </Pressable>

            <Pressable
              onPress={checkSubscription}
              className="mt-3 border border-gray-300 rounded-lg py-3 px-4 flex-row items-center justify-center w-full"
            >
              <RefreshCw size={18} color="#6b7280" />
              <Text className="text-gray-700 font-medium ml-2">Refresh Status</Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
