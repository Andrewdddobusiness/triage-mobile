import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, TouchableOpacity, Dimensions } from "react-native";
import { router } from "expo-router";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { useSession } from "~/lib/auth/ctx";
import { serviceProviderService } from "~/lib/services/serviceProviderService";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
  interpolateColor,
} from "react-native-reanimated";

export default function OnboardingScreen() {
  const { session } = useSession();
  const insets = useSafeAreaInsets();
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [formError, setFormError] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [animatedStep, setAnimatedStep] = useState(0);

  const [errors, setErrors] = useState({
    businessName: "",
    ownerName: "",
    businessEmail: "",
  });

  const transition = useSharedValue(1);
  const colorTransition = useSharedValue(0); // For background color transitions
  const { width } = Dimensions.get("window");

  // Define gradient colors for each step
  const gradientColors = [
    ["#f8f9fa", "#e9ecef", "#ffb351"],
    ["#f8f9fa", "#e9ecef", "#fe885a"],
    ["#f8f9fa", "#e9ecef", "#ffa2a3"],
  ];

  const steps = [
    { label: "Your Name", field: "ownerName" },
    { label: "Business Name", field: "businessName" },
    { label: "Work Email", field: "businessEmail" },
  ];

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (session?.user) {
        try {
          await serviceProviderService.createServiceProvider(session.user.id);
          const isCompleted = await serviceProviderService.isOnboardingCompleted(session.user.id);
          if (isCompleted) router.replace("/(tabs)");
        } catch (error) {
          setFormError("Failed to check onboarding status. Please try again.");
        }
      }
      setInitializing(false);
    };

    checkOnboardingStatus();
  }, [session]);

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

  const handleCompleteOnboarding = async () => {
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
          // Change this line to redirect to assignPhoneNumber instead of (tabs)
          router.replace("/assignPhoneNumber");
        } else {
          setFormError("Failed to complete onboarding. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    setFormError("");

    const currentField = steps[currentStep].field;
    const currentValue =
      currentField === "ownerName" ? ownerName : currentField === "businessName" ? businessName : businessEmail;

    const isValid = validateField(currentField, currentValue);
    if (!isValid) return;

    if (currentStep === steps.length - 1) {
      // No animation — just complete onboarding
      handleCompleteOnboarding();
    } else {
      // Animate out, update step, animate in
      transition.value = withTiming(0, { duration: 200 }, (finished) => {
        if (finished) {
          runOnJS(setAnimatedStep)(currentStep + 1);
          runOnJS(setCurrentStep)(currentStep + 1);
          transition.value = withTiming(1, { duration: 200 });
        }
      });

      // Animate background color transition
      colorTransition.value = withTiming(currentStep + 1, {
        duration: 800,
        easing: Easing.inOut(Easing.ease),
      });
    }
  };

  const animatedStyles = useAnimatedStyle(() => ({
    opacity: transition.value,
    transform: [
      {
        translateX: 0,
      },
    ],
  }));

  // Animated background style
  const animatedBackgroundStyle = useAnimatedStyle(() => {
    // Interpolate between the current step colors and the next step colors
    const backgroundColor1 = interpolateColor(
      colorTransition.value,
      [0, 1, 2],
      [gradientColors[0][0], gradientColors[1][0], gradientColors[2][0]]
    );

    const backgroundColor2 = interpolateColor(
      colorTransition.value,
      [0, 1, 2],
      [gradientColors[0][1], gradientColors[1][1], gradientColors[2][1]]
    );

    const backgroundColor3 = interpolateColor(
      colorTransition.value,
      [0, 1, 2],
      [gradientColors[0][2], gradientColors[1][2], gradientColors[2][2]]
    );

    return {
      backgroundColor: backgroundColor1,
      // Return the colors in the expected format
      backgroundColors: [backgroundColor1, backgroundColor2, backgroundColor3] as readonly [string, string, string],
    };
  });

  if (initializing) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-muted-foreground">Loading...</Text>
      </View>
    );
  }

  const renderInput = () => {
    const field = steps[animatedStep].field;
    const value = field === "ownerName" ? ownerName : field === "businessName" ? businessName : businessEmail;

    const placeholder =
      field === "ownerName"
        ? "Enter your full name"
        : field === "businessName"
        ? "Enter your business name"
        : "Enter your work email";

    const error = errors[field as keyof typeof errors];

    return (
      <>
        <Input
          className={error ? "rounded-full border-red-500" : "rounded-full"}
          style={{ height: 56 }}
          value={value}
          placeholder={placeholder}
          onChangeText={(text) => {
            setErrors((e) => ({ ...e, [field]: "" }));
            if (field === "ownerName") setOwnerName(text);
            else if (field === "businessName") setBusinessName(text);
            else setBusinessEmail(text);
          }}
          keyboardType={field === "businessEmail" ? "email-address" : "default"}
          autoCapitalize={field === "businessEmail" ? "none" : "words"}
          onBlur={() => validateField(field, value)}
        />
        {error ? <Text className="text-xs text-orange-500 ml-2 mt-1">{error}</Text> : null}
      </>
    );
  };

  return (
    <Animated.View style={[{ flex: 1 }]}>
      <LinearGradient
        colors={animatedBackgroundStyle.backgroundColors || gradientColors[currentStep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flex: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
        className="px-6 justify-between"
      >
        {/* Progress indicators */}
        <View className="flex-row justify-center gap-x-2 mt-10">
          {steps.map((_, i) => (
            <View
              key={i}
              className={`h-1 rounded-full ${i <= currentStep ? "bg-orange-500" : "bg-orange-200"}`}
              style={{ width: width / (steps.length + 2) }}
            />
          ))}
        </View>

        {/* Animated form container */}
        <Animated.View style={[animatedStyles]} className="flex-1 w-full mt-10 gap-y-6 px-4">
          <View className="gap-y-1 px-2">
            <Text className="text-2xl font-extrabold text-orange-500">{steps[animatedStep].label}</Text>
            <Text className="text-orange-500 text-base">
              {animatedStep === 0
                ? "Add your full legal name"
                : animatedStep === 1
                ? "What's your business called?"
                : "Where can clients reach you?"}
            </Text>
          </View>
          <View className="px-2">{renderInput()}</View>
          {formError ? <Text className="text-orange-500 text-sm text-center mt-2">{formError}</Text> : null}
        </Animated.View>

        {/* Next / Complete button */}
        <LinearGradient
          colors={["#fe885a", "#ffb351"]}
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
            onPress={handleNext}
            disabled={loading}
            activeOpacity={0.8}
            style={{
              backgroundColor: "#fe885a",
              borderRadius: 9999,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 16,
              width: "100%",
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={{ color: "white", fontWeight: "bold" }}>
                {currentStep === steps.length - 1 ? "Complete Setup" : "Next"}
              </Text>
            )}
          </TouchableOpacity>
        </LinearGradient>

        {currentStep === steps.length - 1 ? (
          <LinearGradient
            colors={["#ffb351", "#fe885a", "#ffa2a3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 9999, // fully rounded
              padding: 2, // thickness of the border
              width: width - 48,
              alignSelf: "center",
            }}
          >
            <TouchableOpacity
              onPress={handleNext}
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
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={{ color: "#fe885a", fontWeight: "bold" }}>Back</Text>
              )}
            </TouchableOpacity>
          </LinearGradient>
        ) : (
          <></>
        )}
      </LinearGradient>
    </Animated.View>
  );
}
