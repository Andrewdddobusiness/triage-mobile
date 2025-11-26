import "~/global.css";

import { Theme, ThemeProvider, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { Platform, View, ActivityIndicator } from "react-native";
import { NAV_THEME } from "../lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";
import { SessionProvider, useSession } from "~/lib/auth/ctx";
import { Text } from "~/components/ui/text";
import { SplashScreenProvider } from "./splash-screen";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useEffect, useState } from "react";
import { serviceProviderService } from "~/lib/services/serviceProviderService";
import { supabase } from "~/lib/supabase";
import { registerForPushNotifications, addNotificationResponseListener } from "~/lib/notifications";

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color={"#FFA500"} />
      <Text className="mt-4 text-muted-foreground">Loading...</Text>
    </View>
  );
}

function RootLayoutNav() {
  const { session, isLoading, hasActiveSubscription, hasSubscriptionHistory, subscriptionLoading } = useSession();
  const { isDarkColorScheme } = useColorScheme();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [hasBusinessNumber, setHasBusinessNumber] = useState<boolean | null>(null);
  const [hasAssistant, setHasAssistant] = useState<boolean | null>(null);
  const [serviceProviderId, setServiceProviderId] = useState<string | null>(null);
  const [pushRegistered, setPushRegistered] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: "244259622983-d8hokavl2edb0gl050f40rkeak1otq6n.apps.googleusercontent.com",
      iosClientId: "244259622983-oc0g6h4n3pamklfcevffjeup6k0pohos.apps.googleusercontent.com",
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
  }, []);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (session?.user) {
        try {
          // First ensure the service provider record exists
          await serviceProviderService.createServiceProvider(session.user.id);

          // Check if onboarding is completed
          const isCompleted = await serviceProviderService.isOnboardingCompleted(session.user.id);
          setOnboardingCompleted(isCompleted);

          if (isCompleted) {
            // Get the service provider ID
            const { data: serviceProvider, error: spError } = await supabase
              .from("service_providers")
              .select("id")
              .eq("auth_user_id", session.user.id)
              .single();

            if (spError) throw spError;
            setServiceProviderId(serviceProvider.id);

            // Check if they have an assistant
            const { data: assistant, error: assistantError } = await supabase
              .from("service_provider_assistants")
              .select("id")
              .eq("service_provider_id", serviceProvider.id)
              .single();

            setHasAssistant(!!assistant && !assistantError);

            // Check if they have an assigned phone number
            const { data: phoneNumbers, error: phoneError } = await supabase
              .from("twilio_phone_numbers")
              .select("*")
              .eq("assigned_to", serviceProvider.id)
              .not("assigned_at", "is", null);

            if (phoneError) throw phoneError;

            setHasBusinessNumber(phoneNumbers && phoneNumbers.length > 0);
          } else {
            setHasAssistant(null);
            setHasBusinessNumber(null);
          }
        } catch (error) {
          console.error("Error checking user status:", error);
          setOnboardingCompleted(false);
          setHasAssistant(false);
          setHasBusinessNumber(false);
        }
      } else {
        setOnboardingCompleted(null);
        setHasAssistant(null);
        setHasBusinessNumber(null);
      }
    };

    checkUserStatus();
  }, [session]);

  useEffect(() => {
    if (session?.user && serviceProviderId && !pushRegistered) {
      registerForPushNotifications({ serviceProviderId, authUserId: session.user.id }).finally(() => {
        setPushRegistered(true);
      });
    }
  }, [session?.user, serviceProviderId, pushRegistered]);

  useEffect(() => {
    const unsubscribe = addNotificationResponseListener((data) => {
      if (data?.type === "inquiry" && data.requestId) {
        router.push(`/request/${data.requestId}`);
      } else if (data?.type === "assistant") {
        router.push("/(tabs)/assistant-settings");
      }
    });
    return unsubscribe;
  }, []);

  // Wait for all loading states to complete before rendering navigation
  if (
    isLoading ||
    (session && subscriptionLoading) ||
    (session && onboardingCompleted === null) ||
    (session && onboardingCompleted && hasBusinessNumber === null)
  ) {
    return <LoadingScreen />;
  }
  console.log("hasActiveSubscription: ", hasActiveSubscription);
  console.log("hasSubscriptionHistory: ", hasSubscriptionHistory);
  return (
    <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
      <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        {!session ? (
          <>
            <Stack.Screen name="welcome" />
            <Stack.Screen name="signIn" />
            <Stack.Screen name="signUp" />
          </>
        ) : !hasActiveSubscription && !hasSubscriptionHistory ? (
          <Stack.Screen name="onboarding-assistant/payment" />
        ) : !hasActiveSubscription && hasSubscriptionHistory ? (
          <Stack.Screen name="subscription" />
        ) : !onboardingCompleted ? (
          <Stack.Screen name="onboarding" />
        ) : !hasAssistant ? (
          <Stack.Screen name="onboarding-assistant/welcome" />
        ) : !hasBusinessNumber ? (
          <Stack.Screen name="onboarding-assistant/assignPhoneNumber" />
        ) : (
          <Stack.Screen name="(tabs)" />
        )}
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const hasMounted = React.useRef(false);
  const { colorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  useIsomorphicLayoutEffect(() => {
    if (hasMounted.current) {
      return;
    }

    if (Platform.OS === "web") {
      document.documentElement.classList.add("bg-background");
    }
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  return (
    <SplashScreenProvider>
      <SessionProvider>
        <RootLayoutNav />
      </SessionProvider>
    </SplashScreenProvider>
  );
}

const useIsomorphicLayoutEffect =
  Platform.OS === "web" && typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;
