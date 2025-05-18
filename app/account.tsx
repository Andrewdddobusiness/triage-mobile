import React, { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity, Alert, Modal, Pressable } from "react-native";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { useSession } from "~/lib/auth/ctx";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, ChevronRight } from "lucide-react-native";
import { userService } from "~/lib/services/userService";
import { supabase } from "~/lib/supabase";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function AccountScreen() {
  const { session } = useSession();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Modal states
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [businessEmailModalVisible, setBusinessEmailModalVisible] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempBusinessEmail, setTempBusinessEmail] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user) {
        try {
          // Get user profile data
          const profile = await userService.getUserProfile(session.user.id);
          setName(profile.name || "");
          setTempName(profile.name || "");

          // Get user email from auth
          setEmail(session.user.email || "");

          // Get business email if available
          const businessEmail = await userService.getBusinessEmail(session.user.id);
          // Check if businessEmail is an array and has items
          if (Array.isArray(businessEmail) && businessEmail.length > 0) {
            setBusinessEmail(businessEmail[0]); // Use the first email in the array
            setTempBusinessEmail(businessEmail[0]);
          } else if (typeof businessEmail === "string") {
            setBusinessEmail(businessEmail);
            setTempBusinessEmail(businessEmail);
          } else {
            setBusinessEmail(""); // Default to empty string
            setTempBusinessEmail("");
          }
        } catch (error) {
          setErrorMessage("Failed to load account information");
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, [session]);

  const handleSave = async () => {
    if (!session?.user) return;

    try {
      setSaving(true);
      setErrorMessage("");

      // Update service provider record
      const { data: serviceProvider, error: spError } = await supabase
        .from("service_providers")
        .select("id")
        .eq("auth_user_id", session.user.id)
        .single();

      if (spError) throw spError;

      const { data, error: updateError } = await supabase
        .from("service_providers")
        .update({
          owner_name: name,
          business_email: businessEmail && businessEmail.trim().length > 0 ? [businessEmail.trim()] : null,
        })
        .eq("id", serviceProvider.id)
        .select();

      if (updateError) {
        throw updateError;
      }

      Alert.alert("Success", "Account information updated successfully");
    } catch (error) {
      setErrorMessage(
        `Failed to update account information: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setSaving(false);
    }
  };

  const saveNameChange = () => {
    const trimmedName = tempName.trim();
    setName(trimmedName);
    setNameModalVisible(false);
    handleSaveWithValues(trimmedName, businessEmail);
  };

  const saveBusinessEmailChange = () => {
    const trimmedEmail = tempBusinessEmail.trim();
    setBusinessEmail(trimmedEmail);
    setBusinessEmailModalVisible(false);
    handleSaveWithValues(name, trimmedEmail);
  };

  const handleSaveWithValues = async (nameValue: any, emailValue: any) => {
    if (!session?.user) return;

    try {
      setSaving(true);
      setErrorMessage("");

      // Update service provider record
      const { data: serviceProvider, error: spError } = await supabase
        .from("service_providers")
        .select("id")
        .eq("auth_user_id", session.user.id)
        .single();

      if (spError) throw spError;

      const { data, error: updateError } = await supabase
        .from("service_providers")
        .update({
          owner_name: nameValue,
          business_email: emailValue && emailValue.trim().length > 0 ? [emailValue.trim()] : null,
        })
        .eq("id", serviceProvider.id)
        .select();

      if (updateError) {
        throw updateError;
      }

      Alert.alert("Success", "Account information updated successfully");
    } catch (error) {
      setErrorMessage(
        `Failed to update account information: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className="bg-zinc-100"
    >
      {/* Header */}
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#495057" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-[#495057]">Account</Text>
      </View>

      <ScrollView className="flex-1">
        {loading ? (
          <View className="items-center justify-center py-8">
            <Text className="text-gray-500">Loading account information...</Text>
          </View>
        ) : (
          <>
            {/* Error message */}
            {errorMessage ? (
              <View className="mb-4 p-3 bg-red-100 rounded-full mx-4">
                <Text className="text-red-500">{errorMessage}</Text>
              </View>
            ) : null}

            {/* Account Items */}
            <View className="mt-4 bg-white rounded-md">
              {/* Name */}
              <TouchableOpacity
                className="flex-row items-center justify-between p-4 border-b border-gray-100"
                onPress={() => setNameModalVisible(true)}
              >
                <View>
                  <Text className="text-gray-500 text-sm">Name</Text>
                  <Text className="text-[#495057] text-base">{name}</Text>
                </View>
                <ChevronRight size={20} color="#adb5bd" />
              </TouchableOpacity>

              {/* Email (read-only) */}
              <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
                <View>
                  <Text className="text-gray-500 text-sm">Email</Text>
                  <Text className="text-[#495057] text-base">{email}</Text>
                </View>
              </View>

              {/* Business Email */}
              <TouchableOpacity
                className="flex-row items-center justify-between p-4"
                onPress={() => setBusinessEmailModalVisible(true)}
              >
                <View>
                  <Text className="text-gray-500 text-sm">Business Email</Text>
                  <Text className="text-[#495057] text-base">{businessEmail || "Add business email"}</Text>
                </View>
                <ChevronRight size={20} color="#adb5bd" />
              </TouchableOpacity>
            </View>

            {/* Delete Account Button */}
            {/* <TouchableOpacity
              className="mt-4 mb-8 bg-white p-4 rounded-md"
              onPress={() =>
                Alert.alert(
                  "Delete Account",
                  "Are you sure you want to delete your account? This action cannot be undone.",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete", style: "destructive", onPress: () => {} },
                  ]
                )
              }
            >
              <Text className="text-red-500 text-center font-semibold">Delete Account</Text>
            </TouchableOpacity> */}
          </>
        )}
      </ScrollView>

      {/* Name Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={nameModalVisible}
        onRequestClose={() => setNameModalVisible(false)}
      >
        <View className="flex-1 justify-center bg-black/50">
          <View className="bg-white mx-4 rounded-xl">
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <TouchableOpacity onPress={() => setNameModalVisible(false)}>
                <Text className="text-gray-500">Cancel</Text>
              </TouchableOpacity>
              <Text className="text-lg font-semibold">Change Name</Text>
              <TouchableOpacity onPress={saveNameChange}>
                <Text className="text-blue-500 font-semibold">Save</Text>
              </TouchableOpacity>
            </View>

            <View className="p-4">
              <Input
                value={tempName}
                onChangeText={setTempName}
                placeholder="Enter your name"
                className="bg-white text-black px-4 py-3 text-base rounded-full border border-gray-300"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Business Email Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={businessEmailModalVisible}
        onRequestClose={() => setBusinessEmailModalVisible(false)}
      >
        <View className="flex-1 justify-center bg-black/50">
          <View className="bg-white mx-4 rounded-xl">
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <TouchableOpacity onPress={() => setBusinessEmailModalVisible(false)}>
                <Text className="text-gray-500">Cancel</Text>
              </TouchableOpacity>
              <Text className="text-lg font-semibold">Change Business Email</Text>
              <TouchableOpacity onPress={saveBusinessEmailChange}>
                <Text className="text-blue-500 font-semibold">Save</Text>
              </TouchableOpacity>
            </View>

            <View className="p-4">
              <Input
                value={tempBusinessEmail}
                onChangeText={setTempBusinessEmail}
                placeholder="Enter your business email"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-white text-black px-4 py-3 text-base rounded-full border border-gray-300"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
