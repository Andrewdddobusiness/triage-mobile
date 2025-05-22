import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { Check } from "lucide-react-native";

interface ServicesStepProps {
  servicesOffered: string[];
  setServicesOffered: (services: string[]) => void;
  customService: string;
  setCustomService: (text: string) => void;
  showCustomService: boolean;
  setShowCustomService: (show: boolean) => void;
  errors: { servicesOffered: string };
  setErrors: (errors: any) => void;
  toggleService: (service: string) => void;
}

const servicesOfferedOptions = [
  "New Builds",
  "Renovations",
  "Repairs",
  "Installations",
  "Emergency Call-Outs",
  "Inspections",
  "Custom Work",
  "Other",
];

export const ServicesStep: React.FC<ServicesStepProps> = ({
  servicesOffered,
  setServicesOffered,
  customService,
  setCustomService,
  showCustomService,
  setShowCustomService,
  errors,
  setErrors,
  toggleService,
}) => {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="flex-row flex-wrap justify-between">
        {servicesOfferedOptions.map((option) => (
          <TouchableOpacity
            key={option}
            className={`p-4 rounded-full border mb-3 ${
              servicesOffered.includes(option) ? "border-orange-500 bg-orange-50" : "border-gray-300"
            }`}
            style={{ width: "48%" }}
            onPress={() => {
              setErrors((e: any) => ({ ...e, servicesOffered: "" }));
              toggleService(option);
            }}
          >
            <View className="flex-row justify-between items-center">
              <Text className={servicesOffered.includes(option) ? "text-orange-500 font-medium" : "text-gray-700"}>
                {option}
              </Text>
              {servicesOffered.includes(option) && <Check size={20} color="#fe885a" />}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {showCustomService && (
        <Input
          className={
            servicesOffered.includes("Other") && !customService.trim()
              ? "rounded-full mt-2 border-red-500"
              : "rounded-full mt-2"
          }
          style={{ height: 56 }}
          value={customService}
          placeholder="Enter your custom service"
          onChangeText={(text) => {
            setCustomService(text);
            if (text.trim()) {
              setErrors((e: any) => ({ ...e, servicesOffered: "" }));
            }
          }}
          autoCapitalize="words"
        />
      )}
      {errors.servicesOffered ? (
        <Text className="text-xs text-orange-500 ml-2 mt-1">{errors.servicesOffered}</Text>
      ) : null}
    </ScrollView>
  );
};
