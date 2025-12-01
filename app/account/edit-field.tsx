import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { useLocalSearchParams, router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useSession } from "~/lib/auth/ctx";
import { supabase } from "~/lib/supabase";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { palette, radii } from "~/lib/theme";
import { Button } from "~/components/ui/button";

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

  const title = params.title || "Edit";
  const field = params.field || "";
  const columnKey = FIELD_MAP[field];

  const save = async () => {
    if (!session?.user) return;
    if (!columnKey) {
      Alert.alert("Error", "Unsupported field");
      return;
    }
    try {
      setSaving(true);
      const { data: serviceProvider, error: spError } = await supabase
        .from("service_providers")
        .select("id")
        .eq("auth_user_id", session.user.id)
        .single();
      if (spError || !serviceProvider)
        throw spError || new Error("No service provider");

      // Prepare payload: arrays for multi-value fields
      const payload: Record<string, unknown> = {};
      if (columnKey === "business_email") {
        payload[columnKey] = value.trim() ? [value.trim()] : null;
      } else if (
        columnKey === "services_offered" ||
        columnKey === "specialty" ||
        columnKey === "service_area"
      ) {
        const arr = value
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
        payload[columnKey] = arr;
      } else {
        payload[columnKey] = value.trim();
      }

      const { error: updateError } = await supabase
        .from("service_providers")
        .update(payload)
        .eq("id", serviceProvider.id);
      if (updateError) throw updateError;
      Alert.alert("Saved", "Your changes have been saved.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Could not save changes"
      );
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
        <Text className="text-sm text-gray-600 mb-2">Enter a value</Text>
        <Input
          value={value}
          onChangeText={setValue}
          multiline={
            columnKey === "services_offered" ||
            columnKey === "specialty" ||
            columnKey === "service_area"
          }
          placeholder={
            columnKey === "business_email"
              ? "you@business.com"
              : columnKey === "owner_name"
              ? "Owner name"
              : columnKey === "business_name"
              ? "Business name"
              : "Comma separated values for multiple entries"
          }
        />
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
