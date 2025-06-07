import React from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import { Text } from "~/components/ui/text";
import { useSession } from "~/lib/auth/ctx";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "~/hooks/useColorScheme";
import { AlertTriangle, LogOut } from "lucide-react-native";

export default function ErrorScreen() {
  const { session, signOut } = useSession();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error("Error signing out:", error);
            }
          },
        },
      ]
    );
  };

  return (
    <LinearGradient 
      colors={isDark ? ["#1a1a1a", "#2d2d2d"] : ["#ffffff", "#f8f9fa"]} 
      className="flex-1"
    >
      <View 
        className="flex-1 justify-center items-center px-6"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        {/* Error Icon */}
        <View 
          className={`w-20 h-20 rounded-full items-center justify-center mb-6 ${
            isDark ? "bg-red-500/20" : "bg-red-50"
          }`}
        >
          <AlertTriangle size={40} className="text-red-500" />
        </View>

        {/* Error Message */}
        <Text className={`text-2xl font-bold text-center mb-4 ${
          isDark ? "text-white" : "text-gray-900"
        }`}>
          Something went wrong
        </Text>
        
        <Text className={`text-lg text-center mb-8 ${
          isDark ? "text-gray-300" : "text-gray-600"
        }`}>
          We're having trouble loading your account. Please try signing out and back in.
        </Text>

        {/* Sign Out Button - Only show if user is signed in */}
        {session && (
          <TouchableOpacity onPress={handleSignOut} className="w-full max-w-sm">
            <LinearGradient 
              colors={["#ef4444", "#dc2626"]} 
              className="rounded-xl py-4 px-6 shadow-lg"
            >
              <View className="flex-row items-center justify-center">
                <LogOut size={20} className="text-white mr-2" />
                <Text className="text-white text-lg font-bold">Sign Out</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Debug Info */}
        <View className={`mt-8 p-4 rounded-lg ${
          isDark ? "bg-gray-800/50" : "bg-gray-100"
        }`}>
          <Text className={`text-sm text-center ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}>
            Session: {session ? "✓ Authenticated" : "✗ Not authenticated"}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}