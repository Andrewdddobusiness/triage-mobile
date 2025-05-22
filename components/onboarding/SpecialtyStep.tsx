import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { Check } from "lucide-react-native";

interface SpecialtyStepProps {
  specialty: string[];
  setSpecialty: (specialty: string[]) => void;
  customSpecialty: string;
  setCustomSpecialty: (text: string) => void;
  showCustomSpecialty: boolean;
  setShowCustomSpecialty: (show: boolean) => void;
  errors: { specialty: string };
  setErrors: (errors: any) => void;
  toggleSpecialty: (option: string) => void;
}

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

export const SpecialtyStep: React.FC<SpecialtyStepProps> = ({
  specialty,
  setSpecialty,
  customSpecialty,
  setCustomSpecialty,
  showCustomSpecialty,
  setShowCustomSpecialty,
  errors,
  setErrors,
  toggleSpecialty,
}) => {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="flex-row flex-wrap justify-between">
        {specialtyOptions.map((option) => (
          <TouchableOpacity
            key={option}
            className={`p-4 rounded-full border mb-3 ${
              specialty.includes(option) ? "border-orange-500 bg-orange-50" : "border-gray-300"
            }`}
            style={{ width: "48%" }}
            onPress={() => {
              setErrors((e: any) => ({ ...e, specialty: "" }));
              toggleSpecialty(option);
            }}
          >
            <View className="flex-row justify-between items-center">
              <Text className={specialty.includes(option) ? "text-orange-500 font-medium" : "text-gray-700"}>
                {option}
              </Text>
              {specialty.includes(option) && <Check size={20} color="#fe885a" />}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {showCustomSpecialty && (
        <Input
          className="rounded-full mt-2"
          style={{ height: 56 }}
          value={customSpecialty}
          placeholder="Enter your specialty"
          onChangeText={(text) => {
            setCustomSpecialty(text);
            if (text.trim()) {
              setErrors((e: any) => ({ ...e, specialty: "" }));
            }
          }}
          autoCapitalize="words"
        />
      )}
      {errors.specialty ? <Text className="text-xs text-orange-500 ml-2 mt-1">{errors.specialty}</Text> : null}
    </ScrollView>
  );
};
