import React, { useEffect, useState } from "react";
import { View, ScrollView, Switch, Pressable, Modal, TouchableOpacity, Image, Alert, Clipboard } from "react-native";
import { Text } from "~/components/ui/text";
import { useSession } from "~/lib/auth/ctx";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Play, Phone, Bot, Copy, Check, Pencil, CheckCircle2, X } from "lucide-react-native";
import { supabase } from "~/lib/supabase";
import { router } from "expo-router";

interface AssistantPreset {
  id: string;
  name: string;
  description: string;
  avatar_url: string;
}

export default function AssistantSettingsScreen() {
  const { session } = useSession();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [assistantEnabled, setAssistantEnabled] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPreset, setCurrentPreset] = useState<AssistantPreset | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [presets, setPresets] = useState<AssistantPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchAssistantData();
    fetchPresets();
  }, [session]);

  const fetchAssistantData = async () => {
    if (!session?.user) return;

    try {
      // Get service provider ID
      const { data: serviceProvider } = await supabase
        .from("service_providers")
        .select("id")
        .eq("auth_user_id", session.user.id)
        .single();

      if (!serviceProvider) return;

      // Get assistant data with preset information
      const { data: assistant } = await supabase
        .from("service_provider_assistants")
        .select(
          `
          *,
          assistant_preset:assistant_preset_id (*)
        `
        )
        .eq("service_provider_id", serviceProvider.id)
        .single();

      if (assistant) {
        setAssistantEnabled(assistant.enabled);
        setGreeting(assistant.greeting);
        setCurrentPreset(assistant.assistant_preset);
      }

      // Get phone number
      const { data: phoneData } = await supabase
        .from("twilio_phone_numbers")
        .select("phone_number")
        .eq("assigned_to", serviceProvider.id)
        .is("is_active", true)
        .single();

      if (phoneData) {
        setPhoneNumber(phoneData.phone_number);
      }
    } catch (error) {
      console.error("Error fetching assistant data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAssistant = async () => {
    if (!session?.user) return;

    try {
      const { data: serviceProvider } = await supabase
        .from("service_providers")
        .select("id")
        .eq("auth_user_id", session.user.id)
        .single();

      if (!serviceProvider) return;

      const { error } = await supabase
        .from("service_provider_assistants")
        .update({ enabled: !assistantEnabled })
        .eq("service_provider_id", serviceProvider.id);

      if (!error) {
        setAssistantEnabled(!assistantEnabled);
      }
    } catch (error) {
      console.error("Error toggling assistant:", error);
    }
  };

  const playGreeting = () => {
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 2000);
  };

  // Reset copied state after 2 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (copied) {
      timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [copied]);

  // Copy phone number to clipboard
  const handleCopyToClipboard = () => {
    if (phoneNumber) {
      Clipboard.setString(phoneNumber);
      setCopied(true);
    }
  };

  const fetchPresets = async () => {
    const { data, error } = await supabase.from("assistant_presets").select("*");
    if (error) console.error("Error loading presets:", error);
    else setPresets(data || []);
  };

  // Add copy to clipboard functionality
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (copied) {
      timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [copied]);

  const copyToClipboard = () => {
    if (phoneNumber) {
      Clipboard.setString(phoneNumber);
      setCopied(true);
    }
  };

  const handleUpdateAssistant = async () => {
    if (!selectedPresetId || !session?.user) return;

    setUpdating(true);
    try {
      const { data: serviceProvider } = await supabase
        .from("service_providers")
        .select("id")
        .eq("auth_user_id", session.user.id)
        .single();

      if (!serviceProvider) throw new Error("No service provider found");

      const { error } = await supabase
        .from("service_provider_assistants")
        .update({ assistant_preset_id: selectedPresetId })
        .eq("service_provider_id", serviceProvider.id);

      if (error) throw error;

      // Refresh assistant data
      await fetchAssistantData();
      setModalVisible(false);
      Alert.alert("Success", "Assistant updated successfully");
    } catch (error) {
      console.error("Failed to update assistant:", error);
      Alert.alert("Error", "Could not update assistant. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        className="flex-1 bg-zinc-100"
        contentContainerStyle={{
          paddingBottom: insets.bottom + 20,
        }}
      >
        {/* Assistant Status */}
        <View className="bg-white p-4 mt-4 mx-4 rounded-lg">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-semibold">AI Assistant Status</Text>
            <Switch value={assistantEnabled} onValueChange={toggleAssistant} />
          </View>
          <Text className="text-md font-normal">Your AI Assistant is {assistantEnabled ? 'Active' : 'Offline'}</Text>
        </View>

        {/* Assistant Preset Section */}
        <View className="bg-white p-4 mt-4 mx-4 rounded-lg">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-semibold">Current Assistant</Text>
            <View className="flex-row items-center">
              <Pressable onPress={() => setModalVisible(true)} className="mr-2">
                <Pencil size={18} color="#fe885a" />
              </Pressable>
              <Bot size={20} />
            </View>
          </View>
          <Text className="text-zinc-800 text-lg mb-1">{currentPreset?.name || "No assistant selected"}</Text>
          <Text className="text-zinc-600 mb-3">{currentPreset?.description || ""}</Text>
        </View>

        {/* Phone Number Section */}
        <View className="bg-white p-4 mt-4 mx-4 rounded-lg">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-semibold">Business Phone Number</Text>
            <Phone size={20} />
          </View>
          <View className="flex-row items-center">
            <Text className="text-zinc-600">{phoneNumber || "No number assigned"}</Text>
            {phoneNumber && (
              <Pressable onPress={copyToClipboard} className="ml-2">
                {copied ? <Check size={18} color="#22c55e" /> : <Copy size={18} color="#fe885a" />}
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Preset Selection Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View className="flex-1 bg-black/50 justify-end mb-4">
          <View className="bg-white rounded-t-3xl max-h-[80%]">
            <View className="flex-row justify-between items-center p-4 border-b border-zinc-200">
              <Text className="text-xl font-semibold">Choose Assistant</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <X size={24} color="#64748b" />
              </Pressable>
            </View>

            <ScrollView className="p-4">
              <View className="flex-row flex-wrap justify-between gap-y-4">
                {presets.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <TouchableOpacity
                      key={preset.id}
                      onPress={() => setSelectedPresetId(preset.id)}
                      className={`w-[48%] aspect-square rounded-xl border-2 ${
                        isSelected ? "border-orange-500" : "border-zinc-200"
                      } relative items-center justify-center py-4 bg-zinc-50`}
                    >
                      {isSelected && (
                        <View className="absolute top-2 right-2">
                          <CheckCircle2 size={20} color="#f97316" />
                        </View>
                      )}
                      <Image source={{ uri: preset.avatar_url }} className="w-20 h-20 mb-2" />
                      <Text className="text-base font-bold text-zinc-800">{preset.name}</Text>
                      <Text className="text-xs text-zinc-600 text-center px-2">{preset.description}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View className="p-4 border-t border-zinc-200">
              <TouchableOpacity
                onPress={handleUpdateAssistant}
                disabled={!selectedPresetId || updating}
                className={`w-full py-4 rounded-full ${
                  !selectedPresetId || updating ? "bg-zinc-200" : "bg-orange-500"
                } items-center`}
              >
                <Text className={`font-semibold ${!selectedPresetId || updating ? "text-zinc-500" : "text-white"}`}>
                  {updating ? "Updating..." : "Update Assistant"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
