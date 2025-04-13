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
  const { session, isLoading } = useSession();
  const { isDarkColorScheme } = useColorScheme();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
      <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        {!session ? (
          <>
            <Stack.Screen name="signIn" />
            <Stack.Screen name="signUp" />
          </>
        ) : (
          <>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="(modals)/new-trip"
              options={{
                presentation: "modal",
                headerShown: false,
              }}
            />
          </>
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

  if (!isColorSchemeLoaded) {
    return <LoadingScreen />;
  }

  return (
    <SessionProvider>
      <RootLayoutNav />
    </SessionProvider>
  );
}

const useIsomorphicLayoutEffect =
  Platform.OS === "web" && typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;
