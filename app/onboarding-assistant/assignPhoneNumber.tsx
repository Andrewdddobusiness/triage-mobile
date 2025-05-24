import React, { useState, useRef, useEffect } from "react";
import { View, Text, Dimensions, TouchableOpacity, ActivityIndicator, Alert, Clipboard } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useSession } from "~/lib/auth/ctx";
import { supabase } from "~/lib/supabase";
import * as Haptics from "expo-haptics";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";
import { Phone, Copy, Check } from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function AssignPhoneNumberScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useSession();
  const [loading, setLoading] = useState(false);
  const [assigned, setAssigned] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Animation values
  const progress = useSharedValue(0);

  // Function to find and assign an available phone number
  const findAndAssignPhoneNumber = async () => {
    if (!session?.user?.id) {
      setError("User not authenticated");
      return;
    }

    try {
      setLoading(true);

      // 1. Get the service provider ID and assistant ID for the current user
      const { data: serviceProvider, error: spError } = await supabase
        .from("service_providers")
        .select(
          `
          id,
          service_provider_assistants!inner(
            assistant_id
          )
        `
        )
        .eq("auth_user_id", session.user.id)
        .single();

      if (spError) throw spError;
      console.log("serviceProvider: ", serviceProvider);

      // 2. Find an available phone number (not assigned to any service provider)
      const { data: availableNumbers, error: numbersError } = await supabase
        .from("twilio_phone_numbers")
        .select("*")
        .is("assigned_to", null)
        .eq("is_active", true)
        .limit(1);

      if (numbersError) throw numbersError;

      if (!availableNumbers || availableNumbers.length === 0) {
        throw new Error("Sorry! We can't assign you a phone number at this time. Please check back later.");
      }

      const phoneNumberToAssign = availableNumbers[0];

      // 3. Assign the phone number to the service provider
      const { error: updateError } = await supabase
        .from("twilio_phone_numbers")
        .update({
          assigned_to: serviceProvider.id,
          assigned_at: new Date().toISOString(),
        })
        .eq("id", phoneNumberToAssign.id);

      if (updateError) throw updateError;

      // 4. Call the Supabase Edge Function to import the phone number to Vapi
      const { error: importError } = await supabase.functions.invoke("import-twilio-number", {
        body: {
          twilioPhoneNumber: phoneNumberToAssign.phone_number,
          serviceProviderId: serviceProvider.id,
        },
      });

      if (importError) {
        throw new Error("Sorry! We can't assign you a phone number at this time. Please check back later.");
      }

      // Success!
      setPhoneNumber(phoneNumberToAssign.phone_number);
      setAssigned(true);

      // Trigger success haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error assigning phone number:", error);
      setError(error instanceof Error ? error.message : "Failed to assign phone number");

      // Trigger error haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
      progress.value = withTiming(0, { duration: 300 });
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
    router.replace("/(tabs)");
  };

  // Copy phone number to clipboard
  const copyToClipboard = () => {
    if (phoneNumber) {
      Clipboard.setString(phoneNumber);
      setCopied(true);
      // Trigger success haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
        <TouchableOpacity onPress={() => router.replace("/(tabs)")} className="absolute top-12 right-2 p-6 z-10">
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
            <View style={{ height: 40, justifyContent: "center", marginBottom: 16 }}>
              {error ? <Text className="text-red-500 text-center">{error}</Text> : null}
            </View>

            {/* Get business number button */}
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
          </View>
        </>
      )}
    </LinearGradient>
  );
}
