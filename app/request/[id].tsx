// /app/request/[id].ts - Updated with Hardcoded Call Button Functionality

import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, Linking } from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MapPin, ArrowLeft, Copy, Check } from "lucide-react-native";
import { useCustomerInquiries } from "../../stores/customerInquiries";

import Icon6 from "@expo/vector-icons/FontAwesome6";
import IconM from "@expo/vector-icons/MaterialCommunityIcons";
import IconEn from "@expo/vector-icons/Entypo";
import { trackEvent } from "~/lib/utils/analytics";
import type CustomerInquiry from "~/stores/customerInquiries";
import { Button } from "~/components/ui/button";
import { copySensitiveToClipboard } from "~/lib/utils/piiClipboard";
import { maskEmail, maskPhone } from "~/lib/utils/pii";
import { useFeatureFlags } from "~/lib/providers/FeatureFlagProvider";
import { UpsellModal } from "~/components/ui/UpsellModal";
import { Loader } from "~/components/ui/loader";

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams();
  const { selectedInquiry, selectInquiry, inquiries, isLoading, updateInquiryStatus, error } = useCustomerInquiries();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [upsellVisible, setUpsellVisible] = useState(false);
  const { flags } = useFeatureFlags();
  const statusOptions: { id: CustomerInquiry["status"]; label: string }[] = [
    { id: "new", label: "New" },
    { id: "contacted", label: "Contacted" },
    { id: "scheduled", label: "Scheduled" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
  ];

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
        <Loader />
        <Text className="mt-4 text-muted-foreground">Loading...</Text>
      </View>
    );
  }

  const isPreview = !flags.telephony || flags.killSwitch;

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

  const handleCall = async () => {
    if (flags.killSwitch || !flags.telephony) {
      setUpsellVisible(true);
      trackEvent("request_call_blocked_flag", { requestId: id, reason: flags.killSwitch ? "kill_switch" : "telephony" });
      return;
    }
    if (!selectedInquiry.phone) {
      Alert.alert("No phone number", "This request does not include a phone number.");
      return;
    }
    const telUrl = `tel:${selectedInquiry.phone}`;
    trackEvent("request_call_attempt", { requestId: id });
    try {
      const canOpen = await Linking.canOpenURL(telUrl);
      if (!canOpen) {
        throw new Error("Cannot open dialer");
      }
      await Linking.openURL(telUrl);
      trackEvent("request_call_opened", { requestId: id });
    } catch (err) {
      console.error("Failed to open dialer", err);
      trackEvent("request_call_error", { requestId: id, message: (err as Error)?.message });
      Alert.alert("Unable to place call", "Please try again or call from your phone app.");
    }
  };

  const handleStatusChange = async (nextStatus: CustomerInquiry["status"]) => {
    if (!flags.killSwitch && flags.telephony === false) {
      setUpsellVisible(true);
      trackEvent("request_status_gated", { requestId: id });
      return;
    }

    if (!selectedInquiry || selectedInquiry.status === nextStatus) return;
    trackEvent("request_status_change_attempt", { requestId: id, nextStatus });
    try {
      await updateInquiryStatus(selectedInquiry.id, nextStatus);
      trackEvent("request_status_change_success", { requestId: id, nextStatus });
    } catch (err) {
      trackEvent("request_status_change_error", { requestId: id, nextStatus, message: (err as Error)?.message });
      Alert.alert("Could not update status", "Please try again.");
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    const didCopy = await copySensitiveToClipboard(text, field);
    if (didCopy) {
      setCopiedField(field);
    }
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
              <Text className="text-gray-600 ml-2 text-lg">{maskPhone(selectedInquiry.phone)}</Text>
            </View>
            <Pressable onPress={() => void copyToClipboard(selectedInquiry.phone, "Phone number")} className="p-2">
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
                  <Text className="text-gray-600 ml-2 text-lg">{maskEmail(selectedInquiry.email)}</Text>
                </View>
                <Pressable
                  onPress={() => (selectedInquiry.email ? void copyToClipboard(selectedInquiry.email, "Email") : null)}
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
                  <Text className="text-gray-600 ml-2 text-lg">
                    {selectedInquiry.location.length > 14
                      ? `${selectedInquiry.location.slice(0, 10)}…`
                      : selectedInquiry.location}
                  </Text>
                </View>
                <Pressable
                  onPress={() =>
                    selectedInquiry.location ? void copyToClipboard(selectedInquiry.location, "Address") : null
                  }
                  className="p-2"
                >
                  {copiedField === "Address" ? <Check size={18} color="#22c55e" /> : <Copy size={18} color="#64748b" />}
                </Pressable>
              </View>
            )}
            <Text className="text-xs text-gray-400 mt-2">
              Full contact details are hidden in the UI. Use copy or call actions when you need the complete value.
            </Text>
          </View>

          {/* Status controls */}
          <View className="bg-white p-4 mb-2">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-xl font-semibold">Status</Text>
              {isPreview && <Text className="text-xs text-orange-600">Preview only</Text>}
            </View>
            <View className="flex-row flex-wrap gap-2">
              {statusOptions.map((opt) => {
                const isActive = selectedInquiry.status === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => handleStatusChange(opt.id)}
                    className={`px-4 py-2 rounded-full border ${
                      isActive ? "bg-orange-100 border-orange-400" : "bg-gray-100 border-gray-200"
                    } ${isPreview ? "opacity-70" : ""}`}
                    >
                    <Text className={isActive ? "text-orange-700 font-semibold" : "text-gray-700"}>{opt.label}</Text>
                  </Pressable>
                );
              })}
            </View>
            {error ? <Text className="text-red-600 mt-2">Could not update. Pull to refresh and try again.</Text> : null}
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
              <Text className="text-gray-600 text-lg">
                Recording available in the dashboard. Mobile playback coming soon.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Fixed Bottom Actions */}
        <SafeAreaView edges={["bottom"]} className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200">
          <View className="p-4">
            <View className="flex-row space-x-12">
            <View className="flex-1">
                <Button
                  variant="secondary"
                  onPress={() => {
                    setUpsellVisible(true);
                    trackEvent("request_message_gated", { requestId: id });
                  }}
                  disabled={isPreview}
                >
                  {isPreview ? "Message (Pro)" : "Message"}
                </Button>
              </View>
              <View className="flex-1">
                <Button onPress={handleCall} disabled={isPreview}>
                  {isPreview ? "Call (Pro)" : "Call Customer"}
                </Button>
              </View>
            </View>
          </View>
        </SafeAreaView>
        <UpsellModal
          visible={upsellVisible}
          onClose={() => setUpsellVisible(false)}
          onUpgrade={() => {
            setUpsellVisible(false);
            router.push("/onboarding-assistant/payment");
          }}
          message="Call customers, update statuses, and send messages with Spaak Pro."
        />
      </View>
    </>
  );
}
