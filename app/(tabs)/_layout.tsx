import { router, Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, Text, ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { useSession } from "~/lib/auth/ctx";
import { Header } from "~/components/ui/header";
import { useHeaderTitleStore } from "~/lib/stores/headerTitleStore";
// import { HapticTab } from "~/components/HapticTab";
import TabBarBackground from "~/components/ui/TabBarBackground";
import { Colors } from "~/constants/Colors";
import { useColorScheme } from "~/hooks/useColorScheme";
import { serviceProviderService } from "~/lib/services/serviceProviderService";

import Icon from "@expo/vector-icons/FontAwesome5";
import IconIon from "@expo/vector-icons/Ionicons";

export default function AppLayout() {
  const { session, isLoading } = useSession();
  const colorScheme = useColorScheme();
  const title = useHeaderTitleStore((state: any) => state.title);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

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

  if (isLoading || checkingOnboarding) {
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
    <Tabs
      screenOptions={{
        headerShown: true,
        header: ({ route }) => {
          const getTitleForRoute = () => {
            switch (route.name) {
              case "index":
                return "Inquiries";
              case "calls":
                return "Calls";
              case "keypad":
                return "Keypad";
              case "contacts":
                return "Contacts";
              case "profile":
                return "Profile";
              default:
                return "";
            }
          };

          return (
            <Header title={getTitleForRoute()} onSearchPress={handleSearch} onNotificationPress={handleNotification} />
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
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <Icon name="user-alt" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
