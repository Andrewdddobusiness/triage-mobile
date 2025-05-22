import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";

interface EmailStepProps {
  businessEmail: string;
  setBusinessEmail: (text: string) => void;
  errors: { businessEmail: string };
  setErrors: (errors: any) => void;
  validateField: (name: string, value: string) => boolean;
}

export const EmailStep: React.FC<EmailStepProps> = ({
  businessEmail,
  setBusinessEmail,
  errors,
  setErrors,
  validateField,
}) => {
  return (
    <>
      <Input
        className={errors.businessEmail ? "rounded-full border-red-500" : "rounded-full"}
        style={{ height: 56 }}
        value={businessEmail}
        placeholder="Enter your work email"
        onChangeText={(text) => {
          setErrors((e: any) => ({ ...e, businessEmail: "" }));
          setBusinessEmail(text);
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        onBlur={() => validateField("businessEmail", businessEmail)}
      />
      {errors.businessEmail ? <Text className="text-xs text-orange-500 ml-2 mt-1">{errors.businessEmail}</Text> : null}
    </>
  );
};
