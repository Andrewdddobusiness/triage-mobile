import React, { useEffect, useState } from "react";
import { View, ScrollView, Image, Pressable, Clipboard } from "react-native";
import { Text } from "~/components/ui/text";
import { useSession } from "~/lib/auth/ctx";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProfileActionButton } from "~/components/ui/profile-action-button";
import { Settings, HelpCircle, MessageCircle, Pencil, LogOut, User, Copy, Check } from "lucide-react-native";
import { userService } from "~/lib/services/userService";
import { supabase } from "~/lib/supabase";

import Icon5 from "@expo/vector-icons/FontAwesome5";
import IconF from "@expo/vector-icons/FontAwesome";
import IconEn from "@expo/vector-icons/Entypo";

export default function ProfileScreen() {
  const { signOut, session } = useSession();
  const insets = useSafeAreaInsets();
  const [userProfile, setUserProfile] = useState({ name: "" });
  const [loading, setLoading] = useState(true);
  const [businessNumber, setBusinessNumber] = useState("");
  const [copied, setCopied] = useState(false);

  // Get user data from session
  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user) {
        try {
          const profile = await userService.getUserProfile(session.user.id);
          setUserProfile(profile);

          // Fetch the assigned business phone number
          const { data: serviceProvider, error: spError } = await supabase
            .from("service_providers")
            .select("id")
            .eq("auth_user_id", session.user.id)
            .single();

          if (spError) throw spError;

          const { data: phoneNumbers, error: phoneError } = await supabase
            .from("twilio_phone_numbers")
            .select("phone_number")
            .eq("assigned_to", serviceProvider.id)
            .not("assigned_at", "is", null)
            .single();

          if (!phoneError && phoneNumbers) {
            setBusinessNumber(phoneNumbers.phone_number);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, [session]);

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
  const copyToClipboard = () => {
    if (businessNumber) {
      Clipboard.setString(businessNumber);
      setCopied(true);
    }
  };

  const defaultProfileImage = "https://ui-avatars.com/api/?name=" + userProfile.name.replace(" ", "+");

  return (
    <ScrollView
      className="flex-1 bg-zinc-100"
      contentContainerStyle={{
        paddingBottom: insets.bottom + 80,
      }}
    >
      {/* Profile Header */}
      <View className="bg-white p-6 items-center">
        {/* Profile Image with Edit Button */}
        <View className="relative">
          <View className="w-24 h-24 rounded-full bg-zinc-100 items-center justify-center">
            <User size={36} color="#adb5bd" />
          </View>
          {/* <Pressable
            className="absolute bottom-0 right-0 bg-foreground rounded-full p-1"
            onPress={() => console.log("Edit profile photo")}
          >
            <Pencil size={16} color="white" />
          </Pressable> */}
        </View>

        {/* User Info */}
        <Text className="text-xl font-semibold mt-4 text-[#495057]">{userProfile.name}</Text>

        {/* Business Phone Number */}
        {businessNumber ? (
          <View className="mt-2 items-center">
            <Text className="text-sm text-gray-500 mb-1">Provided Business Number</Text>
            <View className="flex-row items-center">
              <Text className="text-base text-[#fe885a] font-medium">{businessNumber}</Text>
              <Pressable onPress={copyToClipboard} className="ml-2">
                {copied ? <Check size={18} color="#22c55e" /> : <Copy size={18} color="#fe885a" />}
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>

      {/* Actions List */}
      <View className="mt-4 space-y-px">
        <ProfileActionButton
          label="Settings"
          icon={<Icon5 name={"cog"} size={20} color="#adb5bd" />}
          onPress={() => console.log("Settings pressed")}
        />

        <ProfileActionButton
          label="Subscription"
          icon={<Icon5 name={"splotch"} size={20} color="#adb5bd" />}
          onPress={() => console.log("Subscription pressed")}
        />

        <ProfileActionButton
          label="Help & Info"
          icon={<IconEn name={"help-with-circle"} size={20} color="#adb5bd" />}
          onPress={() => console.log("Help pressed")}
        />
        <ProfileActionButton
          label="Feedback & Support"
          icon={<IconF name={"comment"} size={20} color="#adb5bd" />}
          onPress={() => console.log("Support pressed")}
        />
        <ProfileActionButton
          label="Sign Out"
          icon={<IconF name="sign-out" size={20} color="#ef4444" />}
          onPress={signOut}
          variant="destructive"
        />
      </View>
    </ScrollView>
  );
}
