import React, { useState, useEffect } from "react";
import { View, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useSession } from "~/lib/auth/ctx";
import { serviceProviderService } from "~/lib/services/serviceProviderService";

export default function OnboardingScreen() {
  const { session } = useSession();
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Check if the user has already completed onboarding
    const checkOnboardingStatus = async () => {
      if (session?.user) {
        try {
          // First ensure the service provider record exists
          await serviceProviderService.createServiceProvider(session.user.id);

          // Then check if onboarding is already completed
          const isCompleted = await serviceProviderService.isOnboardingCompleted(session.user.id);
          if (isCompleted) {
            // If already completed, redirect to main app
            router.replace("/(tabs)");
          }
        } catch (error) {
          console.error("Error checking onboarding status:", error);
        }
      }
      setInitializing(false);
    };

    checkOnboardingStatus();
  }, [session]);

  const handleCompleteOnboarding = async () => {
    if (!businessName.trim() || !ownerName.trim() || !businessEmail.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(businessEmail.trim())) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      if (session?.user) {
        const success = await serviceProviderService.completeOnboarding(
          session.user.id,
          businessName.trim(),
          ownerName.trim(),
          businessEmail.trim()
        );

        if (success) {
          // Redirect to main app
          router.replace("/(tabs)");
        } else {
          Alert.alert("Error", "Failed to complete onboarding. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-muted-foreground">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center p-6 bg-background">
      <View className="gap-y-8">
        <View className="gap-y-2">
          <Text className="text-3xl font-bold text-foreground text-center">Complete Your Profile</Text>
          <Text className="text-muted-foreground text-center">
            Please provide your business information to continue
          </Text>
        </View>

        <View className="gap-y-6">
          <View className="gap-y-2">
            <Text className="text-sm font-medium text-foreground">Business Name</Text>
            <Input placeholder="Enter your business name" value={businessName} onChangeText={setBusinessName} />
          </View>

          <View className="gap-y-2">
            <Text className="text-sm font-medium text-foreground">Owner Name</Text>
            <Input placeholder="Enter owner's full name" value={ownerName} onChangeText={setOwnerName} />
          </View>

          <View className="gap-y-2">
            <Text className="text-sm font-medium text-foreground">Business Email</Text>
            <Input
              placeholder="Enter business email"
              value={businessEmail}
              onChangeText={setBusinessEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Button variant="default" className="w-full mt-4" onPress={handleCompleteOnboarding} disabled={loading}>
            <Text className="text-primary-foreground font-medium">{loading ? "Saving..." : "Complete Setup"}</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}
