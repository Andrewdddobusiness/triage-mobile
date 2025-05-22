import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";

interface TextInputStepProps {
  value: string;
  placeholder: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}

export const TextInputStep: React.FC<TextInputStepProps> = ({
  value,
  placeholder,
  onChangeText,
  onBlur,
  error,
  keyboardType = "default",
  autoCapitalize = "words",
}) => {
  return (
    <>
      <Input
        className={error ? "rounded-full border-red-500" : "rounded-full"}
        style={{ height: 56 }}
        value={value}
        placeholder={placeholder}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        onBlur={onBlur}
      />
      {error ? <Text className="text-xs text-orange-500 ml-2 mt-1">{error}</Text> : null}
    </>
  );
};
