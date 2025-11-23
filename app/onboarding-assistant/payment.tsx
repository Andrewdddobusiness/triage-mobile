import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  BackHandler,
  ActivityIndicator,
  Modal,
  AppState,
} from "react-native";
import { Text } from "~/components/ui/text";
import * as Linking from "expo-linking";
import { useSession } from "~/lib/auth/ctx";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check, Phone, FileText, Mic, Users, Clock, Shield, CheckCircle, XCircle } from "lucide-react-native";
import { useColorScheme } from "~/hooks/useColorScheme";
import { supabase } from "~/lib/supabase";

type ScreenState = "payment" | "verifying" | "success" | "failed";

export default function PaymentScreen() {
  const { session, checkSubscription, hasSubscriptionHistory } = useSession();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [screenState, setScreenState] = useState<ScreenState>("payment");
  const [showRedirectModal, setShowRedirectModal] = useState(false);

  // Prevent back navigation
  useEffect(() => {
    const backAction = () => {
      // Prevent going back - user must complete payment or close app
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, []);

  const handleSubscribe = async () => {
    if (!session?.user?.email) {
      console.error("No user email found");
      setScreenState("failed");
      return;
    }

    setIsLoading(true);

    try {
      // Show redirect modal
      setShowRedirectModal(true);

      const { data, error } = await supabase.functions.invoke("stripe-create-session", {
        body: { email: session.user.email },
      });

      if (error) {
        console.error("Error creating subscription:", error);
        setShowRedirectModal(false);
        setIsLoading(false);
        setScreenState("failed");
        return;
      }

      if (data?.url) {
        // Small delay to show the modal
        setTimeout(() => {
          Linking.openURL(data.url);
          setShowRedirectModal(false);
          setIsLoading(false);
        }, 2000);
      } else {
        console.error("No URL received from subscription service");
        setShowRedirectModal(false);
        setIsLoading(false);
        setScreenState("failed");
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      setShowRedirectModal(false);
      setIsLoading(false);
      setScreenState("failed");
    }
  };

  const verifySubscription = async () => {
    setScreenState("verifying");

    try {
      const status = await checkSubscription();
      const success = status?.hasActiveSubscription;
      console.log("subscription status: ", status);

      if (success) {
        setScreenState("success");
        // Navigate to main app after showing success screen
        setTimeout(() => {
          router.replace("/(tabs)");
        }, 3000);
      } else {
        setScreenState("failed");
      }
    } catch (error) {
      console.error("Error verifying subscription:", error);
      setScreenState("failed");
    }
  };

  useEffect(() => {
    const subscription = Linking.addEventListener("url", async ({ url }) => {
      if (url.includes("payment-success")) {
        console.log("✅ Payment success deep link received");
        await verifySubscription();
      } else if (url.includes("payment-cancelled")) {
        console.log("❌ Payment cancelled deep link received");
        setScreenState("failed");
      }
    });

    return () => subscription.remove();
  }, [checkSubscription]);

  // Handle app state changes for fail-safes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "active" && isLoading) {
        // User returned to app while payment was in progress
        setTimeout(async () => {
          try {
            const status = await checkSubscription();
            const success = status?.hasActiveSubscription;
            if (success) {
              setScreenState("success");
              setTimeout(() => {
                router.replace("/(tabs)");
              }, 3000);
            } else {
              setScreenState("payment");
            }
          } catch (error) {
            console.log("Background subscription check failed:", error);
            setScreenState("payment");
          }
          setIsLoading(false);
        }, 2000);
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [isLoading]);

  // Success Screen
  if (screenState === "success") {
    return (
      <View className="flex-1 justify-center items-center bg-background px-6">
        <View className="items-center">
          <View className="w-24 h-24 rounded-full bg-green-100 items-center justify-center mb-6">
            <CheckCircle size={48} className="text-green-500" />
          </View>
          <Text className={`text-3xl font-bold text-center mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
            Welcome to Spaak Pro!
          </Text>
          <Text className={`text-lg text-center mb-8 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            Your subscription is now active. You have access to all Pro features.
          </Text>
          <View className="w-full bg-green-50 rounded-xl p-4 mb-6">
            <Text className="text-green-800 font-semibold text-center">✅ Subscription Confirmed</Text>
            <Text className="text-green-700 text-sm text-center mt-1">Redirecting to your dashboard...</Text>
          </View>
          <ActivityIndicator size="small" color={"#FFA500"} />
        </View>
      </View>
    );
  }

  // Failed Screen
  if (screenState === "failed") {
    return (
      <View className="flex-1 justify-center items-center bg-background px-6">
        <View className="items-center">
          <Text className={`text-3xl font-bold text-center mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
            Payment Failed
          </Text>
          <Text className={`text-lg text-center mb-8 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            We couldn't process your payment. Please try again or contact support.
          </Text>
          <View className="w-full bg-red-50 rounded-xl p-4 mb-6">
            <Text className="text-red-800 font-semibold text-center">Subscription Not Active</Text>
            <Text className="text-red-700 text-sm text-center mt-1">Your payment was cancelled or failed</Text>
          </View>
          <View className="flex-1 w-full space-y-3">
            <TouchableOpacity
              onPress={() => setScreenState("payment")}
              style={{
                borderRadius: 12,
                overflow: "hidden",
                width: "100%",
              }}
            >
              <LinearGradient
                colors={["#ffb351", "#fe885a", "#ffa2a3"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingVertical: 16, alignItems: "center" }}
              >
                <Text className="text-white text-full font-semibold">Try Again</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Verifying Screen
  if (screenState === "verifying") {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color={"#FFA500"} />
        <Text className={`text-xl font-semibold mt-4 ${isDark ? "text-white" : "text-gray-900"}`}>
          Verifying your subscription…
        </Text>
        <Text className={`text-sm mt-2 text-center px-8 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
          Please wait while we confirm your payment
        </Text>
      </View>
    );
  }

  const features = [
    {
      icon: Phone,
      title: "Unlimited Calls",
      description: "Take as many calls as your business needs",
    },
    {
      icon: FileText,
      title: "Call Transcripts",
      description: "Get written records of every conversation",
    },
    {
      icon: Mic,
      title: "Call Recordings",
      description: "Never miss important details again",
    },
    {
      icon: Users,
      title: "Customer Management",
      description: "Keep track of all your clients and jobs",
    },
    {
      icon: Clock,
      title: "24/7 AI Assistant",
      description: "Your virtual receptionist that never sleeps",
    },
    {
      icon: Shield,
      title: "Priority Support",
      description: "Get help when you need it most",
    },
  ];

  // Main Payment Screen
  return (
    <View className="flex-1">
      {/* Redirect Modal */}
      <Modal visible={showRedirectModal} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className={`mx-6 p-6 rounded-2xl ${isDark ? "bg-gray-800" : "bg-white"}`}>
            <View className="items-center">
              <ActivityIndicator size="large" color={"#FFA500"} />
              <Text className={`text-lg font-semibold mt-4 text-center ${isDark ? "text-white" : "text-gray-900"}`}>
                Redirecting to Payment
              </Text>
              <Text className={`text-sm mt-2 text-center ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                You'll be redirected to a secure payment page. Please return to Spaak after payment.
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View className="px-6 pt-32 pb-8">
        <View className="items-center mb-6">
          <Text className={`text-3xl font-bold text-center ${isDark ? "text-white" : "text-gray-900"}`}>
            Upgrade to Spaak Pro
          </Text>
          <Text className={`text-lg text-center mt-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            Everything you need to run your trade business professionally
          </Text>
        </View>
      </View>

      {/* Pricing Card */}
      <View className="mx-6 mb-8 rounded-2xl">
        <LinearGradient colors={["#FFA787", "#f7931e"]} style={{ borderRadius: 20, overflow: "hidden", padding: 10 }}>
          <View className="items-center rounded-2xl">
            <Text className="text-white text-lg font-medium mb-2">Pro Plan</Text>
            <View className="flex-row items-baseline mb-4">
              <Text className="text-white text-5xl font-bold">$59</Text>
              <Text className="text-white/80 text-lg ml-2">AUD / month</Text>
            </View>
            <Text className="text-white/90 text-center text-base">Everything included • Cancel anytime</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Features */}
      <View className="px-6 mb-8">
        <Text className={`text-xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>What's included:</Text>
        <View className="space-y-4">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <View key={index} className="flex-row items-start">
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${
                    isDark ? "bg-orange-500/20" : "bg-orange-50"
                  }`}
                >
                  <IconComponent size={20} className="text-orange-500" />
                </View>
                <View className="flex-1">
                  <Text className={`font-semibold text-base mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {feature.title}
                  </Text>
                  <Text className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>{feature.description}</Text>
                </View>
                <Check size={20} className="text-orange-500 mt-1" />
              </View>
            );
          })}
        </View>
      </View>

      {/* Continue Button */}
      <View
        className="px-6 pb-6"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: insets.bottom,
        }}
      >
        <View className="space-y-3">
          <TouchableOpacity
            onPress={handleSubscribe}
            disabled={isLoading}
            style={{
              alignSelf: "center",
              borderRadius: 9999,
              overflow: "hidden",
              width: "100%",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            <LinearGradient
              colors={["#ffb351", "#fe885a", "#ffa2a3"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ paddingVertical: 16, alignItems: "center" }}
            >
              <View className="flex-row items-center justify-center">
                {isLoading ? (
                  <>
                    <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
                    <Text className="text-white text-lg font-semibold">Processing...</Text>
                  </>
                ) : (
                  <Text className="text-white text-lg font-semibold">Continue with Payment</Text>
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>

        </View>

        <Text className={`text-center text-xs mt-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </View>
  );
}
