import { router, Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, Text, ActivityIndicator, View, TouchableOpacity, Dimensions } from "react-native";
import { Redirect } from "expo-router";
import { useSession } from "~/lib/auth/ctx";
import { Header } from "~/components/ui/header";
import { useHeaderTitleStore } from "~/lib/stores/headerTitleStore";
// import { HapticTab } from "~/components/HapticTab";
import TabBarBackground from "~/components/ui/TabBarBackground";
import { Colors } from "~/constants/Colors";
import { useColorScheme } from "~/hooks/useColorScheme";
import { serviceProviderService } from "~/lib/services/serviceProviderService";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { supabase } from "~/lib/supabase";

import Icon from "@expo/vector-icons/FontAwesome5";
import IconIon from "@expo/vector-icons/Ionicons";

const { width } = Dimensions.get("window");

export default function AppLayout() {
  const { session, isLoading } = useSession();
  const colorScheme = useColorScheme();
  const title = useHeaderTitleStore((state: any) => state.title);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [hasBusinessNumber, setHasBusinessNumber] = useState(false);
  const [checkingBusinessNumber, setCheckingBusinessNumber] = useState(true);
  const [hasAssistant, setHasAssistant] = useState(false);

  useEffect(() => {
    // Check if the user has completed onboarding
    const checkOnboardingStatus = async () => {
      if (session?.user) {
        try {
          const isCompleted = await serviceProviderService.isOnboardingCompleted(session.user.id);
          setOnboardingCompleted(isCompleted);
        } catch (error) {
          console.error("Error checking onboarding status:", error);
          setOnboardingCompleted(false); // Default to not completed on error
        }
      }
      setCheckingOnboarding(false);
    };

    if (session) {
      checkOnboardingStatus();
    } else {
      setCheckingOnboarding(false);
    }
  }, [session]);

  useEffect(() => {
    // Check if the user has been assigned a business number
    const checkBusinessNumber = async () => {
      if (session?.user) {
        try {
          // First get the service provider ID
          const { data: serviceProvider, error: spError } = await supabase
            .from("service_providers")
            .select("id")
            .eq("auth_user_id", session.user.id)
            .single();

          if (spError) throw spError;

          // Then check if they have an assigned phone number
          const { data: phoneNumbers, error: phoneError } = await supabase
            .from("twilio_phone_numbers")
            .select("*")
            .eq("assigned_to", serviceProvider.id)
            .not("assigned_at", "is", null);

          if (phoneError) throw phoneError;

          // If they have any assigned phone numbers, set hasBusinessNumber to true
          setHasBusinessNumber(phoneNumbers && phoneNumbers.length > 0);
        } catch (error) {
          console.error("Error checking business number:", error);
          setHasBusinessNumber(false);
        } finally {
          setCheckingBusinessNumber(false);
        }
      } else {
        setCheckingBusinessNumber(false);
      }
    };

    if (session && onboardingCompleted) {
      checkBusinessNumber();
    }
  }, [session, onboardingCompleted]);

  const navigateToPhoneNumber = async () => {
    // Trigger haptic feedback when button is pressed
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Get the service provider ID
      const { data: serviceProvider, error: spError } = await supabase
        .from("service_providers")
        .select("id")
        .eq("auth_user_id", session?.user.id)
        .single();
      console.log("serviceProvider: ", serviceProvider);

      if (spError) throw spError;

      // Check if they have an assistant
      const { data: assistant, error: assistantError } = await supabase
        .from("service_provider_assistants")
        .select("id")
        .eq("service_provider_id", serviceProvider.id)
        .single();

      console.log("assistant: ", assistant);

      if (assistantError && assistantError.code !== "PGRST116") throw assistantError;

      // If no assistant, navigate to welcome screen
      if (!assistant) {
        router.push("./onboarding-assistant/welcome");
        return;
      }

      // Check if they have a phone number
      const { data: phoneNumber, error: phoneError } = await supabase
        .from("twilio_phone_numbers")
        .select("id")
        .eq("assigned_to", serviceProvider.id)
        .is("is_active", true)
        .single();

      if (phoneError && phoneError.code !== "PGRST116") throw phoneError;

      // If no phone number, navigate to phone number assignment
      if (!phoneNumber) {
        router.push("./onboarding-assistant/assignPhoneNumber");
        return;
      }
    } catch (error) {
      console.error("Error checking assistant status:", error);
      // Default to welcome screen on error
      router.push("./onboarding-assistant/welcome");
    }
  };

  if (isLoading || checkingOnboarding || (onboardingCompleted && checkingBusinessNumber)) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/welcome" />;
  }

  // Redirect to onboarding if not completed
  if (onboardingCompleted === false) {
    return <Redirect href="/onboarding" />;
  }

  const handleSearch = () => {
    console.log("Search pressed");
  };

  const handleNotification = () => {
    console.log("Notification pressed");
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: true,
          header: ({ route }) => {
            const getTitleForRoute = () => {
              switch (route.name) {
                case "index":
                  return "Inquiries";
                // case "calls":
                //   return "Calls";
                // case "keypad":
                //   return "Keypad";
                // case "contacts":
                //   return "Contacts";
                case "assistant-settings":
                  return "Assistant Settings";
                case "profile":
                  return "Profile";
                default:
                  return "";
              }
            };

            return (
              <Header
                title={getTitleForRoute()}
                onSearchPress={handleSearch}
                onNotificationPress={handleNotification}
              />
            );
          },
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          tabBarInactiveTintColor: "#adb5bd",
          // tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarShowLabel: true,
          tabBarStyle: Platform.select({
            ios: {
              position: "absolute",
            },
            default: {},
          }),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Inbox",
            tabBarIcon: ({ color, size }) => <Icon name="inbox" size={size} color={color} />,
          }}
        />
        {/* Commented out tabs
        <Tabs.Screen
          name="contacts"
          options={{
            title: "Contacts",
            tabBarIcon: ({ color, size }) => <Icon name="users" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="keypad"
          options={{
            title: "Keypad",
            tabBarIcon: ({ color, size }) => <IconIon name="keypad" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="calls"
          options={{
            title: "Calls",
            tabBarIcon: ({ color, size }) => <Icon name="phone-alt" size={size} color={color} />,
          }}
        />
        */}
        <Tabs.Screen
          name="assistant-settings"
          options={{
            title: "Assistant",
            tabBarIcon: ({ color, size }) => <Icon name="robot" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => <Icon name="user-alt" size={size} color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}
