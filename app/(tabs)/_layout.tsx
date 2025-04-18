import { router, Tabs } from "expo-router";
import React from "react";
import { Platform, Text } from "react-native";
import { Redirect } from "expo-router";
import { useSession } from "~/lib/auth/ctx";
import { Header } from "~/components/ui/header";
import { useHeaderTitleStore } from "~/stores/headerTitleStore";
import { InboxIcon, ContactsIcon, KeypadIcon, CallsIcon, ProfileIcon } from "~/components/ui/icons";
import { HapticTab } from "~/components/HapticTab";
import TabBarBackground from "~/components/ui/TabBarBackground";
import { Colors } from "~/constants/Colors";
import { useColorScheme } from "~/hooks/useColorScheme";

export default function AppLayout() {
  const { session, isLoading } = useSession();
  const colorScheme = useColorScheme();
  const title = useHeaderTitleStore((state: any) => state.title);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (!session) {
    return <Redirect href="/signIn" />;
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
                return "Inbox";
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
        tabBarInactiveTintColor: "#64748b",
        tabBarButton: HapticTab,
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
          tabBarIcon: ({ color, size }) => <InboxIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: "Contacts",
          tabBarIcon: ({ color, size }) => <ContactsIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="keypad"
        options={{
          title: "Keypad",
          tabBarIcon: ({ color, size }) => <KeypadIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calls"
        options={{
          title: "Calls",
          tabBarIcon: ({ color, size }) => <CallsIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <ProfileIcon size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
