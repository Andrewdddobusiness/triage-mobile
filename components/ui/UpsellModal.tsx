import React from "react";
import { Modal, View, Pressable } from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { X } from "lucide-react-native";

type UpsellModalProps = {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  title?: string;
  message?: string;
  priceCopy?: string;
  primaryCtaLabel?: string;
};

export function UpsellModal({
  visible,
  onClose,
  onUpgrade,
  title = "Upgrade to Spaak Pro",
  message = "Unlock calling, AI assistant, and notifications with the Pro plan.",
  priceCopy = "59 AUD/month • Cancel anytime",
  primaryCtaLabel = "Upgrade now",
}: UpsellModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-2xl p-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xl font-semibold">{title}</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <X size={22} color="#64748b" />
            </Pressable>
          </View>
          <Text className="text-gray-600 mb-2">{message}</Text>
          <Text className="text-gray-800 font-semibold mb-4">{priceCopy}</Text>
          <Button onPress={onUpgrade}>{primaryCtaLabel}</Button>
          <Pressable onPress={onClose} className="mt-3 items-center">
            <Text className="text-sm text-gray-500">Maybe later</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
