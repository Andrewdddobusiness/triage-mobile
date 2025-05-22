import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { Check } from "lucide-react-native";

interface MultiSelectStepProps {
  options: string[];
  selectedOptions: string[];
  toggleOption: (option: string) => void;
  showCustomInput: boolean;
  customValue: string;
  setCustomValue: (text: string) => void;
  customPlaceholder: string;
  error?: string;
}

export const MultiSelectStep: React.FC<MultiSelectStepProps> = ({
  options,
  selectedOptions,
  toggleOption,
  showCustomInput,
  customValue,
  setCustomValue,
  customPlaceholder,
  error,
}) => {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="flex-row flex-wrap justify-between">
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            className={`p-4 rounded-full border mb-3 ${
              selectedOptions.includes(option) ? "border-orange-500 bg-orange-50" : "border-gray-300"
            }`}
            style={{ width: "48%" }}
            onPress={() => toggleOption(option)}
          >
            <View className="flex-row justify-between items-center">
              <Text className={selectedOptions.includes(option) ? "text-orange-500 font-medium" : "text-gray-700"}>
                {option}
              </Text>
              {selectedOptions.includes(option) && <Check size={20} color="#fe885a" />}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {showCustomInput && (
        <Input
          className={
            selectedOptions.includes("Other") && !customValue.trim()
              ? "rounded-full mt-2 border-red-500"
              : "rounded-full mt-2"
          }
          style={{ height: 56 }}
          value={customValue}
          placeholder={customPlaceholder}
          onChangeText={setCustomValue}
          autoCapitalize="words"
        />
      )}
      {error ? <Text className="text-xs text-orange-500 ml-2 mt-1">{error}</Text> : null}
    </ScrollView>
  );
};
