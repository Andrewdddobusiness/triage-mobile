import "react-native-get-random-values";
import React, { useEffect, useState } from "react";
import { View, Image, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Text } from "~/components/ui/text";
import { useRouter } from "expo-router";
import { AssistantPreset } from "~/lib/types/onboarding";
import { CheckCircle2 } from "lucide-react-native";
import { supabase } from "~/lib/supabase";
import { SessionProvider, useSession } from "~/lib/auth/ctx";

export default function ChoosePresetScreen() {
  const router = useRouter();
  const { session } = useSession();

  const [presets, setPresets] = useState<AssistantPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPresets = async () => {
      const { data, error } = await supabase.from("assistant_presets").select("*");
      if (error) console.error("Error loading presets:", error);
      else setPresets(data);
    };
    fetchPresets();
  }, []);

  const handleSelectPreset = (id: string) => {
    setSelectedPresetId(id);
  };

  const handleCreateAssistant = async () => {
    if (!selectedPresetId) {
      return Alert.alert("Please select an assistant to continue.");
    }

    setLoading(true);

    try {
      const selectedPreset = presets.find((p) => p.id === selectedPresetId);
      if (!selectedPreset) throw new Error("Selected preset not found.");

      const { data: serviceProvider } = await supabase
        .from("service_providers")
        .select("id")
        .eq("auth_user_id", session?.user.id)
        .single();

      if (!serviceProvider) throw new Error("No service provider found for current user.");

      const { error } = await supabase.from("service_provider_assistants").insert({
        service_provider_id: serviceProvider.id,
        assistant_preset_id: selectedPresetId,
        assistant_id: selectedPreset.assistant_id,
      });

      if (error) throw error;

      router.replace("./assignPhoneNumber");
    } catch (error) {
      console.error("Failed to create assistant:", error);
      Alert.alert("Error", "Could not create assistant. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-orange-50 pt-12">
      <ScrollView className="pt-16 px-4">
        <Text className="text-3xl font-extrabold text-orange-500 mb-4">Choose Your Assistant</Text>
        <Text className="text-lg text-orange-500 mb-6">Pick your AI assistant's vibe.</Text>

        <View className="flex-row flex-wrap justify-between gap-y-4">
          {presets.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <TouchableOpacity
                key={preset.id}
                onPress={() => handleSelectPreset(preset.id)}
                className={`w-[48%] aspect-square rounded-xl border-2 ${
                  isSelected ? "border-orange-500" : "border-white"
                } relative items-center justify-center py-4`}
                style={{ backgroundColor: "#FFF7ED" }}
              >
                {isSelected && (
                  <View className="absolute top-2 right-2">
                    <CheckCircle2 size={20} color="#f97316" />
                  </View>
                )}
                <Image source={{ uri: preset.avatar_url }} className="w-20 h-20 mb-2" />
                <Text className="text-base font-bold text-orange-500">{preset.name}</Text>
                <Text className="text-xs text-orange-400">{preset.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View className="absolute bottom-8 left-0 right-0 px-4 space-y-2 bg-orange-50 border-t border-orange-200 pt-4">
        <TouchableOpacity
          onPress={handleCreateAssistant}
          disabled={loading}
          className="w-full py-5 rounded-full bg-orange-500 items-center mb-4"
        >
          <Text className="text-white font-semibold">{loading ? "Creating..." : "Create Assistant"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleBack} className="w-full py-5 rounded-full bg-gray-200 items-center">
          <Text className="text-gray-700 font-semibold">Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
