import "~/global.css";

import { Theme, ThemeProvider, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
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
      <ActivityIndicator size="large" />
      <Text className="mt-4 text-muted-foreground">Loading...</Text>
    </View>
  );
}

function RootLayoutNav() {
  const { session, isLoading, hasActiveSubscription, subscriptionLoading } = useSession();
  const { isDarkColorScheme } = useColorScheme();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: "244259622983-d8hokavl2edb0gl050f40rkeak1otq6n.apps.googleusercontent.com",
      iosClientId: "244259622983-oc0g6h4n3pamklfcevffjeup6k0pohos.apps.googleusercontent.com",
      offlineAccess: true, // if you need refresh tokens
      forceCodeForRefreshToken: true, // Add this line
    });
  }, []);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (session?.user) {
        // First ensure the service provider record exists
        await serviceProviderService.createServiceProvider(session.user.id);

        // Then check if onboarding is completed
        const isCompleted = await serviceProviderService.isOnboardingCompleted(session.user.id);
        setOnboardingCompleted(isCompleted);
      } else {
        setOnboardingCompleted(null);
      }
    };

    checkOnboardingStatus();
  }, [session]);

  // Wait for all loading states to complete before rendering navigation
  if (isLoading || (session && subscriptionLoading) || (session && onboardingCompleted === null)) {
    return <LoadingScreen />;
  }

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
        ) : !hasActiveSubscription ? (
          <Stack.Screen name="onboarding-assistant/payment" />
        ) : !onboardingCompleted ? (
          <Stack.Screen name="onboarding" />
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
      // Adds the background color to the html element to prevent white background on overscroll.
      document.documentElement.classList.add("bg-background");
    }
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  // if (!isColorSchemeLoaded) {
  //   return <LoadingScreen />;
  // }

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
