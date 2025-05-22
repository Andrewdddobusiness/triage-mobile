import { useState, useEffect } from "react";
import { router } from "expo-router";
import { withTiming, Easing, runOnJS } from "react-native-reanimated";
import { useSession } from "~/lib/auth/ctx";
import { serviceProviderService } from "~/lib/services/serviceProviderService";
import { OnboardingFormData, OnboardingFormErrors, OnboardingStepConfig } from "~/lib/types/onboarding";
import { useAnimatedGradient } from "./useAnimatedGradient";

export const useOnboardingFlow = () => {
  const { session } = useSession();
  const [formData, setFormData] = useState<OnboardingFormData>({
    businessName: "",
    ownerName: "",
    businessEmail: "",
    specialty: [],
    servicesOffered: [],
    serviceArea: "",
  });

  const [customSpecialty, setCustomSpecialty] = useState("");
  const [customService, setCustomService] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [formError, setFormError] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [animatedStep, setAnimatedStep] = useState(0);
  const [showCustomSpecialty, setShowCustomSpecialty] = useState(false);
  const [showCustomService, setShowCustomService] = useState(false);

  const [errors, setErrors] = useState<OnboardingFormErrors>({
    businessName: "",
    ownerName: "",
    businessEmail: "",
    specialty: "",
    servicesOffered: "",
    serviceArea: "",
  });

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

  const steps: OnboardingStepConfig[] = [
    { label: "Your Name", field: "ownerName", description: "Add your full legal name" },
    { label: "Business Name", field: "businessName", description: "What's your business called?" },
    { label: "Work Email", field: "businessEmail", description: "Where can clients reach you?" },
    { label: "Trade Type", field: "specialty", description: "What type of trade do you specialize in?" },
    {
      label: "Services Offered",
      field: "servicesOffered",
      description: "What services do you offer? (Select all that apply)",
    },
    { label: "Service Area", field: "serviceArea", description: "Where do you offer your services?" },
  ];

  const { transition, colorTransition, animatedStyles, animatedBackgroundStyle } = useAnimatedGradient(gradientColors);

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
        let finalSpecialties = [...formData.specialty];
        if (formData.specialty.includes("Other") && customSpecialty.trim()) {
          finalSpecialties = finalSpecialties.filter((s) => s !== "Other");
          finalSpecialties.push(customSpecialty.trim());
        }

        // Prepare services offered (handle custom service)
        let finalServicesOffered = [...formData.servicesOffered];
        if (formData.servicesOffered.includes("Other") && customService.trim()) {
          finalServicesOffered = finalServicesOffered.filter((s) => s !== "Other");
          finalServicesOffered.push(customService.trim());
        }

        const success = await serviceProviderService.completeOnboardingWithDetails(
          session.user.id,
          formData.businessName.trim(),
          formData.ownerName.trim(),
          formData.businessEmail.trim(),
          finalSpecialties,
          finalServicesOffered,
          formData.serviceArea.trim()
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
    let currentValue: string | string[] = formData[currentField];

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

    const updatedServices = formData.servicesOffered.includes(service)
      ? formData.servicesOffered.filter((s) => s !== service)
      : [...formData.servicesOffered, service];

    setFormData({
      ...formData,
      servicesOffered: updatedServices,
    });

    if (formData.servicesOffered.includes(service) && service === "Other") {
      setShowCustomService(false);
      setCustomService("");
    }
  };

  const toggleSpecialty = (option: string) => {
    if (option === "Other") {
      setShowCustomSpecialty(true);
    }

    const updatedSpecialties = formData.specialty.includes(option)
      ? formData.specialty.filter((s) => s !== option)
      : [...formData.specialty, option];

    setFormData({
      ...formData,
      specialty: updatedSpecialties,
    });

    if (formData.specialty.includes(option) && option === "Other") {
      setShowCustomSpecialty(false);
      setCustomSpecialty("");
    }
  };

  const updateFormField = (field: keyof OnboardingFormData, value: string | string[]) => {
    setFormData({
      ...formData,
      [field]: value,
    });

    // Clear error when updating field
    if (typeof value === "string") {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return {
    formData,
    updateFormField,
    customSpecialty,
    setCustomSpecialty,
    customService,
    setCustomService,
    loading,
    initializing,
    formError,
    currentStep,
    animatedStep,
    showCustomSpecialty,
    showCustomService,
    errors,
    setErrors,
    steps,
    specialtyOptions,
    servicesOfferedOptions,
    gradientColors,
    transition,
    colorTransition,
    animatedStyles,
    animatedBackgroundStyle,
    validateField,
    handleNext,
    handleBack,
    toggleService,
    toggleSpecialty,
  };
};
