import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { NameStep } from "./NameStep";
import { BusinessNameStep } from "./BusinessNameStep";
import { EmailStep } from "./EmailStep";
import { SpecialtyStep } from "./SpecialtyStep";
import { ServicesStep } from "./ServicesStep";
import { ServiceAreaStep } from "./ServiceAreaStep";

interface StepRendererProps {
  animatedStep: number;
  steps: { label: string; field: string }[];
  ownerName: string;
  setOwnerName: (text: string) => void;
  businessName: string;
  setBusinessName: (text: string) => void;
  businessEmail: string;
  setBusinessEmail: (text: string) => void;
  specialty: string[];
  setSpecialty: (specialty: string[]) => void;
  customSpecialty: string;
  setCustomSpecialty: (text: string) => void;
  showCustomSpecialty: boolean;
  setShowCustomSpecialty: (show: boolean) => void;
  servicesOffered: string[];
  setServicesOffered: (services: string[]) => void;
  customService: string;
  setCustomService: (text: string) => void;
  showCustomService: boolean;
  setShowCustomService: (show: boolean) => void;
  serviceArea: string;
  setServiceArea: (text: string) => void;
  errors: any;
  setErrors: (errors: any) => void;
  validateField: (name: string, value: string | string[]) => boolean;
  toggleSpecialty: (option: string) => void;
  toggleService: (service: string) => void;
}

export const StepRenderer: React.FC<StepRendererProps> = ({
  animatedStep,
  steps,
  ownerName,
  setOwnerName,
  businessName,
  setBusinessName,
  businessEmail,
  setBusinessEmail,
  specialty,
  setSpecialty,
  customSpecialty,
  setCustomSpecialty,
  showCustomSpecialty,
  setShowCustomSpecialty,
  servicesOffered,
  setServicesOffered,
  customService,
  setCustomService,
  showCustomService,
  setShowCustomService,
  serviceArea,
  setServiceArea,
  errors,
  setErrors,
  validateField,
  toggleSpecialty,
  toggleService,
}) => {
  const renderStepDescription = () => {
    switch (animatedStep) {
      case 0:
        return "Add your full legal name";
      case 1:
        return "What's your business called?";
      case 2:
        return "Where can clients reach you?";
      case 3:
        return "What type of trade do you specialize in?";
      case 4:
        return "What services do you offer? (Select all that apply)";
      case 5:
        return "Where do you offer your services?";
      default:
        return "";
    }
  };

  const renderInput = () => {
    const field = steps[animatedStep].field;

    switch (field) {
      case "ownerName":
        return (
          <NameStep
            ownerName={ownerName}
            setOwnerName={setOwnerName}
            errors={errors}
            setErrors={setErrors}
            validateField={validateField}
          />
        );

      case "businessName":
        return (
          <BusinessNameStep
            businessName={businessName}
            setBusinessName={setBusinessName}
            errors={errors}
            setErrors={setErrors}
            validateField={validateField}
          />
        );

      case "businessEmail":
        return (
          <EmailStep
            businessEmail={businessEmail}
            setBusinessEmail={setBusinessEmail}
            errors={errors}
            setErrors={setErrors}
            validateField={validateField}
          />
        );

      case "specialty":
        return (
          <SpecialtyStep
            specialty={specialty}
            setSpecialty={setSpecialty}
            customSpecialty={customSpecialty}
            setCustomSpecialty={setCustomSpecialty}
            showCustomSpecialty={showCustomSpecialty}
            setShowCustomSpecialty={setShowCustomSpecialty}
            errors={errors}
            setErrors={setErrors}
            toggleSpecialty={toggleSpecialty}
          />
        );

      case "servicesOffered":
        return (
          <ServicesStep
            servicesOffered={servicesOffered}
            setServicesOffered={setServicesOffered}
            customService={customService}
            setCustomService={setCustomService}
            showCustomService={showCustomService}
            setShowCustomService={setShowCustomService}
            errors={errors}
            setErrors={setErrors}
            toggleService={toggleService}
          />
        );

      case "serviceArea":
        return (
          <ServiceAreaStep
            serviceArea={serviceArea}
            setServiceArea={setServiceArea}
            errors={errors}
            setErrors={setErrors}
            validateField={validateField}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View className="gap-y-6 px-4">
      <View className="gap-y-1 px-2">
        <Text className="text-2xl font-extrabold text-orange-500">{steps[animatedStep].label}</Text>
        <Text className="text-orange-500 text-base">{renderStepDescription()}</Text>
      </View>
      <View className="px-2">{renderInput()}</View>
    </View>
  );
};
