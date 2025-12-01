import React from "react";
import { View, ActivityIndicator } from "react-native";
import { Text } from "~/components/ui/text";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";

// Import components
import { StepIndicator } from "~/components/onboarding/StepIndicator";
import { NavigationButtons } from "~/components/onboarding/NavigationButtons";
import { OnboardingStep } from "~/components/onboarding/OnboardingStep";
import { OnboardingFormRenderer } from "~/components/onboarding/OnboardingFormRenderer";

// Import hooks
import { useOnboardingFlow } from "~/lib/hooks/useOnboardingFlow";

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const {
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
    animatedStyles,
    animatedBackgroundStyle,
    validateField,
    handleNext,
    handleBack,
    toggleService,
    toggleSpecialty,
  } = useOnboardingFlow();

  if (initializing) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={"#FFA500"} />
        <Text className="mt-4 text-muted-foreground">Loading...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[{ flex: 1 }]}>
      <LinearGradient
        colors={animatedBackgroundStyle.backgroundColors || []}
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
        <StepIndicator steps={steps.length} currentStep={currentStep} />

        {/* Animated form container */}
        <OnboardingStep
          label={steps[animatedStep].label}
          description={steps[animatedStep].description}
          animatedStyles={animatedStyles}
          formError={formError}
        >
          <OnboardingFormRenderer
            currentStep={animatedStep}
            formData={formData}
            updateFormField={updateFormField}
            errors={errors}
            setErrors={setErrors}
            validateField={validateField}
            specialtyOptions={specialtyOptions}
            servicesOfferedOptions={servicesOfferedOptions}
            toggleSpecialty={toggleSpecialty}
            toggleService={toggleService}
            showCustomSpecialty={showCustomSpecialty}
            showCustomService={showCustomService}
            customSpecialty={customSpecialty}
            setCustomSpecialty={setCustomSpecialty}
            customService={customService}
            setCustomService={setCustomService}
          />
        </OnboardingStep>

        {/* Navigation buttons */}
        <NavigationButtons
          handleNext={handleNext}
          handleBack={handleBack}
          loading={loading}
          isLastStep={currentStep === steps.length - 1}
          currentStep={currentStep}
        />
      </LinearGradient>
    </Animated.View>
  );
}
