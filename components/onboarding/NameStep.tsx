import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";

interface NameStepProps {
  ownerName: string;
  setOwnerName: (text: string) => void;
  errors: { ownerName: string };
  setErrors: (errors: any) => void;
  validateField: (name: string, value: string) => boolean;
}

export const NameStep: React.FC<NameStepProps> = ({ ownerName, setOwnerName, errors, setErrors, validateField }) => {
  return (
    <>
      <Input
        className={errors.ownerName ? "rounded-full border-red-500" : "rounded-full"}
        style={{ height: 56 }}
        value={ownerName}
        placeholder="Enter your full name"
        onChangeText={(text) => {
          setErrors((e: any) => ({ ...e, ownerName: "" }));
          setOwnerName(text);
        }}
        autoCapitalize="words"
        onBlur={() => validateField("ownerName", ownerName)}
      />
      {errors.ownerName ? <Text className="text-xs text-orange-500 ml-2 mt-1">{errors.ownerName}</Text> : null}
    </>
  );
};
