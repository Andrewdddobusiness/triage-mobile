import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, TouchableOpacity, Dimensions, ScrollView, FlatList } from "react-native";
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
import { Check } from "lucide-react-native";

export default function OnboardingScreen() {
  const { session } = useSession();
  const insets = useSafeAreaInsets();
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [specialty, setSpecialty] = useState<string[]>([]);
  const [customSpecialty, setCustomSpecialty] = useState("");
  const [servicesOffered, setServicesOffered] = useState<string[]>([]);
  const [customService, setCustomService] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [formError, setFormError] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [animatedStep, setAnimatedStep] = useState(0);
  const [showCustomSpecialty, setShowCustomSpecialty] = useState(false);
  const [showCustomService, setShowCustomService] = useState(false);

  const [errors, setErrors] = useState({
    businessName: "",
    ownerName: "",
    businessEmail: "",
    specialty: "",
    servicesOffered: "",
    serviceArea: "",
  });

  const transition = useSharedValue(1);
  const colorTransition = useSharedValue(0); // For background color transitions
  const { width } = Dimensions.get("window");

  // Define gradient colors for each step
  const gradientColors = [
    ["#f8f9fa", "#e9ecef", "#ffb351"],
    ["#f8f9fa", "#e9ecef", "#fe885a"],
    ["#f8f9fa", "#e9ecef", "#ffa2a3"],
    ["#f8f9fa", "#e9ecef", "#ffb351"],
    ["#f8f9fa", "#e9ecef", "#fe885a"],
    ["#f8f9fa", "#e9ecef", "#ffa2a3"],
  ];

  const specialtyOptions = [
    "Builder",
    "Electrician",
    "Plumber",
    "Carpenter",
    "Landscaper",
    "Painter",
    "Roofer",
    "Tiler",
    "Handyman",
    "Other",
  ];

  const servicesOfferedOptions = [
    "New Builds",
    "Renovations",
    "Repairs",
    "Installations",
    "Emergency Call-Outs",
    "Inspections",
    "Custom Work",
    "Other",
  ];

  const steps = [
    { label: "Your Name", field: "ownerName" },
    { label: "Business Name", field: "businessName" },
    { label: "Work Email", field: "businessEmail" },
    { label: "Trade Type", field: "specialty" },
    { label: "Services Offered", field: "servicesOffered" },
    { label: "Service Area", field: "serviceArea" },
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

  const validateField = (name: string, value: string | string[]) => {
    let error = "";
    if (name === "servicesOffered" || name === "specialty") {
      if ((value as string[]).length === 0) {
        error = name === "specialty" ? "Please select at least one trade type" : "Please select at least one service";
      } else if (name === "specialty" && (value as string[]).includes("Other") && !customSpecialty.trim()) {
        error = "Please specify your specialty";
      } else if (name === "servicesOffered" && (value as string[]).includes("Other") && !customService.trim()) {
        error = "Please specify your custom service";
      }
    } else if (!value || (typeof value === "string" && !value.trim())) {
      error = "This field cannot be empty";
    } else if (name === "businessEmail") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value as string)) {
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
        // Prepare the specialty values (handle custom specialty)
        let finalSpecialties = [...specialty];
        if (specialty.includes("Other") && customSpecialty.trim()) {
          finalSpecialties = finalSpecialties.filter((s) => s !== "Other");
          finalSpecialties.push(customSpecialty.trim());
        }

        // Prepare services offered (handle custom service)
        let finalServicesOffered = [...servicesOffered];
        if (servicesOffered.includes("Other") && customService.trim()) {
          finalServicesOffered = finalServicesOffered.filter((s) => s !== "Other");
          finalServicesOffered.push(customService.trim());
        }

        const success = await serviceProviderService.completeOnboardingWithDetails(
          session.user.id,
          businessName.trim(),
          ownerName.trim(),
          businessEmail.trim(),
          finalSpecialties,
          finalServicesOffered,
          serviceArea.trim()
        );

        if (success) {
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
    let currentValue: string | string[] = "";

    switch (currentField) {
      case "ownerName":
        currentValue = ownerName;
        break;
      case "businessName":
        currentValue = businessName;
        break;
      case "businessEmail":
        currentValue = businessEmail;
        break;
      case "specialty":
        currentValue = specialty;
        break;
      case "servicesOffered":
        currentValue = servicesOffered;
        break;
      case "serviceArea":
        currentValue = serviceArea;
        break;
    }

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

  const handleBack = () => {
    if (currentStep > 0) {
      // Animate out, update step, animate in
      transition.value = withTiming(0, { duration: 200 }, (finished) => {
        if (finished) {
          runOnJS(setAnimatedStep)(currentStep - 1);
          runOnJS(setCurrentStep)(currentStep - 1);
          transition.value = withTiming(1, { duration: 200 });
        }
      });

      // Animate background color transition
      colorTransition.value = withTiming(currentStep - 1, {
        duration: 800,
        easing: Easing.inOut(Easing.ease),
      });
    }
  };

  const toggleService = (service: string) => {
    if (service === "Other") {
      setShowCustomService(true);
    }

    if (servicesOffered.includes(service)) {
      setServicesOffered(servicesOffered.filter((s) => s !== service));
      if (service === "Other") {
        setShowCustomService(false);
        setCustomService("");
      }
    } else {
      setServicesOffered([...servicesOffered, service]);
    }
  };

  const toggleSpecialty = (option: string) => {
    if (option === "Other") {
      setShowCustomSpecialty(true);
    }

    if (specialty.includes(option)) {
      setSpecialty(specialty.filter((s) => s !== option));
      if (option === "Other") {
        setShowCustomSpecialty(false);
        setCustomSpecialty("");
      }
    } else {
      setSpecialty([...specialty, option]);
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
      [0, 1, 2, 3, 4, 5],
      [
        gradientColors[0][0],
        gradientColors[1][0],
        gradientColors[2][0],
        gradientColors[3][0],
        gradientColors[4][0],
        gradientColors[5][0],
      ]
    );

    const backgroundColor2 = interpolateColor(
      colorTransition.value,
      [0, 1, 2, 3, 4, 5],
      [
        gradientColors[0][1],
        gradientColors[1][1],
        gradientColors[2][1],
        gradientColors[3][1],
        gradientColors[4][1],
        gradientColors[5][1],
      ]
    );

    const backgroundColor3 = interpolateColor(
      colorTransition.value,
      [0, 1, 2, 3, 4, 5],
      [
        gradientColors[0][2],
        gradientColors[1][2],
        gradientColors[2][2],
        gradientColors[3][2],
        gradientColors[4][2],
        gradientColors[5][2],
      ]
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

    switch (field) {
      case "ownerName":
        return (
          <>
            <Input
              className={errors.ownerName ? "rounded-full border-red-500" : "rounded-full"}
              style={{ height: 56 }}
              value={ownerName}
              placeholder="Enter your full name"
              onChangeText={(text) => {
                setErrors((e) => ({ ...e, ownerName: "" }));
                setOwnerName(text);
              }}
              autoCapitalize="words"
              onBlur={() => validateField("ownerName", ownerName)}
            />
            {errors.ownerName ? <Text className="text-xs text-orange-500 ml-2 mt-1">{errors.ownerName}</Text> : null}
          </>
        );

      case "businessName":
        return (
          <>
            <Input
              className={errors.businessName ? "rounded-full border-red-500" : "rounded-full"}
              style={{ height: 56 }}
              value={businessName}
              placeholder="Enter your business name"
              onChangeText={(text) => {
                setErrors((e) => ({ ...e, businessName: "" }));
                setBusinessName(text);
              }}
              autoCapitalize="words"
              onBlur={() => validateField("businessName", businessName)}
            />
            {errors.businessName ? (
              <Text className="text-xs text-orange-500 ml-2 mt-1">{errors.businessName}</Text>
            ) : null}
          </>
        );

      case "businessEmail":
        return (
          <>
            <Input
              className={errors.businessEmail ? "rounded-full border-red-500" : "rounded-full"}
              style={{ height: 56 }}
              value={businessEmail}
              placeholder="Enter your work email"
              onChangeText={(text) => {
                setErrors((e) => ({ ...e, businessEmail: "" }));
                setBusinessEmail(text);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              onBlur={() => validateField("businessEmail", businessEmail)}
            />
            {errors.businessEmail ? (
              <Text className="text-xs text-orange-500 ml-2 mt-1">{errors.businessEmail}</Text>
            ) : null}
          </>
        );

      case "specialty":
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="flex-row flex-wrap justify-between">
              {specialtyOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  className={`p-4 rounded-full border mb-3 ${
                    specialty.includes(option) ? "border-orange-500 bg-orange-50" : "border-gray-300"
                  }`}
                  style={{ width: "48%" }}
                  onPress={() => {
                    setErrors((e) => ({ ...e, specialty: "" }));
                    toggleSpecialty(option);
                  }}
                >
                  <View className="flex-row justify-between items-center">
                    <Text className={specialty.includes(option) ? "text-orange-500 font-medium" : "text-gray-700"}>
                      {option}
                    </Text>
                    {specialty.includes(option) && <Check size={20} color="#fe885a" />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {showCustomSpecialty && (
              <Input
                className="rounded-full mt-2"
                style={{ height: 56 }}
                value={customSpecialty}
                placeholder="Enter your specialty"
                onChangeText={(text) => {
                  setCustomSpecialty(text);
                  if (text.trim()) {
                    setErrors((e) => ({ ...e, specialty: "" }));
                  }
                }}
                autoCapitalize="words"
              />
            )}
            {errors.specialty ? <Text className="text-xs text-orange-500 ml-2 mt-1">{errors.specialty}</Text> : null}
          </ScrollView>
        );

      case "servicesOffered":
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="flex-row flex-wrap justify-between">
              {servicesOfferedOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  className={`p-4 rounded-full border mb-3 ${
                    servicesOffered.includes(option) ? "border-orange-500 bg-orange-50" : "border-gray-300"
                  }`}
                  style={{ width: "48%" }}
                  onPress={() => {
                    setErrors((e) => ({ ...e, servicesOffered: "" }));
                    toggleService(option);
                  }}
                >
                  <View className="flex-row justify-between items-center">
                    <Text
                      className={servicesOffered.includes(option) ? "text-orange-500 font-medium" : "text-gray-700"}
                    >
                      {option}
                    </Text>
                    {servicesOffered.includes(option) && <Check size={20} color="#fe885a" />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {showCustomService && (
              <Input
                className={
                  servicesOffered.includes("Other") && !customService.trim()
                    ? "rounded-full mt-2 border-red-500"
                    : "rounded-full mt-2"
                }
                style={{ height: 56 }}
                value={customService}
                placeholder="Enter your custom service"
                onChangeText={(text) => {
                  setCustomService(text);
                  if (text.trim()) {
                    setErrors((e) => ({ ...e, servicesOffered: "" }));
                  }
                }}
                autoCapitalize="words"
              />
            )}
            {errors.servicesOffered ? (
              <Text className="text-xs text-orange-500 ml-2 mt-1">{errors.servicesOffered}</Text>
            ) : null}
          </ScrollView>
        );

      case "serviceArea":
        return (
          <>
            <Input
              className={errors.serviceArea ? "rounded-full border-red-500" : "rounded-full"}
              style={{ height: 56 }}
              value={serviceArea}
              placeholder="Enter your service area (e.g., Sydney, NSW)"
              onChangeText={(text) => {
                setErrors((e) => ({ ...e, serviceArea: "" }));
                setServiceArea(text);
              }}
              autoCapitalize="words"
              onBlur={() => validateField("serviceArea", serviceArea)}
            />
            {errors.serviceArea ? (
              <Text className="text-xs text-orange-500 ml-2 mt-1">{errors.serviceArea}</Text>
            ) : null}
          </>
        );

      default:
        return null;
    }
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
                : animatedStep === 2
                ? "Where can clients reach you?"
                : animatedStep === 3
                ? "What type of trade do you specialize in?"
                : animatedStep === 4
                ? "What services do you offer? (Select all that apply)"
                : "Where do you offer your services?"}
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

        {/* Back button */}
        {currentStep > 0 ? (
          <LinearGradient
            colors={["#ffb351", "#fe885a", "#ffa2a3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 9999, // fully rounded
              padding: 2, // thickness of the border
              width: width - 48,
              alignSelf: "center",
              marginBottom: 16,
            }}
          >
            <TouchableOpacity
              onPress={handleBack}
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
                <Text style={{ color: "#fe885a", fontWeight: "bold" }}>Back</Text>
              )}
            </TouchableOpacity>
          </LinearGradient>
        ) : null}
      </LinearGradient>
    </Animated.View>
  );
}
