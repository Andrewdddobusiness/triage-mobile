import React, { useState, useEffect } from "react";
import { View, Text, Dimensions, TouchableOpacity, ActivityIndicator, Alert, Clipboard } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useSession } from "~/lib/auth/ctx";
import { supabase } from "~/lib/supabase";
import * as Haptics from "expo-haptics";
import { Phone, Copy, Check } from "lucide-react-native";
import { trackEvent } from "~/lib/utils/analytics";

const { width } = Dimensions.get("window");

export default function AssignPhoneNumberScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useSession();
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [assigned, setAssigned] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [availability, setAvailability] = useState<"checking" | "available" | "unavailable" | "waitlisted" | "error">(
    "checking"
  );
  const [serviceProviderId, setServiceProviderId] = useState<string | null>(null);

  useEffect(() => {
    trackEvent("assign_phone_screen_viewed");
  }, []);

  useEffect(() => {
    const fetchServiceProvider = async () => {
      if (!session?.user?.id) return;
      const { data, error: spError } = await supabase
        .from("service_providers")
        .select("id")
        .eq("auth_user_id", session.user.id)
        .single();
      if (!spError && data?.id) {
        setServiceProviderId(data.id);
      }
    };
    fetchServiceProvider();
    preflightAvailability();
  }, [session]);

  const preflightAvailability = async () => {
    if (!session?.user?.id) {
      setAvailability("error");
      setError("User not authenticated");
      return;
    }

    try {
      setAvailability("checking");
      const { count, error: availabilityError } = await supabase
        .from("twilio_phone_numbers")
        .select("id", { count: "exact", head: true })
        .is("assigned_to", null);

      if (availabilityError) throw availabilityError;

      if ((count || 0) > 0) {
        setAvailability("available");
        trackEvent("assign_phone_availability", { available: true });
      } else {
        setAvailability("unavailable");
        setError("No numbers available right now. Join the waitlist and we’ll notify you.");
        trackEvent("assign_phone_availability", { available: false });
      }
    } catch (err) {
      setAvailability("error");
      setError("Unable to check availability. Try again shortly.");
      trackEvent("assign_phone_availability_error", { message: (err as Error)?.message });
    }
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Function to find and assign an available phone number with retries/backoff
  const findAndAssignPhoneNumber = async () => {
    if (!session?.user?.id) {
      setError("User not authenticated");
      return;
    }

    try {
      setLoading(true);
      setLoadingMessage("Checking number availability...");
      setError("");

      const maxAttempts = 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        setLoadingMessage(`Assigning number (attempt ${attempt}/${maxAttempts})...`);
        trackEvent("assign_phone_attempt", { attempt });

        const { data, error: functionError } = await supabase.functions.invoke<{
          success: boolean;
          phoneNumber?: string;
          message?: string;
          error?: string;
        }>("assign-phone-number");

        if (functionError) {
          trackEvent("assign_phone_error", { attempt, message: functionError.message });
          if (attempt === maxAttempts) throw functionError;
        } else if (!data?.success) {
          const msg = data?.error || "Sorry! We can't assign you a phone number at this time. Please check back later.";
          trackEvent("assign_phone_error", { attempt, message: msg });
          if (attempt === maxAttempts) throw new Error(msg);
        } else {
          setPhoneNumber(data.phoneNumber || "");
          setAssigned(true);
          setAvailability("available");
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          trackEvent("assign_phone_success", { attempt });
          return;
        }

        if (attempt < maxAttempts) {
          await delay(1000 * attempt); // simple backoff
        }
      }
    } catch (error) {
      console.error("Error assigning phone number:", error);
      setError(error instanceof Error ? error.message : "Failed to assign phone number");
      // Trigger error haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const joinWaitlist = async () => {
    if (!session?.user?.email) {
      Alert.alert("We need your email to notify you.");
      return;
    }
    try {
      setLoading(true);
      setLoadingMessage("Joining waitlist...");
      setError("");
      trackEvent("assign_phone_waitlist_attempt");
      const { error: waitlistError } = await supabase.from("number_waitlist").insert({
        email: session.user.email,
        service_provider_id: serviceProviderId,
      });
      if (waitlistError) throw waitlistError;
      setAvailability("waitlisted");
      trackEvent("assign_phone_waitlist_success");
      Alert.alert("You're on the list", "We'll notify you as soon as a number is ready.");
    } catch (err) {
      setAvailability("unavailable");
      setError("Could not join waitlist. Please try again later.");
      trackEvent("assign_phone_waitlist_error", { message: (err as Error)?.message });
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  // Reset copied state after 2 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (copied) {
      timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [copied]);

  // Navigate to main app after successful assignment
  const handleContinue = () => {
    trackEvent("assign_phone_continue");
    router.replace("/(tabs)");
  };

  // Copy phone number to clipboard
  const copyToClipboard = () => {
    if (phoneNumber) {
      Clipboard.setString(phoneNumber);
      setCopied(true);
      // Trigger success haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      trackEvent("assign_phone_copied");
    }
  };

  return (
    <LinearGradient
      colors={["#FFFFFF", "#FFF5EC", "#FFE8D6"]}
      locations={[0, 0.3, 0.6, 0.9]}
      start={{ x: 0.3, y: 0.2 }}
      end={{ x: 0.7, y: 0.8 }}
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className="flex-1 justify-center items-center px-6"
    >
      {/* Skip Button - only show when not assigned */}
      {!assigned && (
        <TouchableOpacity
          onPress={() => {
            trackEvent("assign_phone_skip");
            router.replace("/(tabs)");
          }}
          className="absolute top-12 right-2 p-6 z-10"
        >
          <Text className="text-[#fe885a] font-semibold">Skip</Text>
        </TouchableOpacity>
      )}

      {assigned ? (
        <>
          {/* Header for assigned state */}
          <View className="absolute top-0 left-0 right-0 pt-32 pb-6 px-6">
            <Text className="text-3xl font-bold text-center text-[#fe885a]">Phone Number Assigned!</Text>
            <View className="flex-row justify-center items-center mt-2">
              <Text className="text-base text-center text-gray-600">
                Your new business phone number is ready to use
              </Text>
            </View>
          </View>

          {/* Main Content for assigned state */}
          <View className="flex-1 justify-center items-center">
            <View className="items-center">
              <View className="bg-white p-6 rounded-xl shadow-md mb-8">
                <Text className="text-gray-500 mb-2">Your business phone number</Text>
                <View className="flex-row items-center justify-center">
                  <Text className="text-3xl font-bold text-[#fe885a]">{phoneNumber}</Text>
                  <TouchableOpacity onPress={copyToClipboard} className="ml-3">
                    {copied ? <Check size={24} color="#22c55e" /> : <Copy size={24} color="#fe885a" />}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Continue button */}
          <View className="absolute bottom-0 left-0 right-0 px-6 pb-0" style={{ paddingBottom: insets.bottom + 20 }}>
            <TouchableOpacity
              onPress={handleContinue}
              style={{
                width: width - 80,
                alignSelf: "center",
                borderRadius: 9999,
                overflow: "hidden",
              }}
            >
              <LinearGradient
                colors={["#ffb351", "#fe885a", "#ffa2a3"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingVertical: 16, alignItems: "center" }}
              >
                <Text className="text-white text-lg font-semibold">Continue</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          {/* Header for unassigned state - positioned at the top */}
          <View className="absolute top-0 left-0 right-0 pt-32 pb-6 px-6">
            <Text className="text-3xl font-bold text-center text-[#fe885a]">Get a Business Phone Number</Text>
            <View className="flex-row justify-center items-center mt-2">
              <Text className="text-base text-center text-gray-600">
                We will give you a business phone number hooked up to an AI assistant!
              </Text>
            </View>
          </View>

          {/* Content area with fixed height to maintain layout */}
          <View className="flex-1" />

          {/* Error message and button container with fixed position */}
          <View className="absolute bottom-0 left-0 right-0 px-6" style={{ paddingBottom: insets.bottom + 20 }}>
            {/* Error message with fixed height to prevent layout shifts */}
            <View style={{ minHeight: 40, justifyContent: "center", marginBottom: 16 }}>
              {error ? <Text className="text-red-500 text-center">{error}</Text> : null}
              {availability === "checking" && <Text className="text-zinc-500 text-center">Checking availability...</Text>}
              {loadingMessage ? <Text className="text-zinc-500 text-center mt-1">{loadingMessage}</Text> : null}
              {availability === "waitlisted" && (
                <Text className="text-green-600 text-center">You’re on the waitlist — we’ll notify you.</Text>
              )}
            </View>

            {/* Get business number button */}
            {availability === "available" || availability === "checking" || availability === "error" ? (
              <TouchableOpacity
                onPress={findAndAssignPhoneNumber}
                disabled={loading}
                style={{
                  width: width - 80,
                  alignSelf: "center",
                  borderRadius: 9999,
                  overflow: "hidden",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                <LinearGradient
                  colors={["#ffb351", "#fe885a", "#ffa2a3"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ paddingVertical: 16, alignItems: "center" }}
                >
                  <View className="flex-row items-center justify-center">
                    {loading ? (
                      <>
                        <ActivityIndicator size="small" color="white" />
                        <Text className="text-white text-lg font-semibold ml-2">Getting number...</Text>
                      </>
                    ) : (
                      <Text className="text-white text-lg font-semibold">Get business number</Text>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ) : availability === "unavailable" ? (
              <TouchableOpacity
                onPress={joinWaitlist}
                disabled={loading || availability === "waitlisted"}
                style={{
                  width: width - 80,
                  alignSelf: "center",
                  borderRadius: 9999,
                  overflow: "hidden",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                <LinearGradient
                  colors={["#94a3b8", "#64748b"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ paddingVertical: 16, alignItems: "center" }}
                >
                  <View className="flex-row items-center justify-center">
                    {loading ? (
                      <>
                        <ActivityIndicator size="small" color="white" />
                        <Text className="text-white text-lg font-semibold ml-2">Joining waitlist...</Text>
                      </>
                    ) : (
                      <Text className="text-white text-lg font-semibold">Notify me when ready</Text>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ) : null}

            {/* Retry availability */}
            {availability === "error" && !loading && (
              <TouchableOpacity
                onPress={() => {
                  trackEvent("assign_phone_availability_retry");
                  preflightAvailability();
                }}
                className="mt-4"
                style={{ alignSelf: "center" }}
              >
                <Text className="text-[#fe885a] font-semibold">Retry availability check</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </LinearGradient>
  );
}
