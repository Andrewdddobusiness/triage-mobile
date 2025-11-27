import React from "react";
import { View, ScrollView, Pressable, Linking } from "react-native";
import { Text } from "~/components/ui/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Mail, MessageCircle, ExternalLink, HelpCircle, FileText, Shield } from "lucide-react-native";
import { router } from "expo-router";

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
    <ScrollView className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-200 ">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} color="#495057" />
          </Pressable>
          <Text className="text-xl font-semibold text-[#495057]">Help & Info</Text>
        </View>
      </View>

      {/* Content */}
      <View className="p-4">
        {/* App Info Section */}
        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <Text className="text-lg font-semibold text-[#495057] mb-3">App Information</Text>
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Version</Text>
              <Text className="text-[#495057] font-medium">1.0.0</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Build</Text>
              <Text className="text-[#495057] font-medium">1.0.0</Text>
            </View>
          </View>
        </View>

        {/* Support Section */}
        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <Text className="text-lg font-semibold text-[#495057] mb-3">Support</Text>

          <Pressable onPress={handleOpenFAQ} className="flex-row items-center py-3">
            <HelpCircle size={20} color="#6b7280" />
            <View className="flex-1 ml-3">
              <Text className="text-[#495057] font-medium">FAQ</Text>
              <Text className="text-gray-500 text-sm">Frequently asked questions</Text>
            </View>
            <ExternalLink size={16} color="#6b7280" />
          </Pressable>
        </View>

        {/* Legal Section */}
        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <Text className="text-lg font-semibold text-[#495057] mb-3">Legal</Text>

          <Pressable onPress={handleOpenPrivacy} className="flex-row items-center py-3 border-b border-gray-100">
            <Shield size={20} color="#6b7280" />
            <View className="flex-1 ml-3">
              <Text className="text-[#495057] font-medium">Privacy Policy</Text>
              <Text className="text-gray-500 text-sm">Data handling and account deletion info</Text>
            </View>
            <ExternalLink size={16} color="#6b7280" />
          </Pressable>

          <Pressable
            onPress={() => router.push("/(tabs)/profile")}
            className="flex-row items-center py-3"
          >
            <FileText size={20} color="#6b7280" />
            <View className="flex-1 ml-3">
              <Text className="text-[#495057] font-medium">Delete Account</Text>
              <Text className="text-gray-500 text-sm">Profile → Delete Account (removes data and tokens)</Text>
            </View>
            <ExternalLink size={16} color="#6b7280" />
          </Pressable>

          <Pressable onPress={handleOpenTerms} className="flex-row items-center py-3">
            <FileText size={20} color="#6b7280" />
            <View className="flex-1 ml-3">
              <Text className="text-[#495057] font-medium">Terms of Service</Text>
              <Text className="text-gray-500 text-sm">Terms and conditions</Text>
            </View>
            <ExternalLink size={16} color="#6b7280" />
          </Pressable>
        </View>

        {/* About Section */}
        <View className="bg-white rounded-xl p-4 shadow-sm">
          <Text className="text-lg font-semibold text-[#495057] mb-3">About</Text>
          <Text className="text-gray-600 leading-6">
            This app helps you manage your business communications with AI-powered assistance. Get instant responses to
            customer inquiries and streamline your workflow.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
