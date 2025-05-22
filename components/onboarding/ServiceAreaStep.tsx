import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";

interface ServiceAreaStepProps {
  serviceArea: string;
  setServiceArea: (text: string) => void;
  errors: { serviceArea: string };
  setErrors: (errors: any) => void;
  validateField: (name: string, value: string) => boolean;
}

export const ServiceAreaStep: React.FC<ServiceAreaStepProps> = ({
  serviceArea,
  setServiceArea,
  errors,
  setErrors,
  validateField,
}) => {
  return (
    <>
      <Input
        className={errors.serviceArea ? "rounded-full border-red-500" : "rounded-full"}
        style={{ height: 56 }}
        value={serviceArea}
        placeholder="Enter your service area (e.g., Sydney, NSW)"
        onChangeText={(text) => {
          setErrors((e: any) => ({ ...e, serviceArea: "" }));
          setServiceArea(text);
        }}
        autoCapitalize="words"
        onBlur={() => validateField("serviceArea", serviceArea)}
      />
      {errors.serviceArea ? <Text className="text-xs text-orange-500 ml-2 mt-1">{errors.serviceArea}</Text> : null}
    </>
  );
};
