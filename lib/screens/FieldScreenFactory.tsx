import React, { useEffect, useMemo, useState } from "react";
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSession } from "~/lib/auth/ctx";
import { supabase } from "~/lib/supabase";
import { ArrowLeft } from "lucide-react-native";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { MultiSelectStep } from "~/components/onboarding/MultiSelectStep";
import { ServiceAreaStep } from "~/components/onboarding/ServiceAreaStep";
import { palette } from "~/lib/theme";
import { router } from "expo-router";

type FieldType = "text" | "email" | "multi" | "serviceArea";

type FieldConfig = {
  title: string;
  columnKey: "owner_name" | "business_name" | "business_email" | "services_offered" | "specialty" | "service_area";
  type: FieldType;
  placeholder?: string;
  options?: string[]; // for multi
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function createFieldScreen(config: FieldConfig) {
  return function FieldScreen() {
    const { session } = useSession();
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [multiError, setMultiError] = useState("");
    const [value, setValue] = useState("");
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [customOption, setCustomOption] = useState("");
    const [customOptions, setCustomOptions] = useState<string[]>([]);
    const [serviceAreas, setServiceAreas] = useState<string[]>([]);

    const options = useMemo(() => config.options || [], [config.options]);
    const showCustom = selectedOptions.includes("Other") || customOptions.length > 0;

    useEffect(() => {
      const load = async () => {
        if (!session?.user) return;
        try {
          const { data, error: fetchError } = await supabase
            .from("service_providers")
            .select(`${config.columnKey}`)
            .eq("auth_user_id", session.user.id)
            .single();
          if (fetchError) throw fetchError;
          const fieldValue = data?.[config.columnKey];
          if (config.type === "multi" && Array.isArray(fieldValue)) {
            const standard = fieldValue.filter((v: string) => options.includes(v) || v === "Other");
            const custom = fieldValue.filter((v: string) => !options.includes(v) && v !== "Other");
            setCustomOptions(custom);
            if (custom.length && !standard.includes("Other")) {
              standard.push("Other");
            }
            setSelectedOptions(standard);
          } else if (config.type === "serviceArea" && Array.isArray(fieldValue)) {
            setServiceAreas(fieldValue);
          } else if (typeof fieldValue === "string") {
            setValue(fieldValue);
          } else if (Array.isArray(fieldValue) && config.type === "email") {
            setValue(fieldValue[0] || "");
          }
        } catch (err) {
          console.error("Failed to load field", err);
        } finally {
          setLoading(false);
        }
      };
      load();
    }, [config.columnKey, config.type, session?.user]);

    const toggleOption = (opt: string) => {
      setMultiError("");
      if (opt === "Other") {
        setSelectedOptions((prev) => {
          const has = prev.includes("Other");
          if (has) {
            setCustomOptions([]);
            return prev.filter((o) => o !== "Other");
          }
          return [...prev, "Other"];
        });
        return;
      }
      setSelectedOptions((prev) => (prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]));
    };

    const addCustomOption = (opt: string) => {
      const trimmed = opt.trim();
      if (!trimmed) return;
      setCustomOptions((prev) => {
        if (prev.includes(trimmed)) return prev;
        return [...prev, trimmed];
      });
      if (!selectedOptions.includes("Other")) {
        setSelectedOptions((prev) => [...prev, "Other"]);
      }
      setCustomOption("");
    };

    const removeCustomOption = (opt: string) => {
      setCustomOptions((prev) => {
        const next = prev.filter((o) => o !== opt);
        if (!next.length) {
          setSelectedOptions((sel) => sel.filter((o) => o !== "Other"));
        }
        return next;
      });
    };

    const validate = () => {
      setError("");
      setMultiError("");
      if (config.type === "email") {
        const trimmed = value.trim().toLowerCase();
        if (!emailRegex.test(trimmed)) {
          setError("Please enter a valid email address");
          return false;
        }
        return true;
      }
      if (config.type === "text") {
        if (!value.trim()) {
          setError("This field cannot be empty");
          return false;
        }
        return true;
      }
        if (config.type === "multi") {
          const customTrimmed = customOptions.filter(Boolean);
          const selectedCount = selectedOptions.filter((o) => o !== "Other").length + customTrimmed.length;
          if (!selectedCount) {
            setMultiError("Please select at least one option");
            return false;
          }
          if (showCustom && !customOption.trim() && !customOptions.length) {
            setMultiError("Please specify your custom option");
            return false;
          }
          return true;
        }
      if (config.type === "serviceArea") {
        if (!serviceAreas.length) {
          setError("Please add at least one service area");
          return false;
        }
        return true;
      }
      return true;
    };

    const handleSave = async () => {
      if (!session?.user) return;
      if (!validate()) return;

      try {
        setSaving(true);
        const { data: serviceProvider, error: spError } = await supabase
          .from("service_providers")
          .select("id")
          .eq("auth_user_id", session.user.id)
          .single();
        if (spError || !serviceProvider) throw spError || new Error("No service provider");

        const payload: Record<string, unknown> = {};

        if (config.type === "email") {
          payload[config.columnKey] = value.trim() ? [value.trim().toLowerCase()] : null;
        } else if (config.type === "text") {
          payload[config.columnKey] = value.trim();
        } else if (config.type === "multi") {
          const customTrimmed = customOption.trim();
          const cleaned = selectedOptions.filter((o) => o !== "Other");
          const extras = [...customOptions];
          if (selectedOptions.includes("Other") && customTrimmed) {
            extras.push(customTrimmed);
          }
          payload[config.columnKey] = [...cleaned, ...extras];
        } else if (config.type === "serviceArea") {
          payload[config.columnKey] = serviceAreas;
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

    const renderContent = () => {
      if (config.type === "multi") {
        return (
          <View style={{ gap: 16 }}>
            <Text className="text-sm text-gray-600">Select options</Text>
            <MultiSelectStep
              options={options}
              selectedOptions={selectedOptions}
              toggleOption={toggleOption}
              showCustomInput={showCustom}
              customValue={customOption}
              setCustomValue={(text) => {
                setMultiError("");
                setCustomOption(text);
              }}
              customOptions={customOptions}
              addCustomOption={addCustomOption}
              removeCustomOption={removeCustomOption}
              customPlaceholder="Enter your custom option"
              error={multiError}
            />
          </View>
        );
      }
      if (config.type === "serviceArea") {
        return (
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
                const next = typeof updater === "function" ? updater({ serviceArea: error }) : updater;
                setError((next as any).serviceArea || "");
              }}
              validateField={() => true}
            />
            {error ? <Text className="text-xs text-orange-500 ml-1">{error}</Text> : null}
          </View>
        );
      }
      return (
        <>
          <Text className="text-sm text-gray-600 mb-2">Enter a value</Text>
          <Input
            value={value}
            onChangeText={(text) => {
              setError("");
              setValue(text);
            }}
            placeholder={config.placeholder || "Enter value"}
            keyboardType={config.type === "email" ? "email-address" : "default"}
            autoCapitalize={config.type === "email" ? "none" : "words"}
            autoCorrect={config.type !== "email"}
          />
          {error ? <Text className="text-xs text-orange-500 ml-1">{error}</Text> : null}
        </>
      );
    };

    if (loading) {
      return (
        <View style={{ flex: 1, backgroundColor: palette.surfaceMuted, paddingTop: insets.top, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={palette.primary} />
          <Text className="text-gray-500 mt-2">Loading...</Text>
        </View>
      );
    }

    return (
      <View style={{ flex: 1, backgroundColor: palette.surfaceMuted, paddingTop: insets.top }}>
        <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color="#495057" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-[#495057]">{config.title}</Text>
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
          {renderContent()}
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
            onPress={handleSave}
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
  };
}
