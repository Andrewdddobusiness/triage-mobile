import React, { useEffect, useState } from "react";
import { View, ScrollView, Switch, Pressable, Modal, TouchableOpacity, Image, Alert } from "react-native";
import { Text } from "~/components/ui/text";
import { useSession } from "~/lib/auth/ctx";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Play, Phone, Bot, Copy, Check, Pencil, CheckCircle2, X, AlertTriangle } from "lucide-react-native";
import { supabase } from "~/lib/supabase";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { trackEvent } from "~/lib/utils/analytics";
import { palette, radii, shadows } from "~/lib/theme";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { notify } from "~/lib/utils/notify";
import { copySensitiveToClipboard } from "~/lib/utils/piiClipboard";
import { maskPhone } from "~/lib/utils/pii";
import { UpsellModal } from "~/components/ui/UpsellModal";
import { haptics } from "~/lib/utils/haptics";

interface AssistantPreset {
  id: string;
  name: string;
  description: string;
  avatar_url: string;
}

export default function AssistantSettingsScreen() {
  const { session, hasActiveSubscription } = useSession();
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
  const [togglingAssistant, setTogglingAssistant] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasBusinessNumber, setHasBusinessNumber] = useState(false);
  const [checkingBusinessNumber, setCheckingBusinessNumber] = useState(true);
  const [showUpsell, setShowUpsell] = useState(false);
  const isGated = !hasActiveSubscription;

  useEffect(() => {
    checkBusinessNumber();
  }, [session]);

  const checkBusinessNumber = async () => {
    if (!session?.user) {
      setCheckingBusinessNumber(false);
      return;
    }

    try {
      const { data: serviceProvider, error: spError } = await supabase
        .from("service_providers")
        .select("id")
        .eq("auth_user_id", session.user.id)
        .single();

      if (spError) throw spError;

      const { data: phoneNumbers, error: phoneError } = await supabase
        .from("twilio_phone_numbers")
        .select("*")
        .eq("assigned_to", serviceProvider.id)
        .not("assigned_at", "is", null);

      if (phoneError) throw phoneError;

      setHasBusinessNumber(phoneNumbers && phoneNumbers.length > 0);
    } catch (error) {
      console.error("Error checking business number:", error);
      setHasBusinessNumber(false);
    } finally {
      setCheckingBusinessNumber(false);
    }
  };

  const navigateToPhoneNumber = async () => {
    haptics.impact(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/onboarding-assistant/assignPhoneNumber");
  };

  useEffect(() => {
    fetchAssistantData();
    fetchPresets();
    trackEvent("assistant_settings_viewed", { hasActiveSubscription, hasBusinessNumber });
  }, [session]);

  useEffect(() => {
    if (!checkingBusinessNumber && !hasBusinessNumber) {
      trackEvent("assistant_gate_impression", { reason: "missing_business_number" });
    }
  }, [checkingBusinessNumber, hasBusinessNumber]);

  useEffect(() => {
    if (isGated) {
      trackEvent("assistant_gate_impression", { reason: "subscription" });
    }
  }, [isGated]);

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
        // Only set assistant as enabled if they have a business number
        setAssistantEnabled(assistant.enabled && hasBusinessNumber && !isGated);
        setGreeting(assistant.greeting);
        setCurrentPreset(assistant.assistant_preset);
        setSelectedPresetId(assistant.assistant_preset?.id || null);
      }

      // Get phone number
      const { data: phoneData } = await supabase
        .from("twilio_phone_numbers")
        .select("phone_number")
        .eq("assigned_to", serviceProvider.id)
        .not("assigned_at", "is", null)
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
    if (!session?.user || !hasBusinessNumber || isGated) {
      if (!hasBusinessNumber) {
        trackEvent("assistant_toggle_blocked", { reason: "missing_business_number" });
        Alert.alert("Business Phone Required", "Set up a business phone number to activate your AI assistant.", [
          { text: "Cancel", style: "cancel" },
          { text: "Set Up Phone", onPress: navigateToPhoneNumber },
        ]);
      } else if (isGated) {
        trackEvent("assistant_toggle_blocked", { reason: "subscription" });
        setShowUpsell(true);
      }
      return;
    }

    if (togglingAssistant) return;
    setTogglingAssistant(true);

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

      if (error) throw error;

      const nextEnabled = !assistantEnabled;
      setAssistantEnabled(nextEnabled);
      haptics.success();
      trackEvent("assistant_toggle_success", { enabled: nextEnabled });
      notify(nextEnabled ? "AI assistant enabled." : "AI assistant disabled.");
    } catch (error) {
      console.error("Error toggling assistant:", error);
      trackEvent("assistant_toggle_error", { message: (error as Error)?.message });
      Alert.alert("Error", "Could not update assistant status. Please try again.");
    } finally {
      setTogglingAssistant(false);
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

  const copyBusinessNumber = async () => {
    if (phoneNumber) {
      const didCopy = await copySensitiveToClipboard(phoneNumber, "Business phone number");
      if (didCopy) {
        setCopied(true);
      }
    }
  };

  const fetchPresets = async () => {
    const { data, error } = await supabase.from("assistant_presets").select("*");
    if (error) console.error("Error loading presets:", error);
    else setPresets(data || []);
  };

  const handleUpdateAssistant = async () => {
    if (!selectedPresetId || !session?.user) return;

    const previousPresetId = currentPreset?.id || null;
    setUpdating(true);
    trackEvent("assistant_preset_update_attempt", { presetId: selectedPresetId });
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

      // Optimistically update current preset before refetching
      const nextPreset = presets.find((p) => p.id === selectedPresetId) || currentPreset;
      setCurrentPreset(nextPreset || null);

      await fetchAssistantData();
      setModalVisible(false);
      notify("Assistant updated");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      trackEvent("assistant_preset_update_success", { presetId: selectedPresetId });
    } catch (error) {
      console.error("Failed to update assistant:", error);
      setSelectedPresetId(previousPresetId);
      if (previousPresetId) {
        const previousPreset = presets.find((p) => p.id === previousPresetId);
        setCurrentPreset(previousPreset || null);
      }
      trackEvent("assistant_preset_update_error", { presetId: selectedPresetId, message: (error as Error)?.message });
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
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: insets.bottom + 20,
          backgroundColor: palette.surfaceMuted,
        }}
      >
        {/* Business Phone Number Requirement Notice */}
        {!hasBusinessNumber && (
          <View className="bg-amber-50 border border-amber-200 p-4 mt-4 mx-4 rounded-lg">
            <View className="flex-row items-center mb-2">
              <AlertTriangle size={20} color="#f59e0b" />
              <Text className="text-amber-800 font-semibold ml-2">Setup Required</Text>
            </View>
            <Text className="text-amber-700">
              You need to set up a business phone number before you can activate your AI assistant.
            </Text>
            <TouchableOpacity
              onPress={() => {
                trackEvent("assistant_gated_cta_click", { cta: "assign_phone_banner" });
                navigateToPhoneNumber();
              }}
              className="mt-2"
            >
              <Text className="text-orange-500 font-semibold">Set up now</Text>
            </TouchableOpacity>
          </View>
        )}
        {isGated && (
          <View className="bg-amber-50 border border-amber-200 p-4 mt-4 mx-4 rounded-lg">
            <View className="flex-row items-center mb-2">
              <AlertTriangle size={20} color="#f59e0b" />
              <Text className="text-amber-800 font-semibold ml-2">Upgrade Required</Text>
            </View>
            <Text className="text-amber-700">
              Upgrade to Pro to enable and customize your AI assistant. You can still view your current setup.
            </Text>
            <TouchableOpacity
              onPress={() => {
                trackEvent("assistant_gated_cta_click", { cta: "upgrade_subscription_banner" });
                router.replace("/onboarding-assistant/payment");
              }}
              className="mt-3"
            >
              <Text className="text-orange-500 font-semibold">Upgrade to Pro</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Assistant Status */}
        <Card style={{ marginHorizontal: 16, marginTop: 16 }}>
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-semibold text-gray-900">AI Assistant Status</Text>
            <Switch
              value={assistantEnabled && hasBusinessNumber && !isGated}
              onValueChange={toggleAssistant}
              disabled={!hasBusinessNumber || isGated || togglingAssistant}
            />
          </View>
          <Text className="text-md font-normal text-gray-700">
            Your AI Assistant is {assistantEnabled && hasBusinessNumber && !isGated ? "Active" : "Offline"}
          </Text>
          {!hasBusinessNumber && (
            <Text className="text-sm text-amber-600 mt-1">Requires business phone number to activate</Text>
          )}
          {isGated && (
            <Text className="text-sm text-amber-600 mt-1">Requires Pro subscription to activate</Text>
          )}
        </Card>

        {/* Assistant Preset Section */}
        <Card style={{ marginHorizontal: 16, marginTop: 12 }}>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-semibold text-gray-900">Current Assistant</Text>
            <View className="flex-row items-center">
              <Bot size={20} />
            </View>
          </View>
          <Text className="text-zinc-800 text-lg mb-1">{currentPreset?.name || "No assistant selected"}</Text>
          <Text className="text-zinc-600 mb-3">
            {currentPreset?.description || (isGated ? "Preview available assistants." : "")}
          </Text>
          <Button
            variant={isGated ? "secondary" : "primary"}
            onPress={() => {
              setModalVisible(true);
              trackEvent("assistant_preset_modal_opened");
            }}
            disabled={isGated}
            style={{ alignSelf: "flex-start", marginTop: 8, shadowOpacity: 0 }}
          >
            {isGated ? "Upgrade to change" : "Change assistant"}
          </Button>
        </Card>

        {/* Phone Number Section */}
        <Card style={{ marginHorizontal: 16, marginTop: 12 }}>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-semibold text-gray-900">Business Phone Number</Text>
            <Phone size={20} />
          </View>
          <View className="flex-row items-center">
            <Text className="text-zinc-600">
              {phoneNumber ? maskPhone(phoneNumber) : "No number assigned"}
            </Text>
            {phoneNumber && (
              <Pressable onPress={() => void copyBusinessNumber()} className="ml-2">
                {copied ? <Check size={18} color="#22c55e" /> : <Copy size={18} color="#fe885a" />}
              </Pressable>
            )}
          </View>
          <Text className="text-xs text-gray-400 mt-1">
            Full number is hidden to reduce accidental sharing. Copy when you need to paste it elsewhere.
          </Text>
        </Card>

      </ScrollView>

      <UpsellModal
        visible={showUpsell}
        onClose={() => setShowUpsell(false)}
        onUpgrade={() => {
          setShowUpsell(false);
          router.replace("/onboarding-assistant/payment");
        }}
        message="Activate your AI assistant, assign a business number, and unlock calling with Spaak Pro."
      />

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
                      onPress={() => {
                        setSelectedPresetId(preset.id);
                        trackEvent("assistant_preset_selected", { presetId: preset.id });
                      }}
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
                disabled={!selectedPresetId || updating || isGated || !hasBusinessNumber}
                className={`w-full py-4 rounded-full ${
                  !selectedPresetId || updating || isGated || !hasBusinessNumber ? "bg-zinc-200" : "bg-orange-500"
                } items-center`}
              >
                <Text
                  className={`font-semibold ${
                    !selectedPresetId || updating || isGated || !hasBusinessNumber ? "text-zinc-500" : "text-white"
                  }`}
                >
                  {updating
                    ? "Updating..."
                    : isGated
                      ? "Upgrade to change"
                      : !hasBusinessNumber
                        ? "Assign number first"
                        : "Update Assistant"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
