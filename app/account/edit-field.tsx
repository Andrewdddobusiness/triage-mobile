import React, { useMemo, useState } from "react";
import { View, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Pressable } from "react-native";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { useLocalSearchParams, router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useSession } from "~/lib/auth/ctx";
import { supabase } from "~/lib/supabase";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { palette, radii } from "~/lib/theme";
import { MultiSelectStep } from "~/components/onboarding/MultiSelectStep";
import { ServiceAreaStep } from "~/components/onboarding/ServiceAreaStep";

const FIELD_MAP: Record<string, keyof typeof columnMap> = {
  ownerName: "owner_name",
  businessName: "business_name",
  businessEmail: "business_email",
  servicesOffered: "services_offered",
  specialties: "specialty",
  serviceAreas: "service_area",
};

const columnMap = {
  owner_name: "owner_name",
  business_name: "business_name",
  business_email: "business_email",
  services_offered: "services_offered",
  specialty: "specialty",
  service_area: "service_area",
};

export default function EditFieldScreen() {
  const params = useLocalSearchParams<{
    field?: string;
    title?: string;
    value?: string;
  }>();
  const { session } = useSession();
  const insets = useSafeAreaInsets();
  const [value, setValue] = useState(params.value || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [multiError, setMultiError] = useState("");

  const title = params.title || "Edit";
  const field = params.field || "";
  const columnKey = FIELD_MAP[field];

  const isMultiSelect = columnKey === "services_offered" || columnKey === "specialty";
  const isServiceArea = columnKey === "service_area";

  const servicesOfferedOptions = useMemo(
    () => ["New Builds", "Renovations", "Repairs", "Installations", "Emergency Call-Outs", "Inspections", "Custom Work", "Other"],
    []
  );
  const specialtyOptions = useMemo(
    () => ["Builder", "Electrician", "Plumber", "Carpenter", "Landscaper", "Painter", "Roofer", "Tiler", "Handyman", "Other"],
    []
  );

  const initialList = (params.value || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

  const [selectedOptions, setSelectedOptions] = useState<string[]>(isMultiSelect ? initialList : []);
  const [customOption, setCustomOption] = useState("");
  const [serviceAreas, setServiceAreas] = useState<string[]>(isServiceArea ? initialList : []);

  const toggleOption = (opt: string) => {
    setMultiError("");
    setSelectedOptions((prev) => (prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]));
  };

  const validateServiceArea = (areas: string[]) => {
    if (!areas.length) {
      setError("Please add at least one service area");
      return false;
    }
    setError("");
    return true;
  };

  const save = async () => {
    if (!session?.user) return;
    if (!columnKey) {
      Alert.alert("Error", "Unsupported field");
      return;
    }

    setError("");
    setMultiError("");
    const trimmed = value.trim();

    // Field-specific validation mirroring onboarding
    if (columnKey === "business_email") {
      const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
      if (!emailRegex.test(trimmed.toLowerCase())) {
        setError("Please enter a valid email address");
        return;
      }
    }

    if (isMultiSelect) {
      const hasSelection = selectedOptions.length > 0;
      const pickedOther = selectedOptions.includes("Other");
      const customTrimmed = customOption.trim();
      if (!hasSelection) {
        setMultiError("Please select at least one option");
        return;
      }
      if (pickedOther && !customTrimmed) {
        setMultiError("Please specify your custom option");
        return;
      }
    }

    if (isServiceArea) {
      if (serviceAreas.length === 0) {
        setError("Please add at least one service area");
        return;
      }
    }

    try {
      setSaving(true);
      const { data: serviceProvider, error: spError } = await supabase
        .from("service_providers")
        .select("id")
        .eq("auth_user_id", session.user.id)
        .single();
      if (spError || !serviceProvider) throw spError || new Error("No service provider");

      // Prepare payload: arrays for multi-value fields
      const payload: Record<string, unknown> = {};
      if (columnKey === "business_email") {
        payload[columnKey] = trimmed ? [trimmed.toLowerCase()] : null;
      } else if (columnKey === "services_offered" || columnKey === "specialty" || columnKey === "service_area") {
        if (isMultiSelect) {
          const customTrimmed = customOption.trim();
          const cleaned = selectedOptions.filter((o) => o !== "Other");
          if (selectedOptions.includes("Other") && customTrimmed) {
            cleaned.push(customTrimmed);
          }
          payload[columnKey] = cleaned;
        } else if (isServiceArea) {
          payload[columnKey] = serviceAreas;
        } else {
          const arr = trimmed
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean);
          payload[columnKey] = arr;
        }
      } else {
        payload[columnKey] = trimmed;
      }

      const { error: updateError } = await supabase
        .from("service_providers")
        .update(payload)
        .eq("id", serviceProvider.id);
      if (updateError) throw updateError;
      Alert.alert("Saved", "Your changes have been saved.", [{ text: "OK", onPress: () => router.back() }]);
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Could not save changes");
    } finally {
      setSaving(false);
    }
  };

  if (!columnKey) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: palette.surfaceMuted,
          paddingTop: insets.top,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text className="text-gray-600">Unsupported field</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: palette.surfaceMuted,
        paddingTop: insets.top,
      }}
    >
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#495057" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-[#495057]">{title}</Text>
      </View>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          padding: 16,
          paddingTop: 20,
          paddingBottom: insets.bottom + 120,
          gap: 16,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {isMultiSelect ? (
          <View style={{ gap: 16 }}>
            <Text className="text-sm text-gray-600">Select options</Text>
            <MultiSelectStep
              options={columnKey === "services_offered" ? servicesOfferedOptions : specialtyOptions}
              selectedOptions={selectedOptions}
              toggleOption={toggleOption}
              showCustomInput={selectedOptions.includes("Other")}
              customValue={customOption}
              setCustomValue={(text) => {
                setMultiError("");
                setCustomOption(text);
              }}
              customPlaceholder="Enter your custom option"
              error={multiError}
            />
          </View>
        ) : isServiceArea ? (
          <View style={{ gap: 12 }}>
            <Text className="text-sm text-gray-600">Add service areas</Text>
            <ServiceAreaStep
              serviceArea={serviceAreas}
              setServiceArea={(areas) => {
                setError("");
                setServiceAreas(areas);
              }}
              errors={{ serviceArea: error }}
              setErrors={(updater) => {
                const next =
                  typeof updater === "function" ? updater({ serviceArea: error }) : updater;
                setError((next as any).serviceArea || "");
              }}
              validateField={(_, val) => validateServiceArea(val as string[])}
            />
            {error ? <Text className="text-xs text-orange-500 ml-1">{error}</Text> : null}
          </View>
        ) : (
          <>
            <Text className="text-sm text-gray-600 mb-2">Enter a value</Text>
            <Input
              value={value}
              onChangeText={(text) => {
                setError("");
                setValue(text);
              }}
              placeholder={
                columnKey === "business_email"
                  ? "you@business.com"
                  : columnKey === "owner_name"
                  ? "Owner name"
                  : columnKey === "business_name"
                  ? "Business name"
                  : "Enter value"
              }
              keyboardType={columnKey === "business_email" ? "email-address" : "default"}
              autoCapitalize={columnKey === "business_email" ? "none" : "words"}
              autoCorrect={columnKey !== "business_email"}
            />
            {error ? <Text className="text-xs text-orange-500 ml-1">{error}</Text> : null}
          </>
        )}
      </ScrollView>
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: insets.bottom + 12,
          backgroundColor: "rgba(255,255,255,0.96)",
          borderTopWidth: 1,
          borderColor: palette.border,
        }}
      >
        <Pressable
          onPress={save}
          disabled={saving}
          className="bg-[#fe885a] rounded-lg py-4 px-8 w-full"
          style={({ pressed }) => ({
            opacity: saving ? 0.6 : pressed ? 0.9 : 1,
          })}
        >
          {saving ? (
            <View className="flex-row items-center justify-center" style={{ height: 24 }}>
              <ActivityIndicator color="#fff" />
            </View>
          ) : (
            <View className="flex-row items-center justify-center" style={{ height: 24 }}>
              <Text className="text-white font-semibold text-center text-lg">Save</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}
