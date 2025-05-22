import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";

interface BusinessNameStepProps {
  businessName: string;
  setBusinessName: (text: string) => void;
  errors: { businessName: string };
  setErrors: (errors: any) => void;
  validateField: (name: string, value: string) => boolean;
}

export const BusinessNameStep: React.FC<BusinessNameStepProps> = ({
  businessName,
  setBusinessName,
  errors,
  setErrors,
  validateField,
}) => {
  return (
    <>
      <Input
        className={errors.businessName ? "rounded-full border-red-500" : "rounded-full"}
        style={{ height: 56 }}
        value={businessName}
        placeholder="Enter your business name"
        onChangeText={(text) => {
          setErrors((e: any) => ({ ...e, businessName: "" }));
          setBusinessName(text);
        }}
        autoCapitalize="words"
        onBlur={() => validateField("businessName", businessName)}
      />
      {errors.businessName ? <Text className="text-xs text-orange-500 ml-2 mt-1">{errors.businessName}</Text> : null}
    </>
  );
};
