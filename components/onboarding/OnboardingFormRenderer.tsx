import React from "react";
import { TextInputStep } from "./TextInputStep";
import { MultiSelectStep } from "./MultiSelectStep";
import { ServiceAreaStep } from "./ServiceAreaStep";
import { OnboardingFormData, OnboardingFormErrors } from "~/lib/types/onboarding";

interface OnboardingFormRendererProps {
  currentStep: number;
  formData: OnboardingFormData;
  updateFormField: (field: keyof OnboardingFormData, value: string | string[]) => void;
  errors: OnboardingFormErrors;
  setErrors: React.Dispatch<React.SetStateAction<OnboardingFormErrors>>;
  validateField: (name: string, value: string | string[]) => boolean;
  specialtyOptions: string[];
  servicesOfferedOptions: string[];
  toggleSpecialty: (option: string) => void;
  toggleService: (service: string) => void;
  showCustomSpecialty: boolean;
  showCustomService: boolean;
  customSpecialty: string;
  setCustomSpecialty: (value: string) => void;
  customService: string;
  setCustomService: (value: string) => void;
}

export const OnboardingFormRenderer: React.FC<OnboardingFormRendererProps> = ({
  currentStep,
  formData,
  updateFormField,
  errors,
  setErrors,
  validateField,
  specialtyOptions,
  servicesOfferedOptions,
  toggleSpecialty,
  toggleService,
  showCustomSpecialty,
  showCustomService,
  customSpecialty,
  setCustomSpecialty,
  customService,
  setCustomService,
}) => {
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // ownerName
        return (
          <TextInputStep
            value={formData.ownerName}
            placeholder="Enter your full name"
            onChangeText={(text) => {
              setErrors((e) => ({ ...e, ownerName: "" }));
              updateFormField("ownerName", text);
            }}
            onBlur={() => validateField("ownerName", formData.ownerName)}
            error={errors.ownerName}
            autoCapitalize="words"
          />
        );

      case 1: // businessName
        return (
          <TextInputStep
            value={formData.businessName}
            placeholder="Enter your business name"
            onChangeText={(text) => {
              setErrors((e) => ({ ...e, businessName: "" }));
              updateFormField("businessName", text);
            }}
            onBlur={() => validateField("businessName", formData.businessName)}
            error={errors.businessName}
            autoCapitalize="words"
          />
        );

      case 2: // businessEmail
        return (
          <TextInputStep
            value={formData.businessEmail}
            placeholder="Enter your work email"
            onChangeText={(text) => {
              setErrors((e) => ({ ...e, businessEmail: "" }));
              updateFormField("businessEmail", text);
            }}
            onBlur={() => validateField("businessEmail", formData.businessEmail)}
            error={errors.businessEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        );

      case 3: // specialty
        return (
          <MultiSelectStep
            options={specialtyOptions}
            selectedOptions={formData.specialty}
            toggleOption={(option) => {
              setErrors((e) => ({ ...e, specialty: "" }));
              toggleSpecialty(option);
            }}
            showCustomInput={showCustomSpecialty}
            customValue={customSpecialty}
            setCustomValue={(text) => {
              setCustomSpecialty(text);
              if (text.trim()) {
                setErrors((e) => ({ ...e, specialty: "" }));
              }
            }}
            customPlaceholder="Enter your specialty"
            error={errors.specialty}
          />
        );

      case 4: // servicesOffered
        return (
          <MultiSelectStep
            options={servicesOfferedOptions}
            selectedOptions={formData.servicesOffered}
            toggleOption={(option) => {
              setErrors((e) => ({ ...e, servicesOffered: "" }));
              toggleService(option);
            }}
            showCustomInput={showCustomService}
            customValue={customService}
            setCustomValue={(text) => {
              setCustomService(text);
              if (text.trim()) {
                setErrors((e) => ({ ...e, servicesOffered: "" }));
              }
            }}
            customPlaceholder="Enter your custom service"
            error={errors.servicesOffered}
          />
        );

      case 5: // serviceArea
        return (
          <ServiceAreaStep
            serviceArea={formData.serviceArea}
            setServiceArea={(text) => updateFormField("serviceArea", text)}
            errors={errors}
            setErrors={setErrors}
            validateField={validateField}
          />
        );

      default:
        return null;
    }
  };

  return renderStepContent();
};
