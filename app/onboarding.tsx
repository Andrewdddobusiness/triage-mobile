import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, TouchableOpacity, Dimensions } from "react-native";
import { router } from "expo-router";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useSession } from "~/lib/auth/ctx";
import { serviceProviderService } from "~/lib/services/serviceProviderService";
import { LinearGradient } from "expo-linear-gradient";

export default function OnboardingScreen() {
  const { session } = useSession();
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [formError, setFormError] = useState(""); // Add general form error state

  // Add error state for each field
  const [errors, setErrors] = useState({
    businessName: "",
    ownerName: "",
    businessEmail: "",
  });

  const { width } = Dimensions.get("window");

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
          setFormError("Failed to check onboarding status. Please try again.");
        }
      }
      setInitializing(false);
    };

    checkOnboardingStatus();
  }, [session]);

  // Validate individual fields
  const validateField = (name: string, value: string) => {
    let error = "";

    if (!value.trim()) {
      error = "This field cannot be empty";
    } else if (name === "businessEmail") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value.trim())) {
        error = "Please enter a valid email address";
      }
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return error === "";
  };

  // Handle field changes with validation
  const handleFieldChange = (name: string, value: string) => {
    // Clear form error when user makes changes
    if (formError) {
      setFormError("");
    }

    switch (name) {
      case "businessName":
        setBusinessName(value);
        break;
      case "ownerName":
        setOwnerName(value);
        break;
      case "businessEmail":
        setBusinessEmail(value);
        break;
    }

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCompleteOnboarding = async () => {
    // Clear any previous form errors
    setFormError("");

    // Validate all fields before submission
    const isBusinessNameValid = validateField("businessName", businessName);
    const isOwnerNameValid = validateField("ownerName", ownerName);
    const isBusinessEmailValid = validateField("businessEmail", businessEmail);

    if (!isBusinessNameValid || !isOwnerNameValid || !isBusinessEmailValid) {
      return; // Stop if any validation fails
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
          // Replace Alert with inline error
          setFormError("Failed to complete onboarding. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
      // Replace Alert with inline error
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Validate on blur
  const handleBlur = (name: string, value: string) => {
    validateField(name, value);
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
    <View className="flex-1 justify-between p-6 bg-background">
      <View className="gap-y-8">
        <View className="gap-y-2">
          <Text className="text-3xl font-bold text-foreground text-center mt-32 text-[#fe885a]">
            Complete Your Profile
          </Text>
          <Text className="text-muted-foreground text-center">
            Please provide your business information to continue.
          </Text>
        </View>

        <View className="gap-y-6 mt-8">
          <View className="gap-y-2">
            <Text className="text-sm font-medium text-foreground">Business Name</Text>
            <Input
              className={errors.businessName ? "rounded-full border-red-500" : "rounded-full"}
              placeholder="Enter your business name"
              value={businessName}
              onChangeText={(text) => handleFieldChange("businessName", text)}
              onBlur={() => handleBlur("businessName", businessName)}
            />
            {errors.businessName ? <Text className="text-xs text-red-500 ml-2 mt-1">{errors.businessName}</Text> : null}
          </View>

          <View className="gap-y-2">
            <Text className="text-sm font-medium text-foreground">Your Name</Text>
            <Input
              className={errors.ownerName ? "rounded-full border-red-500" : "rounded-full"}
              placeholder="Enter your full name"
              value={ownerName}
              onChangeText={(text) => handleFieldChange("ownerName", text)}
              onBlur={() => handleBlur("ownerName", ownerName)}
            />
            {errors.ownerName ? <Text className="text-xs text-red-500 ml-2 mt-1">{errors.ownerName}</Text> : null}
          </View>

          <View className="gap-y-2">
            <Text className="text-sm font-medium text-foreground">Work Email</Text>
            <Input
              className={errors.businessEmail ? "rounded-full border-red-500" : "rounded-full"}
              placeholder="Enter your work email"
              value={businessEmail}
              onChangeText={(text) => handleFieldChange("businessEmail", text)}
              onBlur={() => handleBlur("businessEmail", businessEmail)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.businessEmail ? (
              <Text className="text-xs text-red-500 ml-2 mt-1">{errors.businessEmail}</Text>
            ) : null}
          </View>

          {/* Form-level error message */}
          {formError ? <Text className="text-red-500 text-sm mb-4 text-center mt-2">{formError}</Text> : null}
        </View>
      </View>

      {/* Complete Setup button positioned at the bottom */}
      <LinearGradient
        colors={["#ffb351", "#fe885a", "#ffa2a3"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 9999,
          padding: 2,
          width: width - 48,
          alignSelf: "center",
          marginBottom: 16,
        }}
      >
        <TouchableOpacity
          onPress={handleCompleteOnboarding}
          disabled={loading}
          activeOpacity={0.8}
          style={{
            backgroundColor: "white",
            borderRadius: 9999,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 16,
            width: "100%",
          }}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fe885a" />
          ) : (
            <Text style={{ color: "#fe885a", fontWeight: "bold" }}>Complete Setup</Text>
          )}
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}
