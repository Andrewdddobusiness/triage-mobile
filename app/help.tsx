import React from "react";
import { View, ScrollView, Pressable, Linking } from "react-native";
import { Text } from "~/components/ui/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Mail, MessageCircle, ExternalLink, HelpCircle, FileText, Shield } from "lucide-react-native";
import { router } from "expo-router";
import { palette, shadows, radii } from "~/lib/theme";

export default function HelpScreen() {
  const insets = useSafeAreaInsets();

  const handleOpenFAQ = () => {
    Linking.openURL("https://spaak.vercel.app/support");
  };

  const handleOpenPrivacy = () => {
    Linking.openURL("https://spaak.vercel.app/privacy#mobile-deletion");
  };

  const handleOpenTerms = () => {
    Linking.openURL("https://spaak.vercel.app/terms");
  };

  return (
    <ScrollView
      className="flex-1"
      style={{ paddingTop: insets.top, backgroundColor: palette.surfaceMuted }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View
        className="px-4 py-4 border-b"
        style={{ backgroundColor: palette.surface, borderColor: palette.border, shadowOpacity: 0, elevation: 0 }}
      >
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} color={palette.textMuted} />
          </Pressable>
          <Text className="text-xl font-semibold" style={{ color: palette.text }}>
            Help & Info
          </Text>
        </View>
      </View>

      {/* Content */}
      <View className="p-4">
        {/* App Info Section */}
        <View
          className="p-4 mb-4"
          style={{ backgroundColor: palette.surface, borderRadius: radii.card, ...shadows.card }}
        >
          <Text className="text-lg font-semibold mb-3" style={{ color: palette.text }}>
            App Information
          </Text>
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text style={{ color: palette.textMuted }}>Version</Text>
              <Text style={{ color: palette.text, fontWeight: "600" }}>1.0.0</Text>
            </View>
            <View className="flex-row justify-between">
              <Text style={{ color: palette.textMuted }}>Build</Text>
              <Text style={{ color: palette.text, fontWeight: "600" }}>1.0.0</Text>
            </View>
          </View>
        </View>

        {/* Support Section */}
        <View
          className="p-4 mb-4"
          style={{ backgroundColor: palette.surface, borderRadius: radii.card, ...shadows.card }}
        >
          <Text className="text-lg font-semibold mb-3" style={{ color: palette.text }}>
            Support
          </Text>

          <Pressable onPress={handleOpenFAQ} className="flex-row items-center py-3">
            <HelpCircle size={20} color={palette.textMuted} />
            <View className="flex-1 ml-3">
              <Text style={{ color: palette.text, fontWeight: "600" }}>FAQ</Text>
              <Text style={{ color: palette.textMuted, fontSize: 12 }}>Frequently asked questions</Text>
            </View>
            <ExternalLink size={16} color={palette.textMuted} />
          </Pressable>
        </View>

        {/* Legal Section */}
        <View
          className="p-4 mb-4"
          style={{ backgroundColor: palette.surface, borderRadius: radii.card, ...shadows.card }}
        >
          <Text className="text-lg font-semibold mb-3" style={{ color: palette.text }}>
            Legal
          </Text>

          <Pressable onPress={handleOpenPrivacy} className="flex-row items-center py-3 border-b border-gray-100">
            <Shield size={20} color={palette.textMuted} />
            <View className="flex-1 ml-3">
              <Text style={{ color: palette.text, fontWeight: "600" }}>Privacy Policy</Text>
              <Text style={{ color: palette.textMuted, fontSize: 12 }}>Data handling and account deletion info</Text>
            </View>
            <ExternalLink size={16} color={palette.textMuted} />
          </Pressable>

          <Pressable
            onPress={() => router.push("/(tabs)/profile")}
            className="flex-row items-center py-3"
          >
            <FileText size={20} color={palette.textMuted} />
            <View className="flex-1 ml-3">
              <Text style={{ color: palette.text, fontWeight: "600" }}>Delete Account</Text>
              <Text style={{ color: palette.textMuted, fontSize: 12 }}>Profile → Delete Account (removes data and tokens)</Text>
            </View>
            <ExternalLink size={16} color={palette.textMuted} />
          </Pressable>

          <Pressable onPress={handleOpenTerms} className="flex-row items-center py-3">
            <FileText size={20} color={palette.textMuted} />
            <View className="flex-1 ml-3">
              <Text style={{ color: palette.text, fontWeight: "600" }}>Terms of Service</Text>
              <Text style={{ color: palette.textMuted, fontSize: 12 }}>Terms and conditions</Text>
            </View>
            <ExternalLink size={16} color={palette.textMuted} />
          </Pressable>
        </View>

        {/* About Section */}
        <View className="p-4" style={{ backgroundColor: palette.surface, borderRadius: radii.card, ...shadows.card }}>
          <Text className="text-lg font-semibold mb-3" style={{ color: palette.text }}>
            About
          </Text>
          <Text style={{ color: palette.textMuted, lineHeight: 22 }}>
            This app helps you manage your business communications with AI-powered assistance. Get instant responses to
            customer inquiries and streamline your workflow.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
